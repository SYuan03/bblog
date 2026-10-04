const requestHeaders = {
  Referer: "https://music.163.com/",
  "User-Agent": "Mozilla/5.0 (compatible; ChrisDingBlog/1.0; +https://bblog.031105.xyz/)",
};

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400",
  "X-Content-Type-Options": "nosniff",
};

function lyricText(section) {
  return typeof section?.lyric === "string" ? section.lyric : "";
}

export default async (request) => {
  const songId = new URL(request.url).searchParams.get("id") || "";
  if (!/^\d{1,18}$/.test(songId)) {
    return new Response(JSON.stringify({ error: "无效的歌曲编号" }), {
      status: 400,
      headers: { ...responseHeaders, "Cache-Control": "no-store" },
    });
  }

  try {
    const upstream = await fetch(`https://music.163.com/api/song/lyric?id=${songId}&lv=-1&tv=-1&rv=-1&kv=-1&yv=-1`, {
      headers: requestHeaders,
      signal: AbortSignal.timeout(8_000),
    });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);

    const payload = await upstream.json();
    const original = lyricText(payload.lrc);
    const translation = lyricText(payload.tlyric);
    const romanized = lyricText(payload.romalrc);
    const wordByWord = lyricText(payload.yrc);

    return new Response(JSON.stringify({
      songId: Number(songId),
      noLyric: Boolean(payload.nolyric || payload.uncollected || !original.trim()),
      pureMusic: Boolean(payload.pureMusic),
      original,
      translation,
      romanized,
      wordByWord,
    }), { status: 200, headers: responseHeaders });
  } catch (error) {
    console.error("NetEase lyric fetch failed", error);
    return new Response(JSON.stringify({ error: "歌词暂时无法读取" }), {
      status: 502,
      headers: { ...responseHeaders, "Cache-Control": "no-store" },
    });
  }
};
