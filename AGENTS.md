# Repository Guidelines

## Project Structure & Module Organization

This repo is a Vue 3 + Vite static site (GitHub Pages).

- `src/`: application source
- `src/main.js`: app entry; mounts Vue + router
- `src/router/index.js`: route definitions + navigation progress
- `src/views/*View.vue`: route-level pages
- `src/components/`: shared Vue components (PascalCase filenames)
- `src/blogs/*.md`: blog posts loaded via `import.meta.glob`
- `src/data/profile.json`: site/profile data (also references static assets)
- `public/`: static assets served at site root (example: `/certs/...`)
- `dist/`: production build output (generated)

## Build, Test, and Development Commands

Run from repo root:

```bash
npm install     # install dependencies
npm run dev     # local dev server (Vite)
npm run build   # production build into dist/
npm run preview # serve dist/ locally to smoke-test the production build
```

CI/CD uses Node 20 (see `.github/workflows/deploy.yml`).

## Coding Style & Naming Conventions

- 2-space indentation; keep existing no-semicolons + single-quote style.
- Prefer Vue SFC Composition API with `<script setup>`.
- Route views: `src/views/*View.vue`; reusable components: `src/components/PascalCase.vue`.
- Blog post IDs come from filenames: `src/blogs/<slug>.md` becomes `/blog/<slug>`.

Blog post frontmatter should include at least:
`title`, `date` (parseable by `new Date(...)`), `category`, optional `tags` like `[a, b]`.

## Testing Guidelines

No automated test runner is configured currently. For changes, at minimum:

1. `npm run dev` and click through routes.
2. `npm run build` and `npm run preview` to verify the production bundle.

## Commit & Pull Request Guidelines

Git history is lightweight (many commits named `update`, with occasional `Fix ...` / `Major overhaul`).
Use short, descriptive, imperative messages going forward (example: `Fix blog post routing`).

For PRs:
- Describe behavior change and include test steps.
- Include screenshots for UI changes (desktop + mobile).
- Keep PRs focused; avoid committing `dist/` unless explicitly required.

## Deployment & Configuration Notes

Merges/pushes to `main` trigger the GitHub Pages workflow that builds and deploys `dist/`.
If deploying under a subpath, update `base` in `vite.config.js` accordingly.
