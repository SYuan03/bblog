(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const backToTop = document.querySelector('[data-back-to-top]');
  const progress = document.querySelector('.reading-progress span');
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');

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

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -30px' });
    revealItems.forEach((item) => revealObserver.observe(item));
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
      await navigator.clipboard.writeText(source.innerText);
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
        await navigator.clipboard.writeText(location.href);
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

  const comments = document.querySelector('[data-comments]');
  if (comments) {
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
    if (window.twikoo) initComments();
    else addEventListener('load', initComments, { once: true });
  }

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
