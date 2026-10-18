(() => {
  for (const slide of document.querySelectorAll('.stage > .slide')) {
    const hint = document.createElement('div');
    hint.className = 'mobile-scroll-hint';
    hint.textContent = '向下滚动读完本页；宽表与原图可左右滑动';
    slide.querySelector('.content')?.before(hint);
  }
  // Keep complete originals readable on a narrow screen without stretching the page.
  for (const image of document.querySelectorAll('.stage > .slide img')) {
    if (Number(image.getAttribute('width')) < 900) continue;
    const scroller = document.createElement('div');
    scroller.className = 'deck-image-scroll';
    scroller.tabIndex = 0;
    scroller.setAttribute('role', 'region');
    scroller.setAttribute('aria-label', '论文原图；手机端可横向滚动');
    image.before(scroller);
    scroller.append(image);
  }
})();
