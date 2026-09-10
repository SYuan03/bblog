import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist");
const postsRoot = path.join(projectRoot, "content", "_posts");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  }));
  return nested.flat();
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

for (const required of ["index.html", "404.html", "about/dongdong/index.html", "now/index.html", "atom.xml", "search.xml", "sitemap.xml"]) {
  if (!(await exists(path.join(outputRoot, required)))) throw new Error(`Missing build output: ${required}`);
}

const htmlFiles = (await walk(outputRoot)).filter((file) => file.endsWith(".html"));
const postFiles = htmlFiles.filter((file) => file.startsWith(path.join(outputRoot, "posts") + path.sep));
const sourcePosts = (await walk(postsRoot)).filter((file) => /\.md$/i.test(file));
if (htmlFiles.length < sourcePosts.length + 5) {
  throw new Error(`Expected at least ${sourcePosts.length + 5} HTML pages, found ${htmlFiles.length}`);
}
if (postFiles.length !== sourcePosts.length) {
  throw new Error(`Expected ${sourcePosts.length} post pages from content/_posts, found ${postFiles.length}`);
}
if (await exists(path.join(outputRoot, "shuoshuo", "index.html"))) {
  throw new Error("The retired Shuoshuo page is still being published");
}

const missing = new Set();
let legacyThemeMarkers = 0;
let preloaderElements = 0;
let unrenderedTemplates = 0;
let postCards = 0;
let incompletePostCards = 0;
let incompletePostPages = 0;
let commentGates = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  if (html.includes("Redefine v2.6.4")) legacyThemeMarkers += 1;
  if (html.includes("<%") || html.includes("%>")) unrenderedTemplates += 1;
  const $ = cheerio.load(html);
  preloaderElements += $(".preloader").length;
  commentGates += $(".comment-gate").length;
  postCards += $(".post-card").length;
  incompletePostCards += $(".post-card").toArray().filter((card) => {
    return !$(card).find(".post-card-summary").text().trim() || !$(card).find(".post-card-cover").length;
  }).length;
  if (file.startsWith(path.join(outputRoot, "posts") + path.sep)) {
    if (!$(".article-cover").length || !$(".article-deck > p").text().trim() || !$('meta[property="og:image"]').attr("content")) {
      incompletePostPages += 1;
    }
  }

  const relativeHtmlPath = path.relative(outputRoot, file).split(path.sep).join('/');
  const pageUrl = new URL(relativeHtmlPath, 'https://bblog.local/');
  for (const element of $("[src], [href], [data-src], [data-gallery-src], [poster], [srcset]").toArray()) {
    for (const attribute of ['src', 'href', 'data-src', 'data-gallery-src', 'poster', 'srcset']) {
      const raw = $(element).attr(attribute);
      if (!raw) continue;
      const values = attribute === 'srcset'
        ? raw.split(',').map((part) => part.trim().split(/\s+/)[0])
        : [raw];
      for (const value of values) {
        let url;
        try {
          url = new URL(value, pageUrl);
        } catch {
          continue;
        }
        if (url.origin !== pageUrl.origin || url.pathname === '/') continue;
        const pathname = decodeURIComponent(url.pathname);
        const localPath = path.join(outputRoot, pathname);
        if (!(await exists(localPath))) missing.add(pathname);
      }
    }
  }
}

if (legacyThemeMarkers) throw new Error(`${legacyThemeMarkers} pages still identify as Redefine 2.6.4`);
if (unrenderedTemplates) throw new Error(`${unrenderedTemplates} pages still contain unrendered EJS templates`);
if (preloaderElements) throw new Error(`${preloaderElements} pages still contain the blocking preloader`);
if (!postCards || incompletePostCards) throw new Error(`${incompletePostCards} of ${postCards} post cards lack a cover or summary`);
if (incompletePostPages) throw new Error(`${incompletePostPages} post pages lack a cover, summary, or social image`);
if (commentGates) throw new Error(`${commentGates} pages still gate comments behind a manual action`);
if (missing.size) {
  throw new Error(`Missing local assets (${missing.size}):\n${[...missing].slice(0, 30).join("\n")}`);
}

const nowHtml = await readFile(path.join(outputRoot, "now", "index.html"), "utf8");
const $now = cheerio.load(nowHtml);
if ($now(".now-page h1").length !== 1 || $now(".now-entry").length < 1) {
  throw new Error("The Now page is missing its heading or status entries");
}
if (!$now("time[datetime]").attr("datetime")) throw new Error("The Now page is missing its update date");
if (!$now('meta[name="description"]').attr("content") || !$now('meta[property="og:image"]').attr("content")) {
  throw new Error("The Now page is missing social metadata");
}
if ($now('.site-nav a[aria-current="page"]').attr("href") !== "/now/") {
  throw new Error("The Now page navigation item is not active");
}

const atomXml = await readFile(path.join(outputRoot, "atom.xml"), "utf8");
if (/<img\b[^>]*\bdata-src=/i.test(atomXml) || /<img\b[^>]*\bsrc=["'][^"']*loading\.svg/i.test(atomXml)) {
  throw new Error("The Atom feed still contains browser-only lazy image placeholders");
}

const sitemapXml = await readFile(path.join(outputRoot, "sitemap.xml"), "utf8");
const sitemapPaths = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
  const url = new URL(match[1].replace(/&amp;/g, '&'));
  return decodeURIComponent(url.pathname);
});
const pollutedSitemapPaths = sitemapPaths.filter((pathname) => pathname === '/404.html' || pathname.endsWith('/manifest.json'));
if (pollutedSitemapPaths.length) {
  throw new Error(`Sitemap contains non-indexable files: ${pollutedSitemapPaths.join(', ')}`);
}
const uppercaseSitemapPaths = sitemapPaths.filter((pathname) => /[A-Z]/.test(pathname));
if (uppercaseSitemapPaths.length) {
  throw new Error(`Sitemap contains mixed-case URLs: ${uppercaseSitemapPaths.slice(0, 10).join(', ')}`);
}

const manifest = JSON.parse(await readFile(path.join(projectRoot, "content", "_migration-manifest.json"), "utf8"));
const normalizeText = (value) => value.replace(/\s+/g, " ").trim();
const normalizeLegacyText = (value) => normalizeText(value)
  .replace("https://syding.njuse.icu/atom.xml", "https://bblog.031105.xyz/atom.xml");
let legacyCommentPathChecks = 0;
let currentCommentPathChecks = 0;
for (const post of manifest) {
  const legacyHtml = await readFile(path.join(projectRoot, post.source), "utf8");
  const generatedPath = post.permalink.replace(/[A-Z]/g, (character) => character.toLowerCase());
  const generatedHtml = await readFile(path.join(outputRoot, generatedPath.slice(1)), "utf8");
  const $generated = cheerio.load(generatedHtml);
  const legacyText = normalizeLegacyText(cheerio.load(legacyHtml)(".article-content.markdown-body").first().text());
  const generatedText = normalizeText($generated(".article-content.markdown-body").first().text());
  if (legacyText !== generatedText) throw new Error(`Migrated article text differs: ${post.permalink}`);

  const renderedCommentPath = $generated("[data-comments-path]").attr("data-comments-path");
  if (renderedCommentPath) {
    const usesLegacyRedirect = /[A-Z]/.test(post.permalink);
    const expectedCommentPath = usesLegacyRedirect ? generatedPath.replace(/\.html$/i, "") : generatedPath;
    if (decodeURI(renderedCommentPath) !== expectedCommentPath) {
      throw new Error(`Unexpected comment path for ${post.permalink}: ${renderedCommentPath}`);
    }
    if (usesLegacyRedirect) legacyCommentPathChecks += 1;
    else currentCommentPathChecks += 1;
  }
}

if (!legacyCommentPathChecks || !currentCommentPathChecks) {
  throw new Error("Comment path compatibility checks did not cover both migrated and current URL shapes");
}

console.log(`Validated ${htmlFiles.length} HTML pages, including ${postFiles.length} posts with text parity and ${legacyCommentPathChecks + currentCommentPathChecks} comment paths.`);
