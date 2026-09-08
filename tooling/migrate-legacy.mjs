import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const legacyPostsRoot = path.join(projectRoot, "posts");
const postsOutput = path.join(projectRoot, "content", "_posts");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  }));
  return nested.flat();
}

function quoted(value) {
  return JSON.stringify(value ?? "");
}

function frontMatter({ title, permalink, date, updated, tags, categories, cover, description }) {
  const lines = [
    "---",
    `title: ${quoted(title)}`,
    `permalink: ${quoted(permalink)}`,
    `date: ${quoted(date)}`,
    `updated: ${quoted(updated || date)}`,
  ];

  if (description) lines.push(`description: ${quoted(description)}`);
  if (cover) lines.push(`cover: ${quoted(cover)}`);

  lines.push("categories:");
  for (const category of categories) lines.push(`  - ${quoted(category)}`);
  lines.push("tags:");
  for (const tag of tags) lines.push(`  - ${quoted(tag)}`);
  lines.push("comments: false", "---", "");
  return lines.join("\n");
}

function cleanDescription(value) {
  const description = value?.trim();
  if (!description || description === "false" || description.startsWith("Here's something encrypted")) return "";
  return description;
}

async function migratePosts() {
  const files = (await walk(legacyPostsRoot))
    .filter((file) => file.endsWith(".html"))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));

  await rm(postsOutput, { recursive: true, force: true });
  await mkdir(postsOutput, { recursive: true });

  const manifest = [];
  for (const [index, file] of files.entries()) {
    const source = await readFile(file, "utf8");
    const $ = cheerio.load(source);
    const relativePath = path.relative(projectRoot, file).split(path.sep).join("/");
    const article = $(".article-content.markdown-body").first();
    if (!article.length) throw new Error(`Article body not found: ${relativePath}`);

    const title = $('meta[property="og:title"]').attr("content")?.trim() || $("h1").first().text().trim();
    const date = $('meta[property="article:published_time"]').attr("content");
    const updated = $('meta[property="article:modified_time"]').attr("content") || date;
    if (!title || !date) throw new Error(`Required metadata missing: ${relativePath}`);

    const tags = $('meta[property="article:tag"]').map((_, element) => $(element).attr("content")?.trim()).get().filter(Boolean);
    const categories = $(".article-categories a").map((_, element) => $(element).text().trim()).get().filter(Boolean);
    const cover = $(".article-title > img").first().attr("src")?.trim() || "";
    const description = cleanDescription($('meta[name="description"]').attr("content"));
    const permalink = `/${relativePath}`;
    const filename = `${String(index + 1).padStart(3, "0")}-${path.basename(file, ".html")}.md`;

    const body = article.html()?.trim();
    if (!body) throw new Error(`Article content is empty: ${relativePath}`);

    const output = [
      frontMatter({ title, permalink, date, updated, tags, categories, cover, description }),
      `<!-- Migrated from ${relativePath}. Keep the permalink stable. -->`,
      '<div class="legacy-content">',
      body,
      "</div>",
      "",
    ].join("\n");

    await writeFile(path.join(postsOutput, filename), output);
    manifest.push({ source: relativePath, output: `content/_posts/${filename}`, permalink, title });
  }

  await writeFile(
    path.join(projectRoot, "content", "_migration-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}

async function migratePage(sourcePath, outputPath, title, permalink) {
  const source = await readFile(path.join(projectRoot, sourcePath), "utf8");
  const $ = cheerio.load(source);
  const content = $(".page-template-content.markdown-body").first().html()?.trim();
  if (!content) throw new Error(`Page content is empty: ${sourcePath}`);

  const modernized = content.replace(
    /https:\/\/unpkg\.com\/artitalk(?:[^"']*)?/g,
    "/vendor/artitalk.js",
  );
  const output = [
    "---",
    `title: ${quoted(title)}`,
    `permalink: ${quoted(permalink)}`,
    "comments: false",
    "---",
    "",
    `<!-- Migrated from ${sourcePath}. -->`,
    '<div class="legacy-content">',
    modernized,
    "</div>",
    "",
  ].join("\n");

  const absoluteOutput = path.join(projectRoot, outputPath);
  await mkdir(path.dirname(absoluteOutput), { recursive: true });
  await writeFile(absoluteOutput, output);
}

const manifest = await migratePosts();
await migratePage("about/index.html", "content/about/index.md", "关于我", "/about/index.html");
await migratePage("shuoshuo/index.html", "content/shuoshuo/index.md", "说说", "/shuoshuo/index.html");
console.log(`Migrated ${manifest.length} posts and 2 standalone pages.`);
