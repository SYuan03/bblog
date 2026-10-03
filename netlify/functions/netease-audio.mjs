const responseHeaders = {
  "Cache-Control": "private, max-age=300",
  "X-Content-Type-Options": "nosniff",
};

export default async (request) => {
  try {
    const songId = new URL(request.url).searchParams.get("id") || "";
    if (!/^\d{1,20}$/.test(songId)) {
      return new Response("Invalid song ID", { status: 400, headers: responseHeaders });
    }

    const upstream = await fetch(`https://music.163.com/song/media/outer/url?id=${songId}.mp3`, {
      redirect: "manual",
      headers: {
        Referer: "https://music.163.com/",
        "User-Agent": "Mozilla/5.0 (compatible; ChrisDingBlog/1.0; +https://bblog.031105.xyz/)",
      },
      signal: AbortSignal.timeout(8_000),
    });
    const location = upstream.headers.get("location");
    if (!location) throw new Error(`upstream did not redirect (${upstream.status})`);

    const audioUrl = new URL(location);
    const allowedHost = audioUrl.hostname === "music.126.net" || audioUrl.hostname.endsWith(".music.126.net");
    if (!allowedHost || !["http:", "https:"].includes(audioUrl.protocol)) throw new Error("unexpected audio host");
    audioUrl.protocol = "https:";

    return new Response(null, {
      status: 302,
      headers: { ...responseHeaders, Location: audioUrl.href },
    });
  } catch (error) {
    console.error("NetEase audio URL resolution failed", error);
    return new Response("This song is unavailable", { status: 502, headers: responseHeaders });
  }
};
