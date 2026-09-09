import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist");

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

for (const required of ["index.html", "404.html", "atom.xml", "search.xml", "sitemap.xml"]) {
  if (!(await exists(path.join(outputRoot, required)))) throw new Error(`Missing build output: ${required}`);
}

const htmlFiles = (await walk(outputRoot)).filter((file) => file.endsWith(".html"));
const postFiles = htmlFiles.filter((file) => file.startsWith(path.join(outputRoot, "posts") + path.sep));
// macOS uses a case-insensitive filesystem by default, so the legacy `SSL`
// and `ssl` tag archives share one output directory locally. Netlify's Linux
// builders keep both directories, producing one additional valid HTML page.
if (![143, 144].includes(htmlFiles.length)) {
  throw new Error(`Expected 143 or 144 HTML pages, found ${htmlFiles.length}`);
}
if (postFiles.length !== 44) throw new Error(`Expected 44 post pages, found ${postFiles.length}`);
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

  for (const element of $("[src], [href], [data-src]").toArray()) {
    const value = $(element).attr("src") || $(element).attr("href") || $(element).attr("data-src");
    if (!value?.startsWith("/") || value.startsWith("//")) continue;
    const pathname = decodeURIComponent(value.split(/[?#]/, 1)[0]);
    if (pathname === "/") continue;
    const localPath = path.join(outputRoot, pathname);
    if (!(await exists(localPath))) missing.add(pathname);
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

const manifest = JSON.parse(await readFile(path.join(projectRoot, "content", "_migration-manifest.json"), "utf8"));
const normalizeText = (value) => value.replace(/\s+/g, " ").trim();
for (const post of manifest) {
  const legacyHtml = await readFile(path.join(projectRoot, post.source), "utf8");
  const generatedHtml = await readFile(path.join(outputRoot, post.permalink.slice(1)), "utf8");
  const legacyText = normalizeText(cheerio.load(legacyHtml)(".article-content.markdown-body").first().text());
  const generatedText = normalizeText(cheerio.load(generatedHtml)(".article-content.markdown-body").first().text());
  if (legacyText !== generatedText) throw new Error(`Migrated article text differs: ${post.permalink}`);
}

console.log(`Validated ${htmlFiles.length} HTML pages, including ${postFiles.length} posts with text parity.`);
