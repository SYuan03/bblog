import { cp, mkdir, readFile, readdir } from "node:fs/promises";
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

async function referencedPostAssets() {
  const references = new Set();
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
      const source = path.resolve(projectRoot, decodedPath.replace(/^\/+/, ''));
      const postsRoot = path.join(projectRoot, 'posts');
      if (source.startsWith(`${postsRoot}${path.sep}`)) references.add(source);
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
  const references = await referencedPostAssets();
  let copied = 0;
  for (const source of references) {
    try {
      const relative = path.relative(projectRoot, source);
      const destination = path.join(outputRoot, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(source, destination, { force: true });
      copied += 1;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      console.warn(`Missing referenced legacy asset: ${path.relative(projectRoot, source)}`);
    }
  }

  return copied;
}

for (const directory of ["MyImgs", "lib"]) {
  await copyDirectory(directory);
}

const copiedPostAssets = await copyPostAssets();
await mkdir(path.join(outputRoot, "css"), { recursive: true });
await cp(path.join(projectRoot, "css", "hbe.style.css"), path.join(outputRoot, "css", "hbe.style.css"), { force: true });
await mkdir(path.join(outputRoot, "vendor"), { recursive: true });
await cp(
  path.join(projectRoot, "node_modules", "twikoo", "dist", "twikoo.min.js"),
  path.join(outputRoot, "vendor", "twikoo.min.js"),
  { force: true },
);

console.log(`Copied shared media, ${copiedPostAssets} referenced post assets, encrypted-post runtime, and Twikoo assets.`);
