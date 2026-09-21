# Repository instructions for agents

When creating, updating, publishing, or embedding content in this blog, follow [`docs/PUBLISHING.md`](docs/PUBLISHING.md) completely.

Important defaults:

- Preserve existing user changes; do not run destructive Git commands.
- Never commit `.env`, API keys, tokens, or generated secrets.
- Run `npm run build`, `npm run check`, and `git diff --check` before publishing.
- A production release is complete only after the commit is pushed to `main` and the resulting page is verified on `https://bblog.031105.xyz`.

