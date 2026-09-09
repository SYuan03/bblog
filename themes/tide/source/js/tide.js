(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const backToTop = document.querySelector('[data-back-to-top]');
  const progress = document.querySelector('.reading-progress span');
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const toast = document.querySelector('[data-toast]');
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1900);
  };

  const copyText = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const input = document.createElement('textarea');
    input.value = value;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  };

  const updateScrollState = () => {
    const top = window.scrollY;
    const available = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('is-scrolled', top > 12);
    if (backToTop) backToTop.classList.toggle('is-visible', top > 600);
    if (progress) progress.style.width = `${available > 0 ? Math.min(100, top / available * 100) : 0}%`;
  };

  updateScrollState();
  addEventListener('scroll', updateScrollState, { passive: true });

  navToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open') || false;
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('tide-theme', next);
  });

  backToTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  const lastReadKey = 'tide-last-read-v1';
  const legacyHistoryKey = 'tide-reading-history-v1';
  const readStoredJson = (key, fallback = null) => {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  };
  const writeStoredJson = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in strict privacy modes.
    }
  };
  const removeStoredValue = (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Keep the rest of the page usable when storage is unavailable.
    }
  };
  const sameOriginHref = (value) => {
    try {
      const url = new URL(value, location.origin);
      return url.origin === location.origin ? `${url.pathname}${url.search}${url.hash}` : '';
    } catch {
      return '';
    }
  };

  if (body.dataset.pageKind === 'post' && body.dataset.pagePrivate !== 'true') {
    const entry = {
      title: body.dataset.pageTitle,
      url: sameOriginHref(body.dataset.pageUrl),
      date: body.dataset.pageDate,
      visitedAt: Date.now(),
    };
    if (entry.title && entry.url) writeStoredJson(lastReadKey, entry);
  }

  const historyRow = document.querySelector('[data-reading-history]');
  if (historyRow) {
    let entry = readStoredJson(lastReadKey);
    if (!entry?.url) {
      const legacyEntries = readStoredJson(legacyHistoryKey, []);
      entry = Array.isArray(legacyEntries) ? legacyEntries[0] : null;
      if (entry?.url) writeStoredJson(lastReadKey, entry);
    }
    const href = sameOriginHref(entry?.url);
    const link = historyRow.querySelector('[data-history-last]');
    if (href && entry?.title && link) {
      link.href = href;
      link.textContent = entry.title;
      historyRow.hidden = false;
    }
    historyRow.querySelector('[data-history-clear]')?.addEventListener('click', () => {
      removeStoredValue(lastReadKey);
      removeStoredValue(legacyHistoryKey);
      historyRow.hidden = true;
      document.querySelector('[data-random-post]')?.focus();
      showToast('阅读记录已清空');
    });
  }

  const randomPosts = [...document.querySelectorAll('.random-post-sources a')]
    .map((link) => sameOriginHref(link.href))
    .filter(Boolean);
  document.querySelector('[data-random-post]')?.addEventListener('click', () => {
    if (!randomPosts.length) return;
    let previous = -1;
    try {
      previous = Number(sessionStorage.getItem('tide-random-index') || -1);
    } catch {
      // Repeating once is harmless when session storage is unavailable.
    }
    let index = Math.floor(Math.random() * randomPosts.length);
    if (randomPosts.length > 1 && index === previous) index = (index + 1) % randomPosts.length;
    try {
      sessionStorage.setItem('tide-random-index', String(index));
    } catch {
      // Navigation still works without remembering the previous index.
    }
    location.assign(randomPosts[index]);
  });

  const todayStrip = document.querySelector('[data-today-strip]');
  if (todayStrip) {
    const quoteText = todayStrip.querySelector('[data-quote-text]');
    const quoteSource = todayStrip.querySelector('[data-quote-source]');
    const artImage = todayStrip.querySelector('[data-art-image]');
    const artLink = todayStrip.querySelector('[data-art-link]');
    const artCaption = todayStrip.querySelector('[data-art-caption]');
    const refresh = todayStrip.querySelector('[data-today-refresh]');
    const artworkIds = (todayStrip.dataset.artIds || '').split(',').map(Number).filter(Number.isFinite);
    const quoteEndpoint = todayStrip.dataset.quoteApi || '';
    const artEndpoint = (todayStrip.dataset.artApi || '').replace(/\/$/, '');
    const expectedUpdates = Number(Boolean(quoteEndpoint)) + Number(Boolean(artEndpoint && artworkIds.length));
    const now = new Date();
    const dayKey = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    const dayNumber = Math.floor(new Date(`${dayKey}T00:00:00`).getTime() / 86400000);
    let artOffset = 0;
    let activeRequest = 0;

    const httpsUrl = (value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' ? url.href : '';
      } catch {
        return '';
      }
    };
    const fetchJson = async (url, timeoutMs) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } finally {
        clearTimeout(timeout);
      }
    };
    const applyQuote = (text, source) => {
      const clean = String(text || '').trim().replace(/^[“\"]+|[”\"]+$/g, '');
      if (!clean) return;
      if (quoteText) quoteText.textContent = `“${clean}”`;
      if (quoteSource) quoteSource.textContent = String(source || '佚名').trim();
    };
    const loadQuote = async (force = false, requestId = activeRequest) => {
      const cacheKey = 'tide-living-quote';
      const cached = readStoredJson(cacheKey);
      if (!force && cached?.day === dayKey && cached?.text) {
        if (requestId === activeRequest) applyQuote(cached.text, cached.source);
        return true;
      }
      if (!quoteEndpoint) return false;
      try {
        const quote = await fetchJson(quoteEndpoint, 3500);
        if (!quote.hitokoto) throw new Error('Quote is unavailable');
        const source = [quote.from_who, quote.from].filter(Boolean).join(' · ') || '佚名';
        const cachedQuote = { day: dayKey, text: quote.hitokoto, source };
        if (requestId !== activeRequest) return false;
        writeStoredJson(cacheKey, cachedQuote);
        applyQuote(cachedQuote.text, cachedQuote.source);
        return true;
      } catch (error) {
        console.warn('Daily quote failed', error);
        return false;
      }
    };
    const applyArtwork = (artwork, requestId = activeRequest) => new Promise((resolve, reject) => {
      const imageUrl = httpsUrl(artwork?.primaryImageSmall);
      if (!imageUrl || !artImage) {
        reject(new Error('Artwork image is unavailable'));
        return;
      }
      const candidate = new Image();
      const timeout = setTimeout(() => {
        candidate.src = '';
        reject(new Error('Artwork image timed out'));
      }, 5000);
      candidate.referrerPolicy = 'no-referrer';
      candidate.onload = () => {
        clearTimeout(timeout);
        if (requestId !== activeRequest) {
          resolve();
          return;
        }
        artImage.src = imageUrl;
        artImage.alt = `${artwork.title || '公版馆藏作品'}${artwork.artistDisplayName ? `，${artwork.artistDisplayName}` : ''}`;
        const objectUrl = httpsUrl(artwork.objectURL);
        if (objectUrl && artLink) artLink.href = objectUrl;
        if (objectUrl && artCaption) artCaption.href = objectUrl;
        if (artCaption) artCaption.textContent = artwork.artistDisplayName ? `馆藏：${artwork.artistDisplayName}` : '大都会艺术博物馆馆藏';
        resolve();
      };
      candidate.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Artwork image failed to load'));
      };
      candidate.src = imageUrl;
    });
    const loadArtwork = async (force = false, requestId = activeRequest) => {
      if (!artEndpoint || !artworkIds.length) return false;
      const artworkId = artworkIds[(dayNumber + artOffset) % artworkIds.length];
      const cacheKey = 'tide-daily-art-v1';
      const cached = readStoredJson(cacheKey);
      if (!force && cached?.day === dayKey && cached?.id === artworkId && cached?.artwork) {
        try {
          await applyArtwork(cached.artwork, requestId);
          return true;
        } catch {
          removeStoredValue(cacheKey);
        }
      }
      try {
        const artwork = await fetchJson(`${artEndpoint}/${artworkId}`, 5000);
        if (!artwork.isPublicDomain || !artwork.primaryImageSmall) throw new Error('Artwork is unavailable');
        const compactArtwork = {
          title: artwork.title,
          artistDisplayName: artwork.artistDisplayName,
          objectURL: artwork.objectURL,
          primaryImageSmall: artwork.primaryImageSmall,
        };
        await applyArtwork(compactArtwork, requestId);
        if (requestId !== activeRequest) return false;
        writeStoredJson(cacheKey, { day: dayKey, id: artworkId, artwork: compactArtwork });
        return true;
      } catch (error) {
        console.warn('Daily artwork failed', error);
        return false;
      }
    };

    const updateToday = async (force = false) => {
      const requestId = ++activeRequest;
      const results = await Promise.all([loadQuote(force, requestId), loadArtwork(force, requestId)]);
      return results.filter(Boolean).length;
    };
    updateToday();
    refresh?.addEventListener('click', async () => {
      if (refresh.getAttribute('aria-busy') === 'true') return;
      refresh.setAttribute('aria-busy', 'true');
      artOffset = artworkIds.length ? (artOffset + 1) % artworkIds.length : 0;
      const updated = await updateToday(true);
      refresh.removeAttribute('aria-busy');
      if (updated < expectedUpdates) showToast(updated ? '有一项没换成，稍后再试。' : '没换成功，稍后再试。');
    });
  }

  const lazyImages = document.querySelectorAll('img[data-src]');
  const hydrateImage = (image) => {
    if (!image.dataset.src) return;
    image.src = image.dataset.src;
    image.removeAttribute('data-src');
    image.removeAttribute('lazyload');
  };
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        hydrateImage(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '500px 0px' });
    lazyImages.forEach((image) => imageObserver.observe(image));
  } else {
    lazyImages.forEach(hydrateImage);
  }

  const codeBlocks = [...document.querySelectorAll('.highlight-container')];
  document.querySelectorAll('figure.highlight').forEach((figure) => {
    if (!figure.closest('.highlight-container')) codeBlocks.push(figure);
  });
  codeBlocks.forEach((block) => {
    if (block.querySelector('.copy-code')) return;
    const source = block.querySelector('.code pre, pre code, pre');
    if (!source) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = '复制';
    button.addEventListener('click', async () => {
      await copyText(source.innerText);
      button.textContent = '已复制';
      setTimeout(() => { button.textContent = '复制'; }, 1600);
    });
    block.append(button);
  });

  document.querySelector('[data-focus-toggle]')?.addEventListener('click', (event) => {
    const active = body.classList.toggle('focus-mode');
    event.currentTarget.innerHTML = active ? '<span>◑</span> 退出专注' : '<span>◐</span> 专注阅读';
  });

  document.querySelector('[data-share]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    try {
      if (navigator.share) await navigator.share({ title: document.title, url: location.href });
      else {
        await copyText(location.href);
        const original = button.innerHTML;
        button.innerHTML = '<span>✓</span> 链接已复制';
        setTimeout(() => { button.innerHTML = original; }, 1600);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') console.warn('Share failed', error);
    }
  });

  const tocLinks = [...document.querySelectorAll('.article-toc a')];
  const headings = tocLinks.map((link) => {
    try { return document.querySelector(decodeURIComponent(link.hash)); }
    catch { return null; }
  }).filter(Boolean);
  if (headings.length && 'IntersectionObserver' in window) {
    const tocObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      tocLinks.forEach((link) => link.classList.toggle('is-active', decodeURIComponent(link.hash) === `#${visible.target.id}`));
    }, { rootMargin: '-15% 0px -70%' });
    headings.forEach((heading) => tocObserver.observe(heading));
  }

  document.querySelectorAll('.article-content h2[id], .article-content h3[id]').forEach((heading) => {
    const anchor = document.createElement('button');
    anchor.type = 'button';
    anchor.className = 'heading-anchor';
    anchor.textContent = '#';
    anchor.setAttribute('aria-label', `复制“${heading.textContent.trim()}”这一节的链接`);
    anchor.addEventListener('click', async () => {
      const url = new URL(location.href);
      url.hash = heading.id;
      history.replaceState(null, '', url);
      try {
        await copyText(url.href);
        showToast('小节链接已复制');
      } catch (error) {
        console.warn('Heading link copy failed', error);
      }
    });
    heading.append(anchor);
  });

  const comments = document.querySelector('[data-comments]');
  if (comments) {
    let commentsPromise;
    const loadCommentsScript = () => {
      if (window.twikoo) return Promise.resolve();
      if (commentsPromise) return commentsPromise;
      commentsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = comments.dataset.commentsScript;
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
      });
      return commentsPromise;
    };
    const initComments = () => {
      if (!window.twikoo || comments.dataset.loaded) return;
      comments.dataset.loaded = 'true';
      window.twikoo.init({
        envId: comments.dataset.envId,
        el: '#twikoo-comment',
        lang: 'zh-CN',
      }).catch((error) => {
        console.warn('Twikoo failed to load', error);
        const container = document.querySelector('#twikoo-comment');
        if (container) container.innerHTML = '<div class="comment-loading">留言加载失败，刷新试试。</div>';
      });
    };
    const hydrateComments = async () => {
      try {
        await loadCommentsScript();
        initComments();
      } catch (error) {
        console.warn('Twikoo script failed to load', error);
        const container = document.querySelector('#twikoo-comment');
        if (container) container.innerHTML = '<div class="comment-loading">留言加载失败，刷新试试。</div>';
      }
    };
    hydrateComments();
  }

  document.querySelectorAll('[data-cover-image]').forEach((image) => {
    image.addEventListener('error', () => image.remove());
  });

  const dialog = document.querySelector('[data-search-dialog]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchStatus = document.querySelector('[data-search-status]');
  let searchIndex;

  const loadSearch = async () => {
    if (searchIndex) return searchIndex;
    searchStatus.textContent = '正在加载…';
    try {
      const response = await fetch('/search.xml');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const xml = new DOMParser().parseFromString(await response.text(), 'text/xml');
      searchIndex = [...xml.querySelectorAll('entry')].map((entry) => {
        const path = entry.querySelector('url')?.textContent || '/';
        return {
          title: entry.querySelector('title')?.textContent || '未命名',
          url: `/${path.replace(/^\/+/, '')}`,
          content: entry.querySelector('content')?.textContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '',
        };
      });
      searchStatus.textContent = `已收录 ${searchIndex.length} 篇文章`;
      return searchIndex;
    } catch (error) {
      searchStatus.textContent = '搜索索引载入失败，请刷新后重试。';
      console.warn('Search index failed', error);
      return [];
    }
  };

  const openSearch = async () => {
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    await loadSearch();
    searchInput?.focus();
  };
  const closeSearch = () => dialog?.close();

  document.querySelectorAll('[data-search-open]').forEach((button) => button.addEventListener('click', openSearch));
  document.querySelector('[data-search-close]')?.addEventListener('click', closeSearch);
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) closeSearch(); });
  addEventListener('keydown', (event) => {
    if (event.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) {
      event.preventDefault();
      openSearch();
    }
  });

  searchInput?.addEventListener('input', async () => {
    const query = searchInput.value.trim().toLocaleLowerCase('zh-CN');
    const entries = await loadSearch();
    searchResults.replaceChildren();
    if (!query) {
      searchStatus.textContent = `已收录 ${entries.length} 篇文章`;
      return;
    }
    const terms = query.split(/\s+/).filter(Boolean);
    const matches = entries.map((entry) => {
      const haystack = `${entry.title} ${entry.content}`.toLocaleLowerCase('zh-CN');
      const score = terms.reduce((total, term) => total + (entry.title.toLocaleLowerCase('zh-CN').includes(term) ? 4 : haystack.includes(term) ? 1 : -10), 0);
      return { ...entry, score };
    }).filter((entry) => entry.score >= terms.length).sort((a, b) => b.score - a.score).slice(0, 12);

    searchStatus.textContent = matches.length ? `找到 ${matches.length} 条结果` : '没搜到，换个词试试。';
    matches.forEach((entry, index) => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = entry.url;
      const number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      const copy = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = entry.title;
      const excerpt = document.createElement('p');
      excerpt.textContent = entry.content.slice(0, 110) + (entry.content.length > 110 ? '…' : '');
      copy.append(title, excerpt);
      link.append(number, copy);
      searchResults.append(link);
    });
  });
})();
