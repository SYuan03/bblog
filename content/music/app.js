const els = {
  drawButton: document.querySelector('#drawButton'),
  drawAgainButton: document.querySelector('#drawAgainButton'),
  copyButton: document.querySelector('#copyButton'),
  songList: document.querySelector('#songList'),
  sourceStatus: document.querySelector('#sourceStatus'),
  playlistCover: document.querySelector('#playlistCover'),
  playlistName: document.querySelector('#playlistName'),
  trackCount: document.querySelector('#trackCount'),
  playableCount: document.querySelector('#playableCount'),
  updateTime: document.querySelector('#updateTime'),
  playerShell: document.querySelector('#playerShell'),
  playerPlaceholder: document.querySelector('#playerPlaceholder'),
  playerActive: document.querySelector('#playerActive'),
  audioPlayer: document.querySelector('#audioPlayer'),
  nowPlayingTitle: document.querySelector('#nowPlayingTitle'),
  nowPlayingArtist: document.querySelector('#nowPlayingArtist'),
  qualityBadge: document.querySelector('#qualityBadge'),
  lyricToggle: document.querySelector('#lyricToggle'),
  lyricsPanel: document.querySelector('#lyricsPanel'),
  lyricsViewport: document.querySelector('#lyricsViewport'),
  lyricsLines: document.querySelector('#lyricsLines'),
  lyricsStatus: document.querySelector('#lyricsStatus'),
  stopButton: document.querySelector('#stopButton'),
  toast: document.querySelector('#toast'),
};

const state = {
  recentIds: [],
  currentSongs: [],
  playingId: null,
  lyricCache: new Map(),
  lyricLines: [],
  activeLyricIndex: -1,
  lyricRequest: null,
  lyricsExpanded: true,
  fallback: null,
  busy: false,
  toastTimer: null,
};

function secureRandomIndex(max) {
  if (max <= 1) return 0;
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const values = new Uint32Array(1);
  do crypto.getRandomValues(values); while (values[0] >= limit);
  return values[0] % max;
}

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = secureRandomIndex(index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function chooseTen(songs) {
  const unique = [...new Map(songs.map((song) => [Number(song.id), song])).values()];
  const recent = new Set(state.recentIds);
  const fresh = shuffle(unique.filter((song) => !recent.has(Number(song.id))));
  const repeated = shuffle(unique.filter((song) => recent.has(Number(song.id))));
  const chosen = [...fresh, ...repeated].slice(0, 10);
  if (chosen.length < 10) throw new Error('歌单中的可用歌曲不足 10 首');
  state.recentIds = [...chosen.map((song) => Number(song.id)), ...state.recentIds].slice(0, 30);
  return chosen;
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '未知';
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function albumImage(url) {
  if (!url) return '';
  return `${url}${url.includes('?') ? '&' : '?'}param=160y160`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}

function parseLrc(rawLyric) {
  if (!rawLyric) return [];
  const offsetMatch = rawLyric.match(/^\[offset:([+-]?\d+)\]/im);
  const offset = Number(offsetMatch?.[1] || 0) / 1000;
  const timePattern = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  const lines = [];

  rawLyric.split(/\r?\n/).forEach((sourceLine) => {
    const matches = [...sourceLine.matchAll(timePattern)];
    if (!matches.length) return;
    const text = sourceLine.replace(timePattern, '').trim();
    if (!text) return;
    matches.forEach((match) => {
      const fractionText = match[3] || '';
      const fraction = fractionText ? Number(fractionText) / (10 ** fractionText.length) : 0;
      lines.push({
        time: Math.max(0, (Number(match[1]) * 60) + Number(match[2]) + fraction + offset),
        text,
      });
    });
  });

  return lines.sort((left, right) => left.time - right.time);
}

function lineNear(lines, time) {
  let nearest = null;
  let distance = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    const nextDistance = Math.abs(line.time - time);
    if (nextDistance < distance) {
      nearest = line;
      distance = nextDistance;
    }
    if (line.time > time && nextDistance > distance) break;
  }
  return distance <= 0.45 ? nearest?.text || '' : '';
}

function normalizeLyrics(payload) {
  const originals = parseLrc(payload.original);
  const translations = parseLrc(payload.translation);
  const romanized = parseLrc(payload.romanized);
  return originals.map((line) => ({
    ...line,
    translation: lineNear(translations, line.time),
    romanized: lineNear(romanized, line.time),
  }));
}

function setLyricsExpanded(expanded) {
  state.lyricsExpanded = expanded;
  els.lyricsPanel.hidden = !expanded || state.playingId === null;
  els.lyricToggle.textContent = expanded ? '收起歌词' : '显示歌词';
  els.lyricToggle.setAttribute('aria-expanded', String(expanded));
  if (expanded && state.playingId !== null) syncLyrics(els.audioPlayer.currentTime, true);
}

function showLyricsMessage(message) {
  state.lyricLines = [];
  state.activeLyricIndex = -1;
  els.lyricsLines.innerHTML = `<li class="lyrics-message">${escapeHtml(message)}</li>`;
  els.lyricsViewport.scrollTop = 0;
}

function renderLyrics(lines) {
  state.lyricLines = lines;
  state.activeLyricIndex = -1;
  els.lyricsLines.innerHTML = lines.map((line, index) => {
    const secondary = line.translation && line.translation !== line.text
      ? line.translation
      : line.romanized && line.romanized !== line.text ? line.romanized : '';
    return `<li class="lyric-line" data-lyric-index="${index}"><span>${escapeHtml(line.text)}</span>${secondary ? `<small>${escapeHtml(secondary)}</small>` : ''}</li>`;
  }).join('');
  syncLyrics(els.audioPlayer.currentTime, true);
}

function lyricIndexAt(time) {
  let low = 0;
  let high = state.lyricLines.length - 1;
  let result = -1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (state.lyricLines[middle].time <= time + 0.08) {
      result = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return result;
}

function syncLyrics(time, force = false) {
  if (!state.lyricLines.length) return;
  const nextIndex = lyricIndexAt(time);
  if (!force && nextIndex === state.activeLyricIndex) return;
  state.activeLyricIndex = nextIndex;
  els.lyricsLines.querySelectorAll('.is-active').forEach((line) => line.classList.remove('is-active'));
  const active = nextIndex >= 0 ? els.lyricsLines.querySelector(`[data-lyric-index="${nextIndex}"]`) : null;
  active?.classList.add('is-active');
  if (!active || els.lyricsPanel.hidden) return;
  const top = active.offsetTop - (els.lyricsViewport.clientHeight / 2) + (active.offsetHeight / 2);
  els.lyricsViewport.scrollTo({
    top: Math.max(0, top),
    behavior: force || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
}

async function loadLyrics(song) {
  const songId = Number(song.id);
  let requestController = null;
  state.lyricRequest?.abort();
  els.lyricsStatus.textContent = '正在读取歌词…';
  showLyricsMessage('正在读取歌词…');
  setLyricsExpanded(state.lyricsExpanded);

  try {
    let payload = state.lyricCache.get(songId);
    if (!payload) {
      requestController = new AbortController();
      state.lyricRequest = requestController;
      const response = await fetch(`/.netlify/functions/netease-lyric?id=${encodeURIComponent(songId)}`, {
        cache: 'force-cache',
        signal: requestController.signal,
      });
      if (!response.ok) throw new Error(`歌词接口返回 ${response.status}`);
      payload = await response.json();
      state.lyricCache.set(songId, payload);
    }
    if (state.playingId !== songId) return;
    const lines = normalizeLyrics(payload);
    if (payload.noLyric || !lines.length) {
      els.lyricsStatus.textContent = payload.pureMusic ? '纯音乐' : '暂无滚动歌词';
      showLyricsMessage(payload.pureMusic ? '这是一首纯音乐' : '这首歌暂时没有可用歌词');
      return;
    }
    const hasTranslation = lines.some((line) => line.translation && line.translation !== line.text);
    const hasRomanized = !hasTranslation && lines.some((line) => line.romanized && line.romanized !== line.text);
    els.lyricsStatus.textContent = hasTranslation ? '原文 · 翻译' : hasRomanized ? '原文 · 罗马音' : '随播放进度自动滚动';
    renderLyrics(lines);
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.warn(error);
    if (state.playingId === songId) {
      els.lyricsStatus.textContent = '读取失败';
      showLyricsMessage('歌词暂时没有加载出来');
    }
  } finally {
    if (!requestController || state.lyricRequest === requestController) state.lyricRequest = null;
  }
}

const songControlIcon = `
  <span class="play-control">
    <svg class="play-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 6.5 17.5 12l-9 5.5Z" /></svg>
    <svg class="pause-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 7v10m7-10v10" /></svg>
  </span>`;

function renderSongs(songs) {
  state.currentSongs = songs;
  els.songList.classList.remove('is-loading');
  els.songList.setAttribute('aria-busy', 'false');
  els.songList.innerHTML = songs.map((song, index) => {
    const artists = song.artists?.join(' / ') || '未知音乐人';
    return `
      <li class="song-item${Number(song.id) === state.playingId ? ' is-active' : ''}" style="--delay:${index * 35}ms">
        <span class="song-number">${String(index + 1).padStart(2, '0')}</span>
        <button class="song-play" type="button" data-song-id="${encodeURIComponent(song.id)}" aria-label="播放 ${escapeHtml(song.name)}">
          <span class="album-cover" aria-hidden="true">
            <span>${escapeHtml(song.name).slice(0, 1)}</span>
            ${song.cover ? `<img src="${escapeHtml(albumImage(song.cover))}" alt="" loading="lazy" />` : ''}
            <i class="play-glyph">${songControlIcon}</i>
          </span>
          <span class="song-copy">
            <strong>${escapeHtml(song.name)}</strong>
            <span>${escapeHtml(artists)} · ${escapeHtml(song.album || '未知专辑')}</span>
          </span>
        </button>
        <a class="song-link" href="https://music.163.com/song?id=${encodeURIComponent(song.id)}" target="_blank" rel="noopener noreferrer" aria-label="在网易云音乐打开 ${escapeHtml(song.name)}">
          <span>网易云</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 14 14 6m0 0H8m6 0v6" /></svg>
        </a>
      </li>`;
  }).join('');

  els.songList.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => image.remove(), { once: true });
  });
  els.songList.querySelectorAll('.song-play').forEach((button) => {
    button.addEventListener('click', () => {
      const song = state.currentSongs.find((candidate) => Number(candidate.id) === Number(button.dataset.songId));
      if (song) playSong(song);
    });
  });
  els.copyButton.disabled = false;
  els.drawAgainButton.disabled = false;
}

function playSong(song) {
  if (state.playingId === Number(song.id) && els.audioPlayer.src) {
    if (els.audioPlayer.paused) els.audioPlayer.play().catch(() => showToast('浏览器阻止了自动播放，请点播放器上的播放键'));
    else els.audioPlayer.pause();
    return;
  }
  if (state.playingId !== Number(song.id) && els.audioPlayer.src) {
    els.audioPlayer.pause();
    els.audioPlayer.removeAttribute('src');
    els.audioPlayer.load();
  }
  const artists = song.artists?.join(' / ') || '未知音乐人';
  state.playingId = Number(song.id);
  els.nowPlayingTitle.textContent = song.name;
  els.nowPlayingArtist.textContent = artists;
  els.qualityBadge.textContent = '标准 · 128 kbps';
  els.playerPlaceholder.hidden = true;
  els.playerActive.hidden = false;
  els.playerShell.classList.add('is-playing');
  els.lyricsPanel.hidden = !state.lyricsExpanded;
  els.songList.querySelectorAll('.song-item').forEach((item) => item.classList.remove('is-active', 'is-playing'));
  els.songList.querySelector(`[data-song-id="${CSS.escape(String(song.id))}"]`)?.closest('.song-item')?.classList.add('is-active');
  els.audioPlayer.src = `https://music.163.com/song/media/outer/url?id=${encodeURIComponent(song.id)}.mp3`;
  els.audioPlayer.load();
  els.audioPlayer.play().catch(() => showToast('如果没有自动播放，请点播放器上的播放键'));
  loadLyrics(song);
}

function stopSong() {
  state.lyricRequest?.abort();
  state.lyricRequest = null;
  state.playingId = null;
  els.audioPlayer.pause();
  els.audioPlayer.removeAttribute('src');
  els.audioPlayer.load();
  els.playerActive.hidden = true;
  els.playerPlaceholder.hidden = false;
  els.playerShell.classList.remove('is-playing');
  els.lyricsPanel.hidden = true;
  showLyricsMessage('点一首歌后，这里会显示同步歌词');
  els.songList.querySelectorAll('.song-item').forEach((item) => item.classList.remove('is-active', 'is-playing'));
}

function updatePlaylist(payload, isFallback) {
  const playlist = payload.playlist || {};
  els.playlistName.textContent = playlist.name || 'ChrisDing1105喜欢的音乐';
  els.trackCount.textContent = Number(playlist.trackCount || payload.songs?.length || 0).toLocaleString('zh-CN');
  els.playableCount.textContent = Number(playlist.playableCount || payload.songs?.length || 0).toLocaleString('zh-CN');
  els.updateTime.textContent = formatDate(playlist.updateTime);
  els.sourceStatus.classList.toggle('is-fallback', isFallback);
  const sourceText = isFallback
    ? `本地快照 · ${Number(playlist.playableCount || payload.songs.length).toLocaleString('zh-CN')} 首可试听`
    : '已同步网易云 · 仅抽可试听歌曲';
  els.sourceStatus.innerHTML = `<i></i>${sourceText}`;
}

async function loadFallback() {
  if (state.fallback) return state.fallback;
  const response = await fetch('playlist.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('本地歌单快照不可用');
  const payload = await response.json();
  if (!Array.isArray(payload.songs) || payload.songs.length < 10) throw new Error('本地歌单快照不完整');
  state.fallback = payload;
  return payload;
}

async function loadLive() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch('/.netlify/functions/netease-liked', {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`在线同步失败：${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.songs) || payload.songs.length < 10) throw new Error('在线歌单数据不完整');
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

function setBusy(isBusy) {
  state.busy = isBusy;
  els.drawButton.disabled = isBusy;
  els.drawAgainButton.disabled = isBusy || !state.currentSongs.length;
  els.drawButton.classList.toggle('is-loading', isBusy);
  els.drawButton.querySelector('span').textContent = isBusy ? '正在抽取…' : '随机抽 10 首';
  if (isBusy) els.sourceStatus.innerHTML = '<i></i>正在同步歌单…';
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2200);
}

async function draw() {
  if (state.busy) return;
  setBusy(true);
  let payload;
  let isFallback = false;
  try {
    const fallback = await loadFallback();
    const live = await loadLive();
    const playableIds = new Set(fallback.songs.map((song) => Number(song.id)));
    const playableLiveSongs = live.songs.filter((song) => playableIds.has(Number(song.id)));
    if (playableLiveSongs.length < 10) throw new Error('在线抽样中的可试听歌曲不足');
    payload = {
      ...live,
      playlist: { ...live.playlist, playableCount: fallback.playlist.playableCount },
      songs: playableLiveSongs,
    };
  } catch (error) {
    console.warn(error);
    try {
      payload = await loadFallback();
      isFallback = true;
    } catch (fallbackError) {
      console.error(fallbackError);
      els.sourceStatus.classList.add('is-fallback');
      els.sourceStatus.innerHTML = '<i></i>歌单暂时不可用';
      showToast('歌单读取失败，请稍后再试');
      setBusy(false);
      return;
    }
  }

  try {
    updatePlaylist(payload, isFallback);
    renderSongs(chooseTen(payload.songs));
  } catch (error) {
    console.error(error);
    showToast('这次抽取失败，请再试一次');
  } finally {
    setBusy(false);
  }
}

async function copySongs() {
  if (!state.currentSongs.length) return;
  const text = state.currentSongs.map((song, index) => {
    const artists = song.artists?.join(' / ') || '未知音乐人';
    return `${index + 1}. ${song.name} — ${artists}`;
  }).join('\n');
  try {
    await navigator.clipboard.writeText(text);
    showToast('这 10 首已经复制');
  } catch {
    showToast('浏览器没有允许复制，请手动选择歌名');
  }
}

els.drawButton.addEventListener('click', draw);
els.drawAgainButton.addEventListener('click', draw);
els.copyButton.addEventListener('click', copySongs);
els.lyricToggle.addEventListener('click', () => setLyricsExpanded(!state.lyricsExpanded));
els.stopButton.addEventListener('click', stopSong);
els.audioPlayer.addEventListener('timeupdate', () => syncLyrics(els.audioPlayer.currentTime));
els.audioPlayer.addEventListener('seeked', () => syncLyrics(els.audioPlayer.currentTime, true));
els.audioPlayer.addEventListener('play', () => {
  const active = els.songList.querySelector(`[data-song-id="${CSS.escape(String(state.playingId))}"]`)?.closest('.song-item');
  active?.classList.add('is-playing');
  active?.querySelector('.song-play')?.setAttribute('aria-label', `暂停 ${state.currentSongs.find((song) => Number(song.id) === Number(state.playingId))?.name || '当前歌曲'}`);
});
els.audioPlayer.addEventListener('pause', () => {
  els.songList.querySelectorAll('.song-item').forEach((item) => item.classList.remove('is-playing'));
  els.songList.querySelectorAll('.song-play').forEach((button) => {
    const song = state.currentSongs.find((candidate) => Number(candidate.id) === Number(button.dataset.songId));
    button.setAttribute('aria-label', `播放 ${song?.name || '这首歌'}`);
  });
});
els.audioPlayer.addEventListener('error', () => {
  if (els.audioPlayer.getAttribute('src')) showToast('这首歌暂时不能播放，可以点右侧箭头去网易云');
});
draw();
