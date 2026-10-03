import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const playlistId = "5052412864";
const playlistUrl = `https://music.163.com/playlist?id=${playlistId}`;
const outputFile = path.join(projectRoot, "content", "tools", "music-random", "playlist.json");
const requestHeaders = {
  Referer: "https://music.163.com/",
  "User-Agent": "Mozilla/5.0 (compatible; ChrisDingBlog/1.0; +https://bblog.031105.xyz/)",
};

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: requestHeaders,
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`NetEase request failed: ${response.status} ${response.statusText}`);
  return response.json();
}

function batches(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

function normalizeSong(song) {
  return {
    id: Number(song.id),
    name: song.name,
    artists: (song.artists || song.ar || []).map((artist) => artist.name).filter(Boolean),
    album: song.album?.name || song.al?.name || "未知专辑",
    cover: (song.album?.picUrl || song.al?.picUrl || "").replace(/^http:/, "https:"),
  };
}

const detail = await fetchJson(`https://music.163.com/api/v6/playlist/detail?id=${playlistId}`);
const playlist = detail.playlist;
if (!playlist || !Array.isArray(playlist.trackIds) || playlist.trackIds.length < 10) {
  throw new Error("The public playlist response did not include enough track IDs");
}

const orderedIds = playlist.trackIds.map((track) => Number(track.id));
const songsById = new Map();
for (const group of batches(orderedIds, 100)) {
  const ids = encodeURIComponent(JSON.stringify(group));
  const payload = await fetchJson(`https://music.163.com/api/song/detail?ids=${ids}`);
  for (const song of payload.songs || []) songsById.set(Number(song.id), normalizeSong(song));
}

const songs = orderedIds.map((id) => songsById.get(id)).filter(Boolean);
if (songs.length !== orderedIds.length) {
  throw new Error(`Only resolved ${songs.length} of ${orderedIds.length} songs; refusing to write a partial snapshot`);
}

const snapshot = {
  schemaVersion: 1,
  source: "snapshot",
  fetchedAt: new Date().toISOString(),
  playlist: {
    id: Number(playlist.id),
    name: playlist.name,
    url: playlistUrl,
    cover: String(playlist.coverImgUrl || "").replace(/^http:/, "https:"),
    trackCount: Number(playlist.trackCount || songs.length),
    updateTime: new Date(Number(playlist.updateTime)).toISOString(),
  },
  songs,
};

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Wrote ${songs.length} songs from “${playlist.name}” to ${path.relative(projectRoot, outputFile)}`);
