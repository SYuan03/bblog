import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsRoot = path.join(projectRoot, 'content', '_posts');
const coversRoot = path.join(projectRoot, 'content', 'generated-covers');
const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const descriptionsOnly = args.has('--descriptions-only');
const coversOnly = args.has('--covers-only');
const limitArgument = process.argv.find((value) => value.startsWith('--limit='));
const limit = limitArgument ? Number(limitArgument.split('=')[1]) : Number.POSITIVE_INFINITY;
const baseUrl = (process.env.HUBROUTER_BASE_URL || 'https://hubrouter.jd.com').replace(/\/$/, '');
const textModel = process.env.HUBROUTER_TEXT_MODEL || 'Gemini-3.1-Flash-lite-Third';
const imageModel = process.env.HUBROUTER_IMAGE_MODEL || 'gpt-image-2';
const imageSize = process.env.HUBROUTER_IMAGE_SIZE || '1536x1024';
const apiKey = process.env.HUBROUTER_API_KEY;

const routerUrl = new URL(baseUrl);
if (routerUrl.origin !== 'https://hubrouter.jd.com' || routerUrl.pathname !== '/') {
  throw new Error('HUBROUTER_BASE_URL must be https://hubrouter.jd.com so the API key cannot be sent elsewhere.');
}

if (descriptionsOnly && coversOnly) throw new Error('Choose at most one of --descriptions-only and --covers-only.');
if (Number.isNaN(limit) || limit < 1) throw new Error('--limit must be a positive number.');

function readFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error('Missing YAML front matter.');
  const header = match[1];
  const field = (name) => {
    const value = header.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1]?.trim() || '';
    if (!value) return '';
    try { return JSON.parse(value); } catch { return value.replace(/^['"]|['"]$/g, ''); }
  };
  return { body: raw.slice(match[0].length), title: field('title'), description: field('description'), cover: field('cover') };
}

function cleanArticleText(html) {
  const $ = cheerio.load(String(html || ''), null, false);
  $('script, style, pre, code, table, svg, img, noscript').remove();
  return $.root().text().replace(/\[TOC\]/gi, ' ').replace(/\s+/g, ' ').trim();
}

function yamlString(value) {
  return JSON.stringify(String(value).replace(/\s+/g, ' ').trim());
}

function setFrontMatterField(raw, name, value) {
  const frontMatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontMatter) throw new Error('Missing YAML front matter.');
  const fieldPattern = new RegExp(`^${name}:.*$`, 'm');
  let header = frontMatter[1];
  if (fieldPattern.test(header)) header = header.replace(fieldPattern, `${name}: ${yamlString(value)}`);
  else {
    const anchor = /^(updated|date|title):.*$/gm;
    let match;
    let insertion = 0;
    while ((match = anchor.exec(header))) insertion = match.index + match[0].length;
    header = `${header.slice(0, insertion)}\n${name}: ${yamlString(value)}${header.slice(insertion)}`;
  }
  return `---\n${header}\n---${raw.slice(frontMatter[0].length)}`;
}

function plainModelText(payload) {
  const content = payload?.choices?.[0]?.message?.content ?? payload?.output_text ?? '';
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) return content.map((item) => item?.text || '').join('').trim();
  return '';
}

async function requestJson(endpoint, payload) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let detail = '';
    try {
      const errorPayload = await response.json();
      const message = errorPayload?.error?.message || errorPayload?.message || '';
      const code = errorPayload?.error?.code || errorPayload?.code || '';
      detail = [code, message].filter(Boolean).join(' — ');
    } catch {}
    detail = String(detail)
      .replaceAll(apiKey || '__no_api_key__', '[redacted]')
      .replace(/sk-[A-Za-z0-9_-]{12,}/g, '[redacted]')
      .replace(/\s+/g, ' ')
      .slice(0, 240);
    throw new Error(`${endpoint} returned HTTP ${response.status}${detail ? `: ${detail}` : ''}.`);
  }
  return response.json();
}

async function createDescription(title, body, isPrivate) {
  if (isPrivate) return `一篇受密码保护的${title}记录。`;
  const payload = await requestJson('/v1/chat/completions', {
    model: textModel,
    temperature: 0.25,
    messages: [
      { role: 'system', content: '你是中文个人博客编辑。只根据原文写一句自然、具体、克制的简介，45到85个汉字，不使用营销话术，不添加原文没有的事实，不加引号。' },
      { role: 'user', content: `标题：${title}\n\n正文摘录：${cleanArticleText(body).slice(0, 6000)}` },
    ],
  });
  const result = plainModelText(payload).replace(/^['“"]|['”"]$/g, '').trim();
  if (!result) throw new Error('The text model returned an empty description.');
  return result.slice(0, 120);
}

function coverPrompt(title, description, isPrivate) {
  const treatments = [
    'ink blue, warm ivory, and muted terracotta; fine ink lines with softly cut paper shapes',
    'mineral grey, moss green, and restrained amber; screen-print texture with quiet geometric forms',
    'parchment, deep burgundy, and dusty sage; delicate gouache fields with sparse pencil marks',
    'moon white, smoky violet, and muted cyan; translucent layered paper with subtle grain',
    'soft stone, charcoal, and faded cobalt; abstract editorial collage with one warm accent',
  ];
  let hash = 2166136261;
  for (const character of title) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const treatment = treatments[Math.abs(hash) % treatments.length];
  const subject = isPrivate
    ? 'a restrained abstract visual metaphor for a private journal; do not infer or reveal its contents'
    : `a restrained visual metaphor for ${title}: ${description}`;
  return [
    'Use case: stylized-concept',
    'Asset type: image-only editorial illustration for a personal-blog cover; this is an illustration, never a poster, title card, diagram, or banner',
    `Primary request: interpret this topic visually through a single metaphor: ${subject}`,
    'Critical instruction: the topic title and description are semantic reference only; never quote, typeset, spell, label, or render any of their words or characters in the image',
    'Style/medium: refined editorial illustration with subtle paper grain; contemporary, minimal, art-directed',
    'Composition/framing: wide 3:2 composition; one clear focal idea; place every meaningful subject inside the central horizontal 50% band; the top and bottom quarters contain only quiet background so a 21:8 center crop remains complete',
    'Lighting/mood: soft natural light, thoughtful and quiet',
    `Color palette and material treatment: ${treatment}`,
    'Constraints: entirely text-free; no letters, numbers, symbols, captions, labels, logos, trademarks, watermark, UI mockup, neon, glossy 3D, or visual clutter',
    'Avoid: stock illustration clichés, literal screenshots, photorealistic computer screens, harsh bloom, excessive detail, oversaturated color',
  ].join('\n');
}

function imageBytes(payload) {
  const item = payload?.data?.[0];
  if (item?.b64_json) return Buffer.from(item.b64_json, 'base64');
  return item?.url || '';
}

function imageExtension(bytes, contentType = '') {
  if (contentType.includes('webp') || bytes.subarray(0, 4).toString('ascii') === 'RIFF') return 'webp';
  if (contentType.includes('jpeg') || (bytes[0] === 0xff && bytes[1] === 0xd8)) return 'jpg';
  return 'png';
}

async function createCover(title, description, isPrivate) {
  const request = {
    model: imageModel,
    prompt: coverPrompt(title, description, isPrivate),
    n: 1,
    size: imageSize,
  };
  if (/^gpt-image-/i.test(imageModel)) {
    request.output_format = 'webp';
    request.output_compression = 82;
  }
  const payload = await requestJson('/v1/images/generations', request);
  const generated = imageBytes(payload);
  if (!generated) throw new Error('The image model returned neither b64_json nor a URL.');
  if (Buffer.isBuffer(generated)) return { bytes: generated, contentType: '' };
  if (!generated.startsWith('https://')) throw new Error('The image model returned a non-HTTPS download URL.');
  const response = await fetch(generated);
  if (!response.ok) throw new Error(`Generated image download returned HTTP ${response.status}.`);
  return { bytes: Buffer.from(await response.arrayBuffer()), contentType: response.headers.get('content-type') || '' };
}

const files = (await readdir(postsRoot)).filter((name) => name.endsWith('.md')).sort();
const queue = [];
for (const filename of files) {
  const absolute = path.join(postsRoot, filename);
  const raw = await readFile(absolute, 'utf8');
  const metadata = readFrontMatter(raw);
  const needsDescription = !metadata.description && !coversOnly;
  const needsCover = !metadata.cover && !descriptionsOnly;
  if (needsDescription || needsCover) queue.push({ filename, absolute, raw, ...metadata, needsDescription, needsCover });
}

const selected = queue.slice(0, limit);
console.log(`${apply ? 'Applying' : 'Dry run:'} ${selected.length} of ${queue.length} posts need enrichment.`);
for (const post of selected) console.log(`- ${post.filename}: ${[post.needsDescription && 'description', post.needsCover && 'cover'].filter(Boolean).join(' + ')}`);

if (!apply || !selected.length) {
  if (!apply) console.log('No API calls were made. Re-run with --apply after setting HUBROUTER_API_KEY.');
  process.exit(0);
}
if (!apiKey) throw new Error('HUBROUTER_API_KEY is not set. Set it in your shell; never store it in this repository.');

await mkdir(coversRoot, { recursive: true });
for (const post of selected) {
  const isPrivate = post.body.includes('hexo-blog-encrypt');
  let next = post.raw;
  let description = post.description;
  if (post.needsDescription) {
    description = await createDescription(post.title, post.body, isPrivate);
    next = setFrontMatterField(next, 'description', description);
  }
  if (post.needsCover) {
    const image = await createCover(post.title, description || post.title, isPrivate);
    const extension = imageExtension(image.bytes, image.contentType);
    const basename = post.filename.replace(/\.md$/i, '').replace(/[^\p{Letter}\p{Number}._-]+/gu, '-');
    const output = path.join(coversRoot, `${basename}.${extension}`);
    await writeFile(output, image.bytes);
    next = setFrontMatterField(next, 'cover', `/generated-covers/${path.basename(output)}`);
  }
  await writeFile(post.absolute, next);
  console.log(`Updated ${post.filename}`);
}

console.log('Done. Review the generated covers, then run npm run build && npm run check.');
