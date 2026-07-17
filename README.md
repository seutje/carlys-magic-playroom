# Carly's Magic Playroom

A browser-only educational 3D game for young children. The project is currently establishing its repository foundation; product requirements live in [DESIGN.md](DESIGN.md) and implementation status lives in [PLAN.md](PLAN.md).

## Requirements

- Node.js 24 or a compatible Node.js release at least 22.12
- npm 11+

## Local development

```bash
npm ci
npm run dev
```

The development server uses `/`. Production is entirely static and does not require Node.js after building.

## Validation

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

`npm run test:e2e` builds and serves the app under `/carlys-magic-playroom/` and runs desktop and tablet-sized Chromium projects. Failure traces, screenshots, and videos are written to ignored Playwright artifact directories.

The root-hosted production path can be exercised separately with `PLAYWRIGHT_ROOT=1 npm run test:e2e`.

## GitHub Pages preview

```bash
npm run preview:pages
```

Open `http://127.0.0.1:4173/carlys-magic-playroom/`. The build uses `VITE_BASE_PATH=/carlys-magic-playroom/`. A different static host path can be tested with the same environment variable:

```bash
VITE_BASE_PATH=/another-path/ npm run build
```

Application-owned public assets must be referenced through `assetUrl("relative/path")`; root-relative runtime asset URLs are rejected by convention and unit test.

## Deployment

The Pages workflow validates the project, builds with the repository subpath, uploads `dist`, and deploys only after every job succeeds.

In GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**. The repository name must remain `carlys-magic-playroom`, or `build:pages` and the documented preview path must be updated together. No server, secret, database, or external runtime service is used.

Build metadata is available only when `?diagnostics=1` is added to the application URL.
