import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rasterPattern = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const tree = execFileSync("git", ["-c", "core.quotepath=false", "ls-tree", "-r", "-z", "HEAD"], {
  cwd: projectRoot,
  encoding: "utf8",
});
const media = tree.split("\0").filter(Boolean).map((line) => {
  const match = line.match(/^\d+\s+blob\s+([0-9a-f]+)\t(.+)$/);
  return match ? { oid: match[1], relativePath: match[2] } : null;
}).filter((entry) => entry && rasterPattern.test(entry.relativePath));

function blobOid(buffer) {
  return createHash("sha1").update(`blob ${buffer.length}\0`).update(buffer).digest("hex");
}

async function isValid(file, expectedOid) {
  try {
    await access(file);
    return blobOid(await readFile(file)) === expectedOid;
  } catch {
    return false;
  }
}

async function download(entry) {
  const destination = path.join(projectRoot, entry.relativePath);
  if (await isValid(destination, entry.oid)) return "cached";

  const encodedPath = entry.relativePath.split("/").map(encodeURIComponent).join("/");
  const url = `https://bblog.031105.xyz/${encodedPath}`;
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const actualOid = blobOid(buffer);
      if (actualOid !== entry.oid) throw new Error(`SHA-1 mismatch: expected ${entry.oid}, got ${actualOid}`);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, buffer);
      execFileSync("git", ["hash-object", "-w", destination], { cwd: projectRoot, stdio: "ignore" });
      return "downloaded";
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 750));
    }
  }
  throw new Error(`${entry.relativePath}: ${lastError.message}`);
}

let cursor = 0;
let downloaded = 0;
let cached = 0;
const failures = [];
const workers = Array.from({ length: 48 }, async () => {
  while (cursor < media.length) {
    const entry = media[cursor++];
    try {
      const result = await download(entry);
      if (result === "downloaded") downloaded += 1;
      else cached += 1;
      const complete = downloaded + cached + failures.length;
      if (complete % 50 === 0 || complete === media.length) {
        console.log(`Media ${complete}/${media.length} (${downloaded} downloaded, ${cached} cached)`);
      }
    } catch (error) {
      failures.push(error.message);
    }
  }
});

await Promise.all(workers);
if (failures.length) throw new Error(`Failed media (${failures.length}):\n${failures.join("\n")}`);
console.log(`Verified all ${media.length} media files against the Git tree.`);
