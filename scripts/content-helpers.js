const path = require('node:path');
const fs = require('node:fs');
const cheerio = require('cheerio');

const encrypted = (post) => String(post?.content || '').includes('hexo-blog-encrypt');

function cleanText(value) {
  if (!value) return '';
  const $ = cheerio.load(`<div data-summary-root>${String(value)}</div>`, null, false);
  $('script, style, pre, code, table, svg, img, noscript').remove();
  return $('[data-summary-root]')
    .text()
    .replace(/\[TOC\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, limit) {
  if (value.length <= limit) return value;
  const clipped = value.slice(0, Math.max(1, limit - 1)).replace(/[\s，。；、：:,.!?！？-]+$/u, '');
  return `${clipped}…`;
}

function normalizeImageUrl(value, postPath) {
  const candidate = String(value || '').trim().replace(/&amp;/g, '&');
  if (!candidate || candidate.startsWith('data:') || /(?:^|\/)loading\.svg(?:[?#]|$)/i.test(candidate)) return '';
  if (/^(?:https?:)?\/\//i.test(candidate)) return candidate;
  if (candidate.startsWith('/')) return candidate;

  const pathname = String(postPath || '').replace(/^\/+/, '');
  return path.posix.normalize(path.posix.join('/', path.posix.dirname(pathname), candidate));
}

let generatedCoverManifest = {};
try {
  const manifestPath = path.join(
    hexo.base_dir,
    hexo.config.source_dir || 'source',
    'generated-covers',
    'responsive',
    'manifest.json',
  );
  generatedCoverManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))?.covers || {};
} catch {
  // Responsive images are an optional build-time optimization.
}

function generatedCoverInfo(cover) {
  const match = String(cover || '').match(/^\/generated-covers\/([^/]+)\.webp$/i);
  return match ? { stem: match[1], ...(generatedCoverManifest[match[1]] || {}) } : null;
}

function generatedCoverVariant(cover, width) {
  const info = generatedCoverInfo(cover);
  return info?.variants?.includes(width) ? `/generated-covers/responsive/${info.stem}-${width}.webp` : '';
}

hexo.extend.helper.register('post_summary', function postSummary(post, limit = 112) {
  if (encrypted(post)) return '这是一篇受密码保护的文章，输入密码后即可阅读。';
  const explicit = cleanText(post?.description || post?.excerpt || '');
  const inferred = explicit || cleanText(post?.content || '');
  return truncate(inferred || '打开文章继续阅读。', Number(limit) || 112);
});

hexo.extend.helper.register('reading_minutes', function readingMinutes(post) {
  const symbols = Number(post?.length) || cleanText(post?.content || '').length;
  return Math.max(1, Math.round(symbols / 275));
});

hexo.extend.helper.register('post_cover', function postCover(post) {
  const declared = Array.isArray(post?.cover) ? post.cover[0] : post?.cover;
  return normalizeImageUrl(declared, post?.path);
});

hexo.extend.helper.register('post_cover_card', function postCoverCard(post) {
  const declared = Array.isArray(post?.cover) ? post.cover[0] : post?.cover;
  const cover = normalizeImageUrl(declared, post?.path);
  return generatedCoverVariant(cover, 320) || cover;
});

hexo.extend.helper.register('post_cover_srcset', function postCoverSrcset(post) {
  const declared = Array.isArray(post?.cover) ? post.cover[0] : post?.cover;
  const cover = normalizeImageUrl(declared, post?.path);
  const info = generatedCoverInfo(cover);
  if (!info?.originalWidth) return '';
  const candidates = (info.variants || []).map((width) => [generatedCoverVariant(cover, width), width]);
  if (!candidates.some(([, width]) => width === info.originalWidth)) {
    candidates.push([cover, info.originalWidth]);
  }
  return candidates
    .filter(([url, width]) => url && Number.isInteger(width) && width > 0)
    .sort((left, right) => left[1] - right[1])
    .map(([url, width]) => `${url} ${width}w`)
    .join(', ');
});

hexo.extend.helper.register('post_cover_tone', function postCoverTone(post) {
  const value = String(post?.title || post?.slug || 'tide');
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 5;
});
