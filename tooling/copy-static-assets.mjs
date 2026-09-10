import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist");
const excludedFromPublish = new Set([
  "MyImgs/avatar1.jpg",
  "MyImgs/home-bg-dark.png",
  "MyImgs/home-bg-dark.webp",
  "MyImgs/home-bg-light.png",
  "MyImgs/home-bg-light.webp",
  "MyImgs/home-bg2-light.jpg",
  "MyImgs/wallhaven-5gx3e1.jpg",
  "MyImgs/wallhaven-5gx3e1.webp",
]);

async function copyDirectory(name) {
  const source = path.join(projectRoot, name);
  const destination = path.join(outputRoot, name);
  try {
    await cp(source, destination, {
      recursive: true,
      force: true,
      filter: (candidate) => !excludedFromPublish.has(path.relative(projectRoot, candidate).split(path.sep).join("/")),
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function walkFiles(directory) {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(source));
      continue;
    }
    files.push(source);
  }
  return files;
}

const portablePath = (filename) => filename.split(path.sep).join('/').normalize('NFC');
const pathLookupKey = (filename) => portablePath(filename).toLowerCase();

async function indexPostAssets() {
  const postsRoot = path.join(projectRoot, 'posts');
  const index = new Map();
  for (const source of await walkFiles(postsRoot)) {
    const relative = portablePath(path.relative(projectRoot, source));
    const key = pathLookupKey(relative);
    const existing = index.get(key);
    if (existing && existing !== source) {
      throw new Error(`Legacy assets differ only by letter case: ${relative}`);
    }
    index.set(key, source);
  }
  return index;
}

async function referencedPostAssets(assetIndex) {
  const references = new Map();
  const htmlFiles = (await walkFiles(outputRoot)).filter((filename) => filename.endsWith(".html"));
  const attributePattern = /(?:src|href|poster|data-src|srcset)\s*=\s*(["'])(.*?)\1/gi;
  const cssUrlPattern = /url\(\s*(["']?)([^'"\)]+)\1\s*\)/gi;

  const record = (candidate, pageUrl) => {
    const values = String(candidate || '').split(',').map((part) => part.trim().split(/\s+/)[0]);
    for (const value of values) {
      if (!value || value.startsWith('data:')) continue;
      let url;
      try {
        url = new URL(value.replace(/&amp;/g, '&'), pageUrl);
      } catch {
        continue;
      }
      if (url.origin !== pageUrl.origin || !url.pathname.startsWith('/posts/') || /\.html?$/i.test(url.pathname)) continue;
      let decodedPath;
      try {
        decodedPath = decodeURIComponent(url.pathname);
      } catch {
        continue;
      }
      const relative = portablePath(decodedPath.replace(/^\/+/, ''));
      const source = path.resolve(projectRoot, relative);
      const postsRoot = path.join(projectRoot, 'posts');
      if (source.startsWith(`${postsRoot}${path.sep}`)) {
        references.set(relative, assetIndex.get(pathLookupKey(relative)) || source);
      }
    }
  };

  for (const filename of htmlFiles) {
    const relative = path.relative(outputRoot, filename).split(path.sep).join('/');
    const pageUrl = new URL(relative, 'https://bblog.local/');
    const html = await readFile(filename, 'utf8');
    for (const match of html.matchAll(attributePattern)) record(match[2], pageUrl);
    for (const match of html.matchAll(cssUrlPattern)) record(match[2], pageUrl);
  }
  return references;
}

async function copyPostAssets() {
  const references = await referencedPostAssets(await indexPostAssets());
  let copied = 0;
  let caseAdjusted = 0;
  const missing = [];
  for (const [relative, source] of references) {
    try {
      const destination = path.join(outputRoot, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(source, destination, { force: true });
      if (portablePath(path.relative(projectRoot, source)) !== relative) caseAdjusted += 1;
      copied += 1;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      missing.push(relative);
    }
  }

  if (missing.length) {
    throw new Error(`Missing referenced legacy assets (${missing.length}):\n${missing.join('\n')}`);
  }

  return { copied, caseAdjusted };
}

async function fixFeedImages() {
  const feedPath = path.join(outputRoot, 'atom.xml');
  let feed;
  try {
    feed = await readFile(feedPath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return 0;
    throw error;
  }

  let fixed = 0;
  const rewritten = feed.replace(/<entry>[\s\S]*?<\/entry>/g, (entry) => {
    const link = entry.match(/<link\s+href=(['"])(.*?)\1[^>]*\/>/i)?.[2];
    if (!link) return entry;

    return entry.replace(/<img\b[^>]*>/gi, (tag) => {
      const dataSource = tag.match(/\sdata-src=(['"])(.*?)\1/i)?.[2];
      if (!dataSource) return tag;

      let absolute;
      try {
        const source = dataSource.replace(/&amp;/g, '&');
        const candidate = new URL(source, link.replace(/&amp;/g, '&'));
        if (!['http:', 'https:'].includes(candidate.protocol)) return tag;
        absolute = candidate.href.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      } catch {
        return tag;
      }

      let result = tag
        .replace(/\sdata-src=(['"])(.*?)\1/i, '')
        .replace(/\slazyload(?:=(['"])(.*?)\1)?/i, '');
      if (/\ssrc=(['"])(.*?)\1/i.test(result)) {
        result = result.replace(/\ssrc=(['"])(.*?)\1/i, ` src="${absolute}"`);
      } else {
        result = result.replace(/>$/, ` src="${absolute}">`);
      }
      fixed += 1;
      return result;
    });
  });

  await writeFile(feedPath, rewritten);
  return fixed;
}

for (const directory of ["MyImgs", "lib"]) {
  await copyDirectory(directory);
}

const { copied: copiedPostAssets, caseAdjusted: caseAdjustedPostAssets } = await copyPostAssets();
const fixedFeedImages = await fixFeedImages();
await mkdir(path.join(outputRoot, "css"), { recursive: true });
await cp(path.join(projectRoot, "css", "hbe.style.css"), path.join(outputRoot, "css", "hbe.style.css"), { force: true });
await mkdir(path.join(outputRoot, "vendor"), { recursive: true });
await cp(
  path.join(projectRoot, "node_modules", "twikoo", "dist", "twikoo.min.js"),
  path.join(outputRoot, "vendor", "twikoo.min.js"),
  { force: true },
);

console.log(`Copied shared media, ${copiedPostAssets} referenced post assets (${caseAdjustedPostAssets} case-adjusted), fixed ${fixedFeedImages} feed images, encrypted-post runtime, and Twikoo assets.`);
