(() => {
  const frame = document.getElementById('codecap-task-demo');
  if (!frame) return;
  const measure = () => frame.contentWindow?.postMessage(
    {type: 'codecap-demo-measure'}, location.origin);
  addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow ||
        event.data?.type !== 'codecap-demo-height') return;
    const height = event.data.height;
    if (Number.isFinite(height) && height >= 250 && height <= 6000)
      frame.style.height = `${Math.ceil(height)}px`;
  });
  frame.addEventListener('load', measure);
  measure();
})();
