(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const stage = document.querySelector('.stage');
  const counter = document.querySelector('.counter');
  const overview = document.querySelector('.overview');
  const navigation = document.querySelector('.nav');
  const overviewTrigger = document.querySelector('[data-overview]');
  const overviewClose = document.createElement('button');
  overviewClose.className = 'overview-close';
  overviewClose.type = 'button';
  overviewClose.textContent = '关闭总览 ×';
  overviewClose.setAttribute('aria-label', '关闭总览');
  overview.prepend(overviewClose);
  overview.id ||= 'deck-overview';
  overview.setAttribute('role', 'dialog');
  overview.setAttribute('aria-modal', 'true');
  overviewTrigger.setAttribute('aria-controls', overview.id);
  overviewTrigger.setAttribute('aria-expanded', 'false');
  let index = Math.max(0, Math.min(slides.length - 1, Number(location.hash.slice(1)) - 1 || 0));

  const scale = () => {
    const controlsHeight = navigation?.getBoundingClientRect().height || 48;
    const controlsBottom = navigation ? parseFloat(getComputedStyle(navigation).bottom) || 0 : 16;
    const canvasHeight = Math.max(90, innerHeight - controlsHeight - controlsBottom - 12);
    const value = Math.min((innerWidth - 24) / 1600, (canvasHeight - 24) / 900);
    const applied = Math.max(.1, value);
    document.documentElement.style.setProperty('--scale', String(applied));
    document.documentElement.style.setProperty('--stage-x', `${Math.max(0, (innerWidth - 1600 * applied) / 2)}px`);
    document.documentElement.style.setProperty('--stage-y', `${Math.max(0, (canvasHeight - 900 * applied) / 2)}px`);
  };
  const show = (next, push = true) => {
    index = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    counter.textContent = `${index + 1} / ${slides.length}`;
    if (push) history.replaceState(null, '', `#${index + 1}`);
  };
  const setOverview = (open) => {
    overview.classList.toggle('open', open);
    overviewTrigger.setAttribute('aria-expanded', String(open));
    stage.inert = open;
    navigation.inert = open;
    if (open) overviewClose.focus();
    else overviewTrigger.focus({ preventScroll: true });
  };
  const toggleOverview = () => setOverview(!overview.classList.contains('open'));
  overviewClose.addEventListener('click', () => setOverview(false));
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  };

  document.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
  document.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
  overviewTrigger.addEventListener('click', toggleOverview);
  document.querySelector('[data-fullscreen]').addEventListener('click', toggleFullscreen);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (overview.classList.contains('open')) { setOverview(false); return; }
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      if (window.parent !== window) window.parent.postMessage({ type: 'paper-deck-escape' }, location.origin);
      return;
    }
    if (overview.classList.contains('open')) {
      if (event.key.toLowerCase() === 'o') { event.preventDefault(); setOverview(false); }
      if (event.key === 'Tab') {
        const controls = [...overview.querySelectorAll('button')];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(index + 1); }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
    if (event.key === 'Home') { event.preventDefault(); show(0); }
    if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
    if (event.key.toLowerCase() === 'f') toggleFullscreen();
    if (event.key.toLowerCase() === 'o') toggleOverview();
  });
  addEventListener('hashchange', () => show(Number(location.hash.slice(1)) - 1 || 0, false));
  addEventListener('resize', scale);
  document.addEventListener('fullscreenchange', () => {
    scale();
    const control = document.querySelector('[data-fullscreen]');
    const active = Boolean(document.fullscreenElement);
    control.textContent = active ? '退出全屏' : '全屏 F';
    control.setAttribute('aria-label', active ? '退出全屏' : '全屏');
    if (!active && !overview.classList.contains('open')) control.focus({ preventScroll: true });
  });
  if (navigation && typeof ResizeObserver !== 'undefined') new ResizeObserver(scale).observe(navigation);
  slides.forEach((slide, i) => {
    const thumb = document.createElement('button');
    thumb.className = 'thumb';
    thumb.dataset.page = String(i + 1);
    thumb.setAttribute('aria-label', `打开第 ${i + 1} 页`);
    thumb.innerHTML = slide.outerHTML;
    thumb.addEventListener('click', () => { show(i); setOverview(false); });
    overview.appendChild(thumb);
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => {
        thumb.style.setProperty('--thumb-scale', String(thumb.clientWidth / 1600));
      }).observe(thumb);
    }
  });
  scale(); show(index, false);
})();
