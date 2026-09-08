# ChrisDing's bblog

The blog is now a maintainable Hexo project instead of only a committed static export. The historical public files remain in the repository as the migration source and as storage for existing media, while new production output is generated into `dist/`.

## Stack

- Node.js 22
- Hexo 8.1.2
- Redefine 2.9.0
- Artitalk 3.3.4, pinned and self-hosted during the build
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

The migrated posts intentionally contain their previously rendered article HTML inside a `legacy-content` wrapper. This preserves code blocks, encrypted payloads, links, and article markup without attempting a lossy HTML-to-Markdown conversion. New posts can use normal Markdown and Redefine 2.9 modules.

## Legacy assets

`tooling/copy-static-assets.mjs` preserves old image URLs and encrypted-post assets when building. `npm run fetch:media` can restore and verify all media files against the Git tree if a partial clone was used. `npm run migrate` regenerates migrated content from the legacy HTML and overwrites `content/_posts/`.

## Netlify

Netlify should use the committed settings:

- Build command: `npm run build && npm run check`
- Publish directory: `dist`
- Node version: `22`

Production deployment is intentionally not performed by the migration.
