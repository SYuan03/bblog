# Blog publishing runbook

This is the checklist for an agent publishing a new article to ChrisDing's blog.

## 1. Inspect before editing

Work in the repository root and preserve unrelated user changes.

```bash
git status --short
git branch --show-current
```

New articles live in `content/_posts/`. Use the next numeric prefix, for example `046-文章标题.md`. Do not edit the old exported HTML under the repository root.

## 2. Create the post

Use normal Markdown and include explicit metadata:

```yaml
---
title: "文章标题"
permalink: "/posts/分类/short-readable-slug.html"
date: "2026-09-21T20:30:00+08:00"
updated: "2026-09-21T20:30:00+08:00"
cover: "/generated-covers/046-short-readable-slug.webp"
description: "一到两句自然、具体的简介。"
categories:
  - "分类"
tags:
  - "标签"
---
```

Rules:

- Write naturally and avoid generic AI-style introductions or invented claims.
- Keep the permalink stable after publication.
- Prefer the author's supplied title, summary, and cover.
- Verify facts and links; distinguish confirmed facts from interpretation.
- Do not copy third-party images or text without permission. Link and credit the original source.

## 3. Covers and images

Put the main cover in `content/generated-covers/` as compressed WebP, ideally 1600×900. The cover is used by the homepage card and social metadata.

Generate responsive cover variants and update the manifest:

```bash
node tooling/localize-cover-images.mjs --variants-only
```

Expected new files:

```text
content/generated-covers/046-name.webp
content/generated-covers/responsive/046-name-320.webp
content/generated-covers/responsive/046-name-640.webp
content/generated-covers/responsive/046-name-960.webp
content/generated-covers/responsive/manifest.json
```

For AI-generated summaries or covers, keep `HUBROUTER_API_KEY` only in the ignored local `.env`. Never put a key in Markdown, code, Git history, logs, or the repository. See `.env.example` and preview changes before applying:

```bash
npm run enrich:posts
npm run enrich:posts -- --apply --limit=1
```

## 4. Embedding a complete HTML presentation

Do not split apart or rewrite an already finished HTML presentation. Preserve it as a single self-contained file under `lib/decks/`, then embed it in the article with an iframe:

```html
<div class="post-deck-embed">
  <div class="post-deck-embed-frame">
    <iframe src="/lib/decks/example.html" title="演示标题，共 17 页" allow="fullscreen"></iframe>
  </div>
  <p class="post-deck-embed-note"><span>共 17 页 · 可使用按钮或方向键翻页</span><span>手机端建议横屏后全屏阅读</span></p>
</div>
```

Add these frontmatter fields for a deck-led post:

```yaml
wide_content: true
hide_post_cover: true
deck_pages: 17
```

The cover still appears on listing cards, but it is not repeated above the presentation. Keep surrounding prose minimal: usually one short source/credit paragraph is enough. The presentation, article header, explanatory note, and tags must share a deliberate alignment; do not make the iframe arbitrarily wider than the rest of the page.

Files in `lib/` are copied into `dist/lib/` by `tooling/copy-static-assets.mjs` during the build.

## 5. Build and inspect locally

Install dependencies once with `npm ci`, then run:

```bash
npm run build
npm run check
git diff --check
npm run preview -- -p 4181
```

Open the generated article from `http://localhost:4181` and verify both desktop and mobile widths.

Required checks:

- title, description, date, category, tags, cover, and permalink are correct;
- no horizontal page overflow or clipped text;
- images load and use responsive variants;
- embedded HTML loads, remains visually intact, and can flip pages/fullscreen;
- comments load automatically;
- browser console has no new errors;
- external source links are correct;
- no API keys or private files appear in `git diff` or untracked files.

If theme CSS or JavaScript changed, increment its query-string version in `themes/tide/layout/layout.ejs` so Netlify and browsers do not retain an old immutable asset.

## 6. Commit and publish

Review the exact files first, then commit only the intended changes:

```bash
git status --short
git diff --check
git add <explicit paths>
git commit -m "Publish <article name>"
git push origin main
```

Pushing `main` triggers the existing Netlify project automatically:

- Project: `guileless-gnome-f84398`
- Site: `https://bblog.031105.xyz`
- Build: `npm run build && npm run check`
- Publish directory: `dist`
- Node.js: `22`

Do not manually upload `dist/` and do not commit it.

## 7. Verify production

Wait for Netlify, then open the exact public article URL with a cache-busting query during verification:

```text
https://bblog.031105.xyz/posts/.../article.html?release=<short-commit>
```

Confirm the new title/content is present, the embedded assets load, and at least one important interaction works. A successful Git push alone is not proof that publication finished.

Finally confirm:

```bash
git status --short
git rev-parse --short HEAD
git rev-parse --short origin/main
```

The worktree should be clean and both commit hashes should match.
