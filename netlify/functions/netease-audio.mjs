const requestHeaders = {
  Referer: "https://music.163.com/",
  "User-Agent": "Mozilla/5.0 (compatible; ChrisDingBlog/1.0; +https://bblog.031105.xyz/)",
};

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: responseHeaders });
}

export default async (request) => {
  try {
    const songId = new URL(request.url).searchParams.get("id") || "";
    if (!/^\d{1,20}$/.test(songId)) return json({ error: "Invalid song ID" }, 400);

    // Ask for the highest tier and let NetEase return the best tier currently
    // available without a user credential. In current public responses this
    // normally degrades to exhigh (320 kbps MP3).
    const ids = encodeURIComponent(`[${songId}]`);
    const upstream = await fetch(
      `https://music.163.com/api/song/enhance/player/url/v1?ids=${ids}&level=jymaster&encodeType=flac`,
      { headers: requestHeaders, signal: AbortSignal.timeout(8_000) },
    );
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);

    const payload = await upstream.json();
    const audio = payload.data?.[0];
    if (!audio?.url) throw new Error("no playable audio URL");

    const audioUrl = new URL(audio.url);
    const allowedHost = audioUrl.hostname === "music.126.net" || audioUrl.hostname.endsWith(".music.126.net");
    if (!allowedHost || !["http:", "https:"].includes(audioUrl.protocol)) throw new Error("unexpected audio host");
    audioUrl.protocol = "https:";

    return json({
      id: Number(songId),
      url: audioUrl.href,
      bitrate: Number(audio.br || 0),
      level: String(audio.level || "unknown"),
      type: String(audio.type || audio.encodeType || "audio"),
      size: Number(audio.size || 0),
    });
  } catch (error) {
    console.error("NetEase high-quality audio resolution failed", error);
    return json({ error: "High-quality audio is temporarily unavailable" }, 502);
  }
};
