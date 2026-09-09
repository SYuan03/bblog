# ChrisDing's bblog

The blog is now a maintainable Hexo project instead of only a committed static export. The historical public files remain in the repository as the migration source and as storage for existing media, while new production output is generated into `dist/`.

## Stack

- Node.js 22
- Hexo 8.1.2
- Tide, a custom editorial theme maintained in this repository
- Twikoo comments, pinned and self-hosted during the build
- Netlify build configuration in `netlify.toml`

## Local development

```bash
npm ci
npm run dev
```

Build and validate the deploy output:

```bash
npm run build
npm run check
```

`npm run check` verifies route count, local asset references, theme migration, and text parity for all 44 migrated posts.

## Writing

Create new Markdown posts under `content/_posts/`, or use:

```bash
npx hexo new post "Post title"
```

The migrated posts intentionally contain their previously rendered article HTML inside a `legacy-content` wrapper. This preserves code blocks, encrypted payloads, links, and article markup without attempting a lossy HTML-to-Markdown conversion. New posts can use normal Markdown.

Cards and social previews prefer an explicit `cover` and `description`. When either is absent, Tide uses a clean text excerpt and a deterministic visual fallback; body screenshots are never promoted to covers automatically.

To enrich missing metadata through Hub Router, copy `.env.example` to a local ignored env file, export `HUBROUTER_API_KEY` in your shell, inspect the dry run, and then apply it:

```bash
npm run enrich:posts
npm run enrich:posts -- --apply --limit=3
```

The command never stores the API key, preserves existing metadata, uses `gpt-image-2` by default, and writes compressed WebP covers under `content/generated-covers/`. Models and image size can be overridden with the environment variables shown in `.env.example`; `JoyAI-Image` remains available as a lower-cost option, but its typography control is less reliable for text-free covers.

## Legacy assets

`tooling/copy-static-assets.mjs` preserves old image URLs and encrypted-post assets when building. `npm run fetch:media` can restore and verify all media files against the Git tree if a partial clone was used. `npm run migrate` regenerates migrated content from the legacy HTML and overwrites `content/_posts/`.

## Netlify

Netlify should use the committed settings:

- Build command: `npm run build && npm run check`
- Publish directory: `dist`
- Node version: `22`

Production deployment is intentionally not performed by the migration.
