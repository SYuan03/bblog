import { randomInt } from "node:crypto";

const playlistId = "5052412864";
const requestHeaders = {
  Referer: "https://music.163.com/",
  "User-Agent": "Mozilla/5.0 (compatible; ChrisDingBlog/1.0; +https://bblog.031105.xyz/)",
};

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: requestHeaders,
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`upstream ${response.status}`);
  return response.json();
}

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = randomInt(index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
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

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export default async () => {
  try {
    const detail = await fetchJson(`https://music.163.com/api/v6/playlist/detail?id=${playlistId}`);
    const playlist = detail.playlist;
    if (!playlist || !Array.isArray(playlist.trackIds) || playlist.trackIds.length < 10) {
      throw new Error("playlist unavailable");
    }

    // A broad random slice keeps each draw representative without fetching the
    // details of all 829 tracks on every click. The browser intersects this pool
    // with the checked-in list of songs currently available for web playback.
    const sampledIds = shuffle(playlist.trackIds.map((track) => Number(track.id))).slice(0, 100);
    const ids = encodeURIComponent(JSON.stringify(sampledIds));
    const songsPayload = await fetchJson(`https://music.163.com/api/song/detail?ids=${ids}`);
    const byId = new Map((songsPayload.songs || []).map((song) => [Number(song.id), normalizeSong(song)]));
    const songs = sampledIds.map((id) => byId.get(id)).filter(Boolean);
    if (songs.length < 10) throw new Error("song details unavailable");

    return new Response(JSON.stringify({
      schemaVersion: 1,
      source: "live",
      fetchedAt: new Date().toISOString(),
      playlist: {
        id: Number(playlist.id),
        name: playlist.name,
        url: `https://music.163.com/playlist?id=${playlistId}`,
        cover: String(playlist.coverImgUrl || "").replace(/^http:/, "https:"),
        trackCount: Number(playlist.trackCount || playlist.trackIds.length),
        updateTime: new Date(Number(playlist.updateTime)).toISOString(),
      },
      songs,
    }), { status: 200, headers: responseHeaders });
  } catch (error) {
    console.error("NetEase liked playlist sync failed", error);
    return new Response(JSON.stringify({ error: "暂时无法同步网易云歌单" }), {
      status: 502,
      headers: responseHeaders,
    });
  }
};
