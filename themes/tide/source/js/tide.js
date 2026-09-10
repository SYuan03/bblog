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
    if (progress) progress.style.transform = `scaleX(${available > 0 ? Math.min(1, top / available) : 0})`;
  };

  let scrollFrame = 0;
  const queueScrollUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      updateScrollState();
    });
  };
  updateScrollState();
  addEventListener('scroll', queueScrollUpdate, { passive: true });

  navToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open') || false;
    navToggle.setAttribute('aria-expanded', String(open));
    const label = navToggle.querySelector('.sr-only');
    if (label) label.textContent = open ? '关闭导航' : '打开导航';
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    const label = navToggle?.querySelector('.sr-only');
    if (label) label.textContent = '打开导航';
  }));

  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('tide-theme', next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#101721' : '#f8f4ed');
  });

  backToTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  document.querySelector('[data-copy-wechat]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const value = button.dataset.copyValue || '';
    if (!value) return;
    try {
      await copyText(value);
      const label = button.querySelector('[data-copy-label]');
      if (label) label.textContent = '已复制';
      showToast('微信号已复制');
      setTimeout(() => { if (label) label.textContent = '复制'; }, 1600);
    } catch (error) {
      console.warn('Wechat copy failed', error);
      showToast('复制失败，请手动复制');
    }
  });

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
    const visiblePosts = new Set([...document.querySelectorAll('.post-card h2 a')].map((item) => sameOriginHref(item.href)));
    if (href && entry?.title && link && !visiblePosts.has(href)) {
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
    const quoteCitation = todayStrip.querySelector('[data-quote-citation]');
    const artImage = todayStrip.querySelector('[data-art-image]');
    const artLink = todayStrip.querySelector('[data-art-link]');
    const artTitleLink = todayStrip.querySelector('[data-art-title-link]');
    const artTitleZh = todayStrip.querySelector('[data-art-title-zh]');
    const artTitle = todayStrip.querySelector('[data-art-title]');
    const artMaker = todayStrip.querySelector('[data-art-maker]');
    const artOrigin = todayStrip.querySelector('[data-art-origin]');
    const artDate = todayStrip.querySelector('[data-art-date]');
    const artMedium = todayStrip.querySelector('[data-art-medium]');
    const artDetail = todayStrip.querySelector('[data-art-detail]');
    const todayStatus = todayStrip.querySelector('[data-today-status]');
    const refresh = todayStrip.querySelector('[data-today-refresh]');
    const panel = todayStrip.querySelector('[data-today-panel]');
    const panelToggle = todayStrip.querySelector('[data-today-toggle]');
    const panelToggleLabel = panelToggle?.querySelector('[data-today-toggle-label]');
    const quoteEndpoint = todayStrip.dataset.quoteApi || '';
    let artworks = [];
    try {
      artworks = JSON.parse(todayStrip.querySelector('[data-artworks-json]')?.textContent || '[]');
    } catch (error) {
      console.warn('Artwork data is unavailable', error);
    }
    const now = new Date();
    const dayKey = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    const siteDayNumber = Math.floor((Date.now() + 8 * 60 * 60 * 1000) / 86400000);
    const startIndex = artworks.length ? siteDayNumber % artworks.length : 0;
    let artOffset = 0;
    let activeRequest = 0;

    const setPanelExpanded = (expanded) => {
      if (!panel || !panelToggle) return;
      const isExpanded = Boolean(expanded);
      if (!isExpanded && panel.contains(document.activeElement)) panelToggle.focus();
      todayStrip.classList.toggle('is-collapsed', !isExpanded);
      panelToggle.setAttribute('aria-expanded', String(isExpanded));
      panelToggle.setAttribute('aria-label', isExpanded ? '收起馆藏' : '展开馆藏');
      panelToggle.title = isExpanded ? '收起馆藏' : '展开馆藏';
      if (panelToggleLabel) panelToggleLabel.textContent = isExpanded ? '收起' : '展开';
      panel.setAttribute('aria-hidden', String(!isExpanded));
      panel.inert = !isExpanded;
    };
    setPanelExpanded(panelToggle?.getAttribute('aria-expanded') !== 'false');
    panelToggle?.addEventListener('click', () => {
      setPanelExpanded(panelToggle.getAttribute('aria-expanded') !== 'true');
    });

    const safeUrl = (value, sameOriginOnly = false) => {
      try {
        const url = new URL(value, location.origin);
        if (sameOriginOnly) return url.origin === location.origin ? url.href : '';
        return url.protocol === 'https:' || url.origin === location.origin ? url.href : '';
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
      const cleanSource = String(source || '').trim();
      if (quoteSource) quoteSource.textContent = cleanSource;
      if (quoteCitation) quoteCitation.hidden = !cleanSource;
    };
    const formatQuoteSource = (author, work) => {
      const cleanAuthor = String(author || '').trim();
      const cleanWork = String(work || '').trim().replace(/^《|》$/g, '');
      if (cleanAuthor && cleanWork) return `${cleanAuthor}《${cleanWork}》`;
      if (cleanAuthor) return cleanAuthor;
      return cleanWork ? `《${cleanWork}》` : '';
    };
    const loadQuote = async (force = false, requestId = activeRequest) => {
      const cacheKey = 'tide-living-quote-v2';
      const cached = readStoredJson(cacheKey);
      if (!force && cached?.day === dayKey && cached?.text) {
        if (requestId === activeRequest) applyQuote(cached.text, cached.source);
        return true;
      }
      if (!quoteEndpoint) return false;
      try {
        const quote = await fetchJson(quoteEndpoint, 3500);
        if (!quote.hitokoto) throw new Error('Quote is unavailable');
        const source = formatQuoteSource(quote.from_who, quote.from);
        const cachedQuote = { day: dayKey, text: quote.hitokoto, source };
        if (requestId !== activeRequest) return false;
        if (!force) writeStoredJson(cacheKey, cachedQuote);
        applyQuote(cachedQuote.text, cachedQuote.source);
        return true;
      } catch (error) {
        console.warn('Daily quote failed', error);
        return false;
      }
    };
    const applyArtwork = (artwork, requestId = activeRequest) => new Promise((resolve) => {
      const imageUrl = safeUrl(artwork?.image, true);
      const objectUrl = safeUrl(artwork?.object_url);
      const primaryTitle = artwork?.title_zh || artwork?.title || '馆藏作品';
      const originalTitle = artwork?.title_zh && artwork?.title ? artwork.title : '';
      const maker = [artwork?.artist_zh, artwork?.artist].filter(Boolean).join(' · ');

      const commitArtwork = () => {
        if (artTitleZh) artTitleZh.textContent = primaryTitle;
        if (artTitle) {
          artTitle.textContent = originalTitle;
          artTitle.hidden = !originalTitle;
        }
        if (artMaker) artMaker.textContent = maker;
        if (artOrigin) artOrigin.textContent = artwork?.origin || '';
        if (artDate) artDate.textContent = artwork?.date || '';
        if (artMedium) artMedium.textContent = artwork?.medium || '';
        [artOrigin, artDate, artMedium].forEach((item) => { if (item) item.hidden = !item.textContent; });
        [artLink, artTitleLink, artDetail].forEach((link) => {
          if (!link) return;
          if (objectUrl) link.href = objectUrl;
          else link.removeAttribute('href');
        });
        if (artDetail) artDetail.hidden = !objectUrl;
        if (artLink) artLink.setAttribute('aria-label', `查看《${primaryTitle}》的馆藏详情`);
        if (artImage) {
          artImage.src = imageUrl;
          artImage.alt = `${primaryTitle}${maker ? `，${maker}` : ''}`;
        }
      };

      if (!imageUrl || !artImage) {
        resolve(false);
        return;
      }
      if (artImage.src === imageUrl) {
        commitArtwork();
        resolve(true);
        return;
      }

      todayStrip.classList.add('is-loading');
      const candidate = new Image();
      let settled = false;
      let timeout;
      const finish = (success) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        candidate.onload = null;
        candidate.onerror = null;
        todayStrip.classList.remove('is-loading');
        resolve(success);
      };
      timeout = setTimeout(() => {
        candidate.onload = null;
        candidate.onerror = null;
        candidate.src = '';
        finish(false);
      }, 3000);
      candidate.decoding = 'async';
      candidate.fetchPriority = 'low';
      candidate.onload = () => {
        if (requestId !== activeRequest) {
          finish(false);
          return;
        }
        commitArtwork();
        finish(true);
      };
      candidate.onerror = () => finish(false);
      candidate.src = imageUrl;
    });
    const loadArtwork = (requestId = activeRequest) => {
      if (!artworks.length) return Promise.resolve(false);
      const artwork = artworks[(startIndex + artOffset) % artworks.length];
      return applyArtwork(artwork, requestId);
    };

    const updateToday = async (force = false) => {
      const requestId = ++activeRequest;
      const [quoteUpdated, artworkUpdated] = await Promise.all([loadQuote(force, requestId), loadArtwork(requestId)]);
      return { quoteUpdated, artworkUpdated };
    };
    const loadInitialToday = () => {
      loadQuote(false, activeRequest);
      loadArtwork(activeRequest);
    };
    if ('requestIdleCallback' in window) requestIdleCallback(loadInitialToday, { timeout: 1800 });
    else setTimeout(loadInitialToday, 250);
    refresh?.addEventListener('click', async () => {
      if (refresh.getAttribute('aria-busy') === 'true') return;
      refresh.setAttribute('aria-busy', 'true');
      artOffset = artworks.length ? (artOffset + 1) % artworks.length : 0;
      const { quoteUpdated, artworkUpdated } = await updateToday(true);
      refresh.removeAttribute('aria-busy');
      if (todayStatus) {
        if (quoteUpdated && artworkUpdated) todayStatus.textContent = `已换一幅画和一句话：《${artTitleZh?.textContent || '新作品'}》`;
        else if (artworkUpdated) todayStatus.textContent = `已换一幅画：《${artTitleZh?.textContent || '新作品'}》；一句话暂未更新`;
        else if (quoteUpdated) todayStatus.textContent = '已换一句话；画作暂未更新';
        else todayStatus.textContent = '画作和一句话都暂未更新';
      }
      if (!quoteUpdated || !artworkUpdated) showToast(quoteUpdated || artworkUpdated ? '有一项没换成，稍后再试。' : '没换成功，稍后再试。');
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
    const commentsContainer = document.querySelector('#twikoo-comment');
    const setCommentStatus = (message) => {
      if (!commentsContainer) return;
      const status = document.createElement('div');
      status.className = 'comment-loading';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.textContent = message;
      commentsContainer.replaceChildren(status);
      commentsContainer.removeAttribute('aria-busy');
    };
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
    const initComments = async () => {
      if (!window.twikoo || comments.dataset.loaded) return;
      comments.dataset.loaded = 'true';
      try {
        await window.twikoo.init({
          envId: comments.dataset.envId,
          el: '#twikoo-comment',
          lang: 'zh-CN',
        });
        commentsContainer?.removeAttribute('aria-busy');
      } catch (error) {
        console.warn('Twikoo failed to load', error);
        setCommentStatus('留言加载失败，刷新试试。');
      }
    };
    const hydrateComments = async () => {
      try {
        await loadCommentsScript();
        await initComments();
      } catch (error) {
        console.warn('Twikoo script failed to load', error);
        setCommentStatus('留言加载失败，刷新试试。');
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

  const setSearchStatus = (message, visible = false) => {
    if (!searchStatus) return;
    searchStatus.textContent = message;
    searchStatus.classList.toggle('is-visible', visible);
  };

  const loadSearch = async () => {
    if (searchIndex) return searchIndex;
    setSearchStatus('正在加载…');
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
      setSearchStatus(`已收录 ${searchIndex.length} 篇文章`);
      return searchIndex;
    } catch (error) {
      setSearchStatus('搜索索引载入失败，请刷新后重试。', true);
      console.warn('Search index failed', error);
      return null;
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
    if (!entries) return;
    if (!query) {
      setSearchStatus(`已收录 ${entries.length} 篇文章`);
      return;
    }
    const terms = query.split(/\s+/).filter(Boolean);
    const matches = entries.map((entry) => {
      const haystack = `${entry.title} ${entry.content}`.toLocaleLowerCase('zh-CN');
      const score = terms.reduce((total, term) => total + (entry.title.toLocaleLowerCase('zh-CN').includes(term) ? 4 : haystack.includes(term) ? 1 : -10), 0);
      return { ...entry, score };
    }).filter((entry) => entry.score >= terms.length).sort((a, b) => b.score - a.score).slice(0, 12);

    setSearchStatus(matches.length ? `找到 ${matches.length} 条结果` : '没搜到，换个词试试。', !matches.length);
    matches.forEach((entry) => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = entry.url;
      const title = document.createElement('h3');
      title.textContent = entry.title;
      link.append(title);
      searchResults.append(link);
    });
  });
})();
