import { cp, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist");
const excludedFromPublish = new Set([
  "MyImgs/home-bg-dark.png",
  "MyImgs/home-bg-light.png",
  "MyImgs/home-bg2-light.jpg",
  "MyImgs/wallhaven-5gx3e1.jpg",
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

async function copyPostAssets(sourceDirectory = path.join(projectRoot, "posts")) {
  const entries = await readdir(sourceDirectory, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(sourceDirectory, entry.name);
    if (entry.isDirectory()) {
      await copyPostAssets(source);
      continue;
    }
    if (entry.name.endsWith(".html")) continue;

    const relative = path.relative(projectRoot, source);
    const destination = path.join(outputRoot, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(source, destination, { force: true });
  }
}

for (const directory of ["MyImgs", "MyCsss", "MyJSs", "MyLRCs", "lib"]) {
  await copyDirectory(directory);
}

await copyPostAssets();
await mkdir(path.join(outputRoot, "css"), { recursive: true });
await cp(path.join(projectRoot, "css", "hbe.style.css"), path.join(outputRoot, "css", "hbe.style.css"), { force: true });
await mkdir(path.join(outputRoot, "vendor"), { recursive: true });
await cp(
  path.join(projectRoot, "node_modules", "twikoo", "dist", "twikoo.all.min.js"),
  path.join(outputRoot, "vendor", "twikoo.all.min.js"),
  { force: true },
);

console.log("Copied legacy media, encrypted-post runtime, and Twikoo assets.");
