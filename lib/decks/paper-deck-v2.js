(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const stage = document.querySelector('.stage');
  const counter = document.querySelector('.counter');
  const overview = document.querySelector('.overview');
  let index = Math.max(0, Math.min(slides.length - 1, Number(location.hash.slice(1)) - 1 || 0));

  const scale = () => {
    const value = Math.min((innerWidth - 24) / 1600, (innerHeight - 24) / 900);
    const applied = Math.max(.1, value);
    document.documentElement.style.setProperty('--scale', String(applied));
    document.documentElement.style.setProperty('--stage-x', `${Math.max(0, (innerWidth - 1600 * applied) / 2)}px`);
    document.documentElement.style.setProperty('--stage-y', `${Math.max(0, (innerHeight - 900 * applied) / 2)}px`);
  };
  const show = (next, push = true) => {
    index = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    counter.textContent = `${index + 1} / ${slides.length}`;
    if (push) history.replaceState(null, '', `#${index + 1}`);
  };
  const toggleOverview = () => overview.classList.toggle('open');
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  };

  document.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
  document.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
  document.querySelector('[data-overview]').addEventListener('click', toggleOverview);
  document.querySelector('[data-fullscreen]').addEventListener('click', toggleFullscreen);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      overview.classList.remove('open');
      if (document.fullscreenElement) document.exitFullscreen();
      return;
    }
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(index + 1); }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
    if (event.key === 'Home') show(0);
    if (event.key === 'End') show(slides.length - 1);
    if (event.key.toLowerCase() === 'f') toggleFullscreen();
    if (event.key.toLowerCase() === 'o') toggleOverview();
  });
  addEventListener('hashchange', () => show(Number(location.hash.slice(1)) - 1 || 0, false));
  addEventListener('resize', scale);
  slides.forEach((slide, i) => {
    const thumb = document.createElement('button');
    thumb.className = 'thumb';
    thumb.dataset.page = String(i + 1);
    thumb.setAttribute('aria-label', `打开第 ${i + 1} 页`);
    thumb.innerHTML = slide.outerHTML;
    thumb.addEventListener('click', () => { overview.classList.remove('open'); show(i); });
    overview.appendChild(thumb);
  });
  scale(); show(index, false);
})();
