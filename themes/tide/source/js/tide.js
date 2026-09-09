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

  const now = new Date();
  const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const liveDate = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(now);
  document.querySelectorAll('[data-live-date]').forEach((element) => { element.textContent = liveDate; });

  const dailyArt = document.querySelector('[data-daily-art]');
  if (dailyArt) {
    const image = dailyArt.querySelector('[data-art-image]');
    const button = dailyArt.querySelector('[data-art-refresh]');
    const title = dailyArt.querySelector('[data-art-title]');
    const credit = dailyArt.querySelector('[data-art-credit]');
    const sourceLink = dailyArt.querySelector('[data-art-link]');
    const endpoint = dailyArt.dataset.artApi?.replace(/\/$/, '') || '';
    const artworkIds = (dailyArt.dataset.artIds || '').split(',').map(Number).filter(Number.isFinite);
    let artOffset = Number(sessionStorage.getItem('tide-art-offset') || 0);

    const displayArtwork = (artwork, announce) => {
      if (!image || !artwork?.primaryImageSmall) return;
      const candidate = new Image();
      candidate.referrerPolicy = 'no-referrer';
      candidate.onload = () => {
        image.src = candidate.src;
        image.alt = `${artwork.title || '公版艺术作品'}${artwork.artistDisplayName ? `，${artwork.artistDisplayName}` : ''}`;
        if (title) title.textContent = artwork.title || 'THE MET COLLECTION';
        if (credit) credit.textContent = [artwork.artistDisplayName, artwork.objectDate].filter(Boolean).join(' · ') || 'The Met · 公版馆藏';
        if (sourceLink && artwork.objectURL) sourceLink.href = artwork.objectURL;
        dailyArt.classList.add('is-daily-ready');
        button?.removeAttribute('aria-busy');
        if (announce) showToast('已经换了一幅馆藏作品');
      };
      candidate.onerror = () => {
        button?.removeAttribute('aria-busy');
        if (announce) showToast('馆藏图片暂时没有回应，先保留这一幅');
      };
      candidate.src = artwork.primaryImageSmall;
    };

    const loadArtwork = async (announce = false) => {
      if (!endpoint || !artworkIds.length) return;
      const artworkId = artworkIds[(dayNumber + artOffset) % artworkIds.length];
      const cacheKey = `tide-met-art-${artworkId}`;
      button?.setAttribute('aria-busy', 'true');
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        if (cached?.primaryImageSmall) {
          displayArtwork(cached, announce);
          return;
        }
      } catch {
        localStorage.removeItem(cacheKey);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      try {
        const response = await fetch(`${endpoint}/${artworkId}`, { signal: controller.signal, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const artwork = await response.json();
        if (!artwork.isPublicDomain || !artwork.primaryImageSmall) throw new Error('Artwork is unavailable');
        const cached = {
          title: artwork.title,
          artistDisplayName: artwork.artistDisplayName,
          objectDate: artwork.objectDate,
          objectURL: artwork.objectURL,
          primaryImageSmall: artwork.primaryImageSmall,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cached));
        displayArtwork(cached, announce);
      } catch (error) {
        console.warn('Daily artwork failed', error);
        button?.removeAttribute('aria-busy');
        if (announce) showToast('馆藏服务暂时没有回应，先保留这一幅');
      } finally {
        clearTimeout(timeout);
      }
    };

    loadArtwork();
    button?.addEventListener('click', () => {
      artOffset = (artOffset + 1) % artworkIds.length;
      sessionStorage.setItem('tide-art-offset', String(artOffset));
      loadArtwork(true);
    });
  }

  const livingNote = document.querySelector('[data-living-note]');
  if (livingNote) {
    const quoteText = livingNote.querySelector('[data-quote-text]');
    const quoteSource = livingNote.querySelector('[data-quote-source]');
    const refreshButton = livingNote.querySelector('[data-quote-refresh]');
    const randomButton = livingNote.querySelector('[data-random-post]');
    const randomPosts = [...livingNote.querySelectorAll('.random-post-sources a')];
    const localQuotes = [
      ['纸上得来终觉浅，绝知此事要躬行。', '陆游'],
      ['知之者不如好之者，好之者不如乐之者。', '《论语》'],
      ['凡事预则立，不预则废。', '《礼记》'],
      ['答案不在远处，它常常藏在下一次动手里。', 'ChrisDing'],
    ];

    const applyQuote = (text, source) => {
      if (quoteText) quoteText.textContent = `“${String(text).replace(/^[“\"]|[”\"]$/g, '')}”`;
      if (quoteSource) quoteSource.textContent = source || '佚名';
    };

    const fallbackQuote = () => {
      const index = Math.abs(dayNumber) % localQuotes.length;
      applyQuote(...localQuotes[index]);
    };

    const loadQuote = async (announce = false) => {
      const endpoint = livingNote.dataset.quoteApi;
      if (!endpoint) return;
      refreshButton?.setAttribute('aria-busy', 'true');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      try {
        const response = await fetch(endpoint, { signal: controller.signal, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const quote = await response.json();
        if (!quote.hitokoto) throw new Error('Missing quote');
        const source = [quote.from_who, quote.from].filter(Boolean).join(' · ') || '佚名';
        applyQuote(quote.hitokoto, source);
        localStorage.setItem('tide-living-quote', JSON.stringify({ text: quote.hitokoto, source, day: dayNumber }));
        if (announce) showToast('换了一句，慢慢读');
      } catch (error) {
        console.warn('Living quote failed', error);
        try {
          const stale = JSON.parse(localStorage.getItem('tide-living-quote') || 'null');
          if (stale?.text) applyQuote(stale.text, stale.source);
          else fallbackQuote();
        } catch {
          fallbackQuote();
        }
        if (announce) showToast('句子服务暂时没有回应，换成了本地收藏');
      } finally {
        clearTimeout(timeout);
        refreshButton?.removeAttribute('aria-busy');
      }
    };

    try {
      const cached = JSON.parse(localStorage.getItem('tide-living-quote') || 'null');
      if (cached?.text && cached.day === dayNumber) applyQuote(cached.text, cached.source);
      else loadQuote();
    } catch {
      loadQuote();
    }
    refreshButton?.addEventListener('click', () => loadQuote(true));
    randomButton?.addEventListener('click', () => {
      if (!randomPosts.length) return;
      const previous = Number(sessionStorage.getItem('tide-random-index') || -1);
      let index = Math.floor(Math.random() * randomPosts.length);
      if (randomPosts.length > 1 && index === previous) index = (index + 1) % randomPosts.length;
      sessionStorage.setItem('tide-random-index', String(index));
      location.href = randomPosts[index].href;
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -30px' });
    revealItems.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight * .92) item.classList.add('is-visible');
      else {
        item.classList.add('reveal-pending');
        revealObserver.observe(item);
      }
    });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
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

  const historyKey = 'tide-reading-history-v1';
  const readHistory = () => {
    try {
      const value = JSON.parse(localStorage.getItem(historyKey) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };
  if (body.dataset.pageKind === 'post' && body.dataset.pagePrivate !== 'true') {
    const current = {
      title: body.dataset.pageTitle,
      url: body.dataset.pageUrl,
      date: body.dataset.pageDate,
      visitedAt: Date.now(),
    };
    const updated = [current, ...readHistory().filter((item) => item.url !== current.url)].slice(0, 5);
    localStorage.setItem(historyKey, JSON.stringify(updated));
  }

  const historySection = document.querySelector('[data-reading-history]');
  if (historySection) {
    const list = historySection.querySelector('[data-history-list]');
    const entries = readHistory().slice(0, 3);
    if (entries.length && list) {
      entries.forEach((entry, index) => {
        const link = document.createElement('a');
        link.className = 'history-item';
        link.href = entry.url;
        const number = document.createElement('span');
        number.textContent = String(index + 1).padStart(2, '0');
        const title = document.createElement('strong');
        title.textContent = entry.title;
        const meta = document.createElement('small');
        meta.textContent = `${entry.date || '旧笔记'} · 继续阅读 ↗`;
        link.append(number, title, meta);
        list.append(link);
      });
      historySection.hidden = false;
      historySection.classList.add('is-visible');
    }
    historySection.querySelector('[data-history-clear]')?.addEventListener('click', () => {
      localStorage.removeItem(historyKey);
      historySection.hidden = true;
      showToast('阅读记录已清除');
    });
  }

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
        if (container) container.innerHTML = '<div class="comment-loading">留言暂时走丢了，请稍后再试。</div>';
      });
    };
    const hydrateComments = async () => {
      try {
        await loadCommentsScript();
        initComments();
      } catch (error) {
        console.warn('Twikoo script failed to load', error);
        const container = document.querySelector('#twikoo-comment');
        if (container) container.innerHTML = '<div class="comment-loading">留言暂时走丢了，请稍后再试。</div>';
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
    searchStatus.textContent = '正在整理旧笔记…';
    try {
      const response = await fetch('/search.xml');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const xml = new DOMParser().parseFromString(await response.text(), 'text/xml');
      searchIndex = [...xml.querySelectorAll('entry')].map((entry) => ({
        title: entry.querySelector('title')?.textContent || '未命名',
        url: entry.querySelector('url')?.textContent || '/',
        content: entry.querySelector('content')?.textContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '',
      }));
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

    searchStatus.textContent = matches.length ? `找到 ${matches.length} 条结果` : '没有找到，换个关键词试试。';
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
