const els = {
  dropzone: document.querySelector('#dropzone'),
  fileInput: document.querySelector('#fileInput'),
  chooseButton: document.querySelector('#chooseButton'),
  editor: document.querySelector('#editor'),
  workspace: document.querySelector('#workspace'),
  originalCanvas: document.querySelector('#originalCanvas'),
  resultCanvas: document.querySelector('#resultCanvas'),
  canvasShell: document.querySelector('#canvasShell'),
  canvasStage: document.querySelector('#canvasStage'),
  compareLine: document.querySelector('#compareLine'),
  processing: document.querySelector('#processing'),
  strength: document.querySelector('#strength'),
  strengthValue: document.querySelector('#strengthValue'),
  brushSize: document.querySelector('#brushSize'),
  brushValue: document.querySelector('#brushValue'),
  brushControls: document.querySelector('#brushControls'),
  autoTool: document.querySelector('#autoTool'),
  pickerTool: document.querySelector('#pickerTool'),
  brushTool: document.querySelector('#brushTool'),
  toolTip: document.querySelector('#toolTip'),
  beforeView: document.querySelector('#beforeView'),
  afterView: document.querySelector('#afterView'),
  compareView: document.querySelector('#compareView'),
  imageMeta: document.querySelector('#imageMeta'),
  resetButton: document.querySelector('#resetButton'),
  undoButton: document.querySelector('#undoButton'),
  copyButton: document.querySelector('#copyButton'),
  downloadButton: document.querySelector('#downloadButton'),
  brushCursor: document.querySelector('#brushCursor'),
  toast: document.querySelector('#toast'),
};

const originalCtx = els.originalCanvas.getContext('2d', { willReadFrequently: true });
const resultCtx = els.resultCanvas.getContext('2d', { willReadFrequently: true });

const state = {
  fileName: '净图',
  original: null,
  result: null,
  mode: 'auto',
  view: 'after',
  compareAt: 0.5,
  draggingCompare: false,
  painting: false,
  lastPoint: null,
  brushMask: null,
  history: [],
  processTimer: null,
  toastTimer: null,
};

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2200);
}

function setRangeFill(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty('--value', `${value}%`);
}

setRangeFill(els.strength);
setRangeFill(els.brushSize);

function getImageFileFromTransfer(transfer) {
  if (!transfer) return null;
  const files = [...(transfer.files || [])];
  return files.find(file => file.type.startsWith('image/')) || null;
}

async function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('没有找到可用的图片');
    return;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxPixels = 20_000_000;
    let width = bitmap.width;
    let height = bitmap.height;
    if (width * height > maxPixels) {
      const scale = Math.sqrt(maxPixels / (width * height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      showToast('图片较大，已等比缩放以保证处理流畅');
    }

    state.fileName = file.name?.replace(/\.[^.]+$/, '') || '净图';
    [els.originalCanvas, els.resultCanvas].forEach(canvas => {
      canvas.width = width;
      canvas.height = height;
    });
    originalCtx.clearRect(0, 0, width, height);
    originalCtx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    state.original = originalCtx.getImageData(0, 0, width, height);
    state.history = [];
    els.undoButton.disabled = true;
    els.imageMeta.textContent = `${width} × ${height} · ${formatBytes(file.size)}`;
    els.dropzone.hidden = true;
    els.editor.hidden = false;
    setMode('auto');
    setView('after');
    await processAuto(true);
    els.workspace.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    console.error(error);
    showToast('这张图片无法读取，请换一张试试');
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '剪贴板图片';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function buildWatermarkMask(imageData, strength) {
  const { width, height, data } = imageData;
  const candidates = new Uint8Array(width * height);
  const mask = new Uint8Array(width * height);
  const threshold = 250 - strength * 0.58;
  const chromaLimit = 6 + strength * 0.16;
  const alphaLimit = 255;
  const contrastFloor = Math.max(1.5, 9 - strength * .075);

  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const hi = Math.max(r, g, b);
    const lo = Math.min(r, g, b);
    const lum = luminance(r, g, b);
    if (a <= alphaLimit && lum >= threshold && lum < 248 && hi - lo <= chromaLimit) {
      candidates[p] = 1;
    }
  }

  // A translucent watermark is darker than the same background on both sides
  // of a stroke. Opposing samples reject flat cards, dividers and most text AA.
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const radii = [4, 7];
  for (let y = 8; y < height - 8; y += 1) {
    for (let x = 8; x < width - 8; x += 1) {
      const p = y * width + x;
      if (!candidates[p]) continue;
      const i = p * 4;
      const currentLum = luminance(data[i], data[i + 1], data[i + 2]);

      let nearMin = currentLum;
      for (const [dx, dy] of directions) {
        for (const sign of [-1, 1]) {
          const ni = ((y + dy * 2 * sign) * width + (x + dx * 2 * sign)) * 4;
          nearMin = Math.min(nearMin, luminance(data[ni], data[ni + 1], data[ni + 2]));
        }
      }
      if (nearMin < currentLum - 18) continue;

      let matchesStroke = false;
      for (const radius of radii) {
        for (const [dx, dy] of directions) {
          const i1 = ((y + dy * radius) * width + (x + dx * radius)) * 4;
          const i2 = ((y - dy * radius) * width + (x - dx * radius)) * 4;
          const lum1 = luminance(data[i1], data[i1 + 1], data[i1 + 2]);
          const lum2 = luminance(data[i2], data[i2 + 1], data[i2 + 2]);
          if (lum1 - currentLum >= contrastFloor && lum2 - currentLum >= contrastFloor && Math.abs(lum1 - lum2) <= 5) {
            matchesStroke = true;
            break;
          }
        }
        if (matchesStroke) break;
      }
      if (matchesStroke) mask[p] = 1;
    }
  }

  // Remove isolated compression noise, but keep thin connected watermark strokes.
  const cleaned = mask.slice();
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const p = y * width + x;
      if (!mask[p]) continue;
      let neighbors = 0;
      for (let yy = -1; yy <= 1; yy += 1) {
        for (let xx = -1; xx <= 1; xx += 1) {
          if ((xx || yy) && mask[p + yy * width + xx]) neighbors += 1;
        }
      }
      if (neighbors < 1) cleaned[p] = 0;
    }
  }
  return cleaned;
}

function dilateMask(mask, width, height, radius = 1) {
  if (!radius) return mask;
  const result = mask.slice();
  for (let y = radius; y < height - radius; y += 1) {
    for (let x = radius; x < width - radius; x += 1) {
      const p = y * width + x;
      if (!mask[p]) continue;
      for (let yy = -radius; yy <= radius; yy += 1) {
        for (let xx = -radius; xx <= radius; xx += 1) result[p + yy * width + xx] = 1;
      }
    }
  }
  return result;
}

function inpaint(imageData, sourceMask) {
  const { width, height, data } = imageData;
  const output = new ImageData(new Uint8ClampedArray(data), width, height);
  const out = output.data;
  const mask = dilateMask(sourceMask, width, height, 1);
  const radii = [2, 4, 7, 11, 16];
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const colorDistance = (first, second) => {
    const dr = first[0] - second[0];
    const dg = first[1] - second[1];
    const db = first[2] - second[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      if (!mask[p]) continue;

      let bestPair = null;
      for (const radius of radii) {
        for (const [dx, dy] of directions) {
          const firstX = x + dx * radius;
          const firstY = y + dy * radius;
          const secondX = x - dx * radius;
          const secondY = y - dy * radius;
          if (firstX < 0 || firstX >= width || firstY < 0 || firstY >= height) continue;
          if (secondX < 0 || secondX >= width || secondY < 0 || secondY >= height) continue;
          const firstPixel = firstY * width + firstX;
          const secondPixel = secondY * width + secondX;
          if (mask[firstPixel] || mask[secondPixel]) continue;
          const firstIndex = firstPixel * 4;
          const secondIndex = secondPixel * 4;
          const first = [data[firstIndex], data[firstIndex + 1], data[firstIndex + 2], data[firstIndex + 3]];
          const second = [data[secondIndex], data[secondIndex + 1], data[secondIndex + 2], data[secondIndex + 3]];
          const score = colorDistance(first, second) + radius * .3;
          if (!bestPair || score < bestPair.score) bestPair = { first, second, score };
        }
      }

      const i = p * 4;
      if (bestPair) {
        out[i] = (bestPair.first[0] + bestPair.second[0]) / 2;
        out[i + 1] = (bestPair.first[1] + bestPair.second[1]) / 2;
        out[i + 2] = (bestPair.first[2] + bestPair.second[2]) / 2;
        out[i + 3] = (bestPair.first[3] + bestPair.second[3]) / 2;
        continue;
      }

      // Near edges or inside a large painted region, fall back to a weighted
      // ring of valid pixels so every marked pixel still gets repaired.
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let totalA = 0;
      let weightSum = 0;
      for (const radius of radii) {
        for (const [dx, dy] of directions) {
          for (const sign of [-1, 1]) {
            const sampleX = x + dx * radius * sign;
            const sampleY = y + dy * radius * sign;
            if (sampleX < 0 || sampleX >= width || sampleY < 0 || sampleY >= height) continue;
            const samplePixel = sampleY * width + sampleX;
            if (mask[samplePixel]) continue;
            const sampleIndex = samplePixel * 4;
            const weight = 1 / (1 + radius * .22);
            totalR += data[sampleIndex] * weight;
            totalG += data[sampleIndex + 1] * weight;
            totalB += data[sampleIndex + 2] * weight;
            totalA += data[sampleIndex + 3] * weight;
            weightSum += weight;
          }
        }
        if (weightSum >= 4) break;
      }
      if (weightSum > 0) {
        out[i] = totalR / weightSum;
        out[i + 1] = totalG / weightSum;
        out[i + 2] = totalB / weightSum;
        out[i + 3] = totalA / weightSum;
      }
    }
  }
  return output;
}

async function processAuto(initial = false) {
  if (!state.original) return;
  els.processing.hidden = false;
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const strength = Number(els.strength.value);
  const mask = buildWatermarkMask(state.original, strength);
  state.result = inpaint(state.original, mask);
  resultCtx.putImageData(state.result, 0, 0);
  els.processing.hidden = true;
  if (!initial) showToast('已按新强度重新处理');
}

function scheduleAutoProcess() {
  if (!state.original) return;
  clearTimeout(state.processTimer);
  state.processTimer = setTimeout(() => processAuto(), 170);
}

function pushHistory() {
  if (!state.result) return;
  state.history.push(new ImageData(new Uint8ClampedArray(state.result.data), state.result.width, state.result.height));
  if (state.history.length > 8) state.history.shift();
  els.undoButton.disabled = false;
}

function setMode(mode) {
  state.mode = mode;
  [els.autoTool, els.pickerTool, els.brushTool].forEach(button => button.classList.remove('active'));
  els[`${mode}Tool`].classList.add('active');
  els.brushControls.hidden = mode !== 'brush';
  els.brushCursor.hidden = true;

  const tips = {
    auto: '适合示例中的浅灰色平铺水印，调整强度可减少误伤。',
    picker: '在画面中点击一种水印颜色，会自动清除相近颜色。',
    brush: '在残留水印上涂抹，浏览器会用周围画面进行修复。',
  };
  els.toolTip.querySelector('span').textContent = tips[mode];
  els.canvasShell.style.cursor = mode === 'picker' ? 'crosshair' : mode === 'brush' ? 'none' : 'default';
  if (mode !== 'auto' && state.view !== 'after') setView('after');
}

function setView(view) {
  state.view = view;
  [els.beforeView, els.afterView, els.compareView].forEach(button => button.classList.remove('active'));
  els[`${view}View`].classList.add('active');
  els.compareLine.hidden = view !== 'compare';

  if (view === 'before') {
    els.originalCanvas.style.clipPath = 'none';
    els.originalCanvas.style.opacity = '1';
    els.originalCanvas.style.pointerEvents = 'auto';
  } else if (view === 'after') {
    els.originalCanvas.style.opacity = '0';
    els.originalCanvas.style.pointerEvents = 'none';
  } else {
    els.originalCanvas.style.opacity = '1';
    els.originalCanvas.style.pointerEvents = 'auto';
    updateCompare(state.compareAt);
  }
}

function updateCompare(ratio) {
  state.compareAt = Math.max(0, Math.min(1, ratio));
  const percentage = state.compareAt * 100;
  els.originalCanvas.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
  els.compareLine.style.left = `${percentage}%`;
}

function canvasPoint(event) {
  const rect = els.resultCanvas.getBoundingClientRect();
  const scaleX = els.resultCanvas.width / rect.width;
  const scaleY = els.resultCanvas.height / rect.height;
  return {
    x: Math.max(0, Math.min(els.resultCanvas.width - 1, (event.clientX - rect.left) * scaleX)),
    y: Math.max(0, Math.min(els.resultCanvas.height - 1, (event.clientY - rect.top) * scaleY)),
    scaleX,
    scaleY,
    rect,
  };
}

function removePickedColor(x, y) {
  if (!state.result) return;
  const px = Math.floor(x);
  const py = Math.floor(y);
  const i = (py * state.result.width + px) * 4;
  const picked = state.result.data.slice(i, i + 3);
  const tolerance = 9 + Number(els.strength.value) * .22;
  const mask = new Uint8Array(state.result.width * state.result.height);
  const data = state.result.data;

  for (let j = 0, p = 0; j < data.length; j += 4, p += 1) {
    const dr = data[j] - picked[0];
    const dg = data[j + 1] - picked[1];
    const db = data[j + 2] - picked[2];
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);
    if (distance <= tolerance) mask[p] = 1;
  }
  const selectedCount = mask.reduce((sum, value) => sum + value, 0);
  if (selectedCount > mask.length * .18) {
    showToast('选中的颜色覆盖太广，请点击更明显的水印笔画');
    return;
  }
  pushHistory();
  state.result = inpaint(state.result, mask);
  resultCtx.putImageData(state.result, 0, 0);
  showToast('已清除相近颜色，可继续点击残留处');
}

function addBrushSegment(from, to) {
  if (!state.result || !state.brushMask) return;
  const { width, height } = state.result;
  const radius = Number(els.brushSize.value) / 2;
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(distance / Math.max(2, radius * .35)));

  for (let s = 0; s <= steps; s += 1) {
    const t = s / steps;
    const cx = from.x + (to.x - from.x) * t;
    const cy = from.y + (to.y - from.y) * t;
    const minX = Math.max(0, Math.floor(cx - radius));
    const maxX = Math.min(width - 1, Math.ceil(cx + radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxY = Math.min(height - 1, Math.ceil(cy + radius));
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) state.brushMask[y * width + x] = 1;
      }
    }
  }
}

function updateBrushCursor(event) {
  if (state.mode !== 'brush' || state.view !== 'after') return;
  const point = canvasPoint(event);
  const visualSize = Number(els.brushSize.value) / point.scaleX;
  els.brushCursor.hidden = false;
  els.brushCursor.style.width = `${visualSize}px`;
  els.brushCursor.style.height = `${visualSize}px`;
  els.brushCursor.style.left = `${event.clientX - point.rect.left}px`;
  els.brushCursor.style.top = `${event.clientY - point.rect.top}px`;
}

document.addEventListener('paste', event => {
  const file = getImageFileFromTransfer(event.clipboardData);
  if (file) {
    event.preventDefault();
    loadFile(file);
  } else {
    showToast('剪贴板里没有图片');
  }
});

['dragenter', 'dragover'].forEach(type => els.dropzone.addEventListener(type, event => {
  event.preventDefault();
  els.dropzone.classList.add('dragover');
}));
['dragleave', 'drop'].forEach(type => els.dropzone.addEventListener(type, event => {
  event.preventDefault();
  els.dropzone.classList.remove('dragover');
}));
els.dropzone.addEventListener('drop', event => loadFile(getImageFileFromTransfer(event.dataTransfer)));
els.dropzone.addEventListener('click', event => {
  if (event.target !== els.chooseButton) els.fileInput.click();
});
els.dropzone.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') els.fileInput.click();
});
els.chooseButton.addEventListener('click', event => {
  event.stopPropagation();
  els.fileInput.click();
});
els.fileInput.addEventListener('change', () => loadFile(els.fileInput.files[0]));

els.strength.addEventListener('input', () => {
  els.strengthValue.textContent = `${els.strength.value}%`;
  setRangeFill(els.strength);
  if (state.mode === 'auto') scheduleAutoProcess();
});
els.brushSize.addEventListener('input', () => {
  els.brushValue.textContent = `${els.brushSize.value} px`;
  setRangeFill(els.brushSize);
});

els.autoTool.addEventListener('click', () => { setMode('auto'); processAuto(); });
els.pickerTool.addEventListener('click', () => setMode('picker'));
els.brushTool.addEventListener('click', () => setMode('brush'));

els.beforeView.addEventListener('click', () => setView('before'));
els.afterView.addEventListener('click', () => setView('after'));
els.compareView.addEventListener('click', () => setView('compare'));

els.canvasShell.addEventListener('pointerdown', event => {
  if (state.view === 'compare') {
    state.draggingCompare = true;
    els.canvasShell.setPointerCapture(event.pointerId);
    updateCompare((event.clientX - els.resultCanvas.getBoundingClientRect().left) / els.resultCanvas.getBoundingClientRect().width);
    return;
  }
  if (state.view !== 'after') return;
  const point = canvasPoint(event);
  if (state.mode === 'picker') {
    removePickedColor(point.x, point.y);
  } else if (state.mode === 'brush') {
    pushHistory();
    state.painting = true;
    state.brushMask = new Uint8Array(state.result.width * state.result.height);
    state.lastPoint = point;
    els.canvasShell.setPointerCapture(event.pointerId);
    addBrushSegment(point, point);
  }
});

els.canvasShell.addEventListener('pointermove', event => {
  if (state.draggingCompare) {
    const rect = els.resultCanvas.getBoundingClientRect();
    updateCompare((event.clientX - rect.left) / rect.width);
    return;
  }
  updateBrushCursor(event);
  if (state.painting && state.mode === 'brush') {
    const point = canvasPoint(event);
    addBrushSegment(state.lastPoint, point);
    state.lastPoint = point;
  }
});

function endPointer() {
  if (state.painting && state.brushMask && state.result) {
    state.result = inpaint(state.result, state.brushMask);
    resultCtx.putImageData(state.result, 0, 0);
  }
  state.draggingCompare = false;
  state.painting = false;
  state.lastPoint = null;
  state.brushMask = null;
}
els.canvasShell.addEventListener('pointerup', endPointer);
els.canvasShell.addEventListener('pointercancel', endPointer);
els.canvasShell.addEventListener('pointerleave', () => { if (!state.painting) els.brushCursor.hidden = true; });

els.undoButton.addEventListener('click', () => {
  const previous = state.history.pop();
  if (!previous) return;
  state.result = previous;
  resultCtx.putImageData(state.result, 0, 0);
  els.undoButton.disabled = state.history.length === 0;
  showToast('已撤销上一步');
});

els.resetButton.addEventListener('click', () => {
  state.original = null;
  state.result = null;
  state.history = [];
  els.fileInput.value = '';
  els.editor.hidden = true;
  els.dropzone.hidden = false;
  els.dropzone.focus();
});

function resultPngBlob() {
  return new Promise((resolve, reject) => {
    els.resultCanvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('PNG encoding failed'));
    }, 'image/png');
  });
}

els.copyButton.addEventListener('click', async () => {
  if (!state.result) return;
  if (!window.isSecureContext || !navigator.clipboard?.write || !window.ClipboardItem) {
    showToast('当前浏览器不能复制图片，请下载 PNG');
    return;
  }
  els.copyButton.disabled = true;
  try {
    const blob = await resultPngBlob();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast('PNG 已复制，可以直接粘贴');
  } catch (error) {
    console.warn('Copy image failed', error);
    showToast('复制失败，请允许剪贴板权限或下载 PNG');
  } finally {
    els.copyButton.disabled = false;
  }
});

els.downloadButton.addEventListener('click', async () => {
  if (!state.result) return;
  try {
    const blob = await resultPngBlob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${state.fileName}-已净化.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast('PNG 已下载');
  } catch (error) {
    console.warn('Download image failed', error);
    showToast('PNG 生成失败，请重试');
  }
});
