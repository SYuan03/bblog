import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsRoot = path.join(projectRoot, "content", "_posts");
const coversRoot = path.join(projectRoot, "content", "generated-covers");
const responsiveRoot = path.join(coversRoot, "responsive");
const responsiveManifest = path.join(responsiveRoot, "manifest.json");
const responsiveWidths = [320, 640, 960];
const args = new Set(process.argv.slice(2));
const variantsOnly = args.has("--variants-only");

function run(command, commandArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: projectRoot,
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    const stdout = [];
    const stderr = [];
    child.stdout?.on("data", (chunk) => stdout.push(chunk));
    child.stderr?.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout: Buffer.concat(stdout).toString(), stderr: Buffer.concat(stderr).toString() });
        return;
      }
      const detail = Buffer.concat(stderr).toString().replace(/\s+/g, " ").trim().slice(0, 300);
      reject(new Error(`${command} exited with ${code}${detail ? `: ${detail}` : ""}`));
    });
  });
}

async function commandExists(command) {
  try {
    await run("which", [command], { capture: true });
    return true;
  } catch {
    return false;
  }
}

function parseFrontMatter(raw, filename) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`${filename}: missing YAML front matter.`);
  const line = match[1].match(/^cover:\s*(.*?)\s*$/m);
  if (!line) return { cover: "", replaceCover: () => raw };
  let cover = line[1];
  if ((cover.startsWith('"') && cover.endsWith('"')) || (cover.startsWith("'") && cover.endsWith("'"))) {
    cover = cover.slice(1, -1);
  }
  const body = raw.slice(match[0].length);
  return {
    cover,
    replaceCover(nextCover) {
      const nextHeader = match[1].replace(/^cover:.*$/m, `cover: ${JSON.stringify(nextCover)}`);
      const next = `${raw.slice(0, match.index)}---\n${nextHeader}\n---${body}`;
      const nextMatch = next.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!nextMatch || next.slice(nextMatch[0].length) !== body) {
        throw new Error(`${filename}: refusing to modify anything outside front matter.`);
      }
      return next;
    },
  };
}

function isRemoteCover(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function localNameForUrl(value) {
  const url = new URL(value);
  const sourceName = decodeURIComponent(path.basename(url.pathname)).replace(/\.[^.]+$/, "");
  const slug = sourceName.replace(/[^\p{Letter}\p{Number}._-]+/gu, "-").replace(/^-+|-+$/g, "") || "cover";
  const digest = createHash("sha256").update(value).digest("hex").slice(0, 8);
  return `legacy-${slug}-${digest}.webp`;
}

async function atomicWrite(filename, contents) {
  const staging = path.join(path.dirname(filename), `.${path.basename(filename)}.${randomUUID()}.tmp`);
  try {
    await writeFile(staging, contents);
    await rename(staging, filename);
  } finally {
    await unlink(staging).catch(() => {});
  }
}

async function imageInfo(imageTool, filename) {
  const commandArgs = imageTool === "magick"
    ? ["identify", "-ping", "-format", "%w %h", filename]
    : ["-ping", "-format", "%w %h", filename];
  const { stdout } = await run(imageTool === "magick" ? "magick" : "identify", commandArgs, { capture: true });
  const [width, height] = stdout.trim().split(/\s+/).map(Number);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new Error(`Could not read dimensions for ${path.basename(filename)}.`);
  }
  return { width, height };
}

async function convertOriginal(imageTool, source, destination) {
  const staging = path.join(coversRoot, `.${path.basename(destination)}.${randomUUID()}.tmp.webp`);
  const commandArgs = [
    source,
    "-auto-orient",
    "-strip",
    "-resize",
    "1536x>",
    "-quality",
    "82",
    "-define",
    "webp:method=6",
    staging,
  ];
  try {
    await run(imageTool, commandArgs, { capture: true });
    await imageInfo(imageTool, staging);
    await rename(staging, destination);
  } finally {
    await unlink(staging).catch(() => {});
  }
}

async function convertVariant(imageTool, hasCwebp, source, destination, width) {
  const staging = path.join(responsiveRoot, `.${path.basename(destination)}.${randomUUID()}.tmp.webp`);
  try {
    if (hasCwebp) {
      await run("cwebp", [
        "-quiet",
        "-q", "76",
        "-m", "6",
        "-mt",
        "-metadata", "none",
        "-resize", String(width), "0",
        source,
        "-o", staging,
      ], { capture: true });
    } else {
      await run(imageTool, [
        source,
        "-strip",
        "-resize", `${width}x`,
        "-quality", "76",
        "-define", "webp:method=6",
        staging,
      ], { capture: true });
    }
    const info = await imageInfo(imageTool, staging);
    if (info.width !== width) throw new Error(`${path.basename(destination)} is ${info.width}px wide, expected ${width}px.`);
    await rename(staging, destination);
  } finally {
    await unlink(staging).catch(() => {});
  }
}

async function localizeRemoteCovers(imageTool) {
  const filenames = (await readdir(postsRoot)).filter((name) => name.endsWith(".md")).sort();
  const groups = new Map();
  for (const filename of filenames) {
    const absolute = path.join(postsRoot, filename);
    const raw = await readFile(absolute, "utf8");
    const frontMatter = parseFrontMatter(raw, filename);
    if (!isRemoteCover(frontMatter.cover)) continue;
    const posts = groups.get(frontMatter.cover) || [];
    posts.push({ filename, absolute, raw, frontMatter });
    groups.set(frontMatter.cover, posts);
  }

  if (!groups.size) {
    console.log("No remote cover references found.");
    return { references: 0, unique: 0, localized: 0, failures: [] };
  }

  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "bblog-covers-"));
  let localized = 0;
  const failures = [];
  try {
    for (const [url, posts] of groups) {
      const localName = localNameForUrl(url);
      const localPath = path.join(coversRoot, localName);
      const publicPath = `/generated-covers/${localName}`;
      try {
        let validExisting = false;
        try {
          await access(localPath);
          await imageInfo(imageTool, localPath);
          validExisting = true;
        } catch {}

        if (!validExisting) {
          const downloaded = path.join(temporaryRoot, `${randomUUID()}.source`);
          await run("curl", [
            "--fail",
            "--location",
            "--silent",
            "--show-error",
            "--retry", "2",
            "--retry-delay", "1",
            "--connect-timeout", "15",
            "--max-time", "90",
            "--max-filesize", "31457280",
            "--proto", "=https",
            "--proto-redir", "=https",
            "--user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140 Safari/537.36",
            "--header", "Accept: image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
            "--referer", "https://bblog.031105.xyz/",
            "--output", downloaded,
            url,
          ], { capture: true });
          await imageInfo(imageTool, downloaded);
          await convertOriginal(imageTool, downloaded, localPath);
        }

        for (const post of posts) {
          const next = post.frontMatter.replaceCover(publicPath);
          await atomicWrite(post.absolute, next);
          localized += 1;
        }
        console.log(`Localized ${posts.length} reference(s) as ${localName}`);
      } catch (error) {
        failures.push({ url, posts: posts.map((post) => post.filename), message: error.message });
        console.error(`Skipped ${posts.length} reference(s) from ${new URL(url).hostname}: ${error.message}`);
      }
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }

  return {
    references: [...groups.values()].reduce((total, posts) => total + posts.length, 0),
    unique: groups.size,
    localized,
    failures,
  };
}

async function generateResponsiveVariants(imageTool, hasCwebp) {
  await mkdir(responsiveRoot, { recursive: true });
  const originals = (await readdir(coversRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".webp"))
    .map((entry) => entry.name)
    .sort();
  let generated = 0;
  let expected = 0;
  const failures = [];
  const manifest = { version: 1, covers: {} };
  for (const filename of originals) {
    const source = path.join(coversRoot, filename);
    const stem = filename.slice(0, -".webp".length);
    const sourceInfo = await imageInfo(imageTool, source);
    const variantWidths = responsiveWidths.filter((width) => width < sourceInfo.width);
    manifest.covers[stem] = { originalWidth: sourceInfo.width, variants: variantWidths };
    expected += variantWidths.length;
    for (const width of responsiveWidths) {
      const destination = path.join(responsiveRoot, `${stem}-${width}.webp`);
      if (!variantWidths.includes(width)) {
        await unlink(destination).catch(() => {});
        continue;
      }
      try {
        await convertVariant(imageTool, hasCwebp, source, destination, width);
        generated += 1;
      } catch (error) {
        failures.push({ filename, width, message: error.message });
        console.error(`Could not generate ${stem}-${width}.webp: ${error.message}`);
      }
    }
  }
  await atomicWrite(responsiveManifest, `${JSON.stringify(manifest, null, 2)}\n`);
  return { originals: originals.length, generated, expected, failures };
}

await mkdir(coversRoot, { recursive: true });
const imageTool = await commandExists("magick") ? "magick" : (await commandExists("convert") ? "convert" : "");
if (!imageTool) throw new Error("ImageMagick (`magick` or `convert`) is required.");
const hasCwebp = await commandExists("cwebp");

const localization = variantsOnly
  ? { references: 0, unique: 0, localized: 0, failures: [] }
  : await localizeRemoteCovers(imageTool);
const variants = await generateResponsiveVariants(imageTool, hasCwebp);

console.log("");
console.log(`Remote covers: ${localization.localized}/${localization.references} references localized from ${localization.unique} unique URL(s).`);
console.log(`Responsive covers: ${variants.generated}/${variants.expected} useful variants generated for ${variants.originals} originals.`);
if (localization.failures.length || variants.failures.length) {
  console.error(`Finished with ${localization.failures.length + variants.failures.length} failure(s); remote references that failed were left unchanged.`);
  process.exitCode = 1;
}
