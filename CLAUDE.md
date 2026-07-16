# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: read the bundled Next.js docs first

This project runs **Next.js 16.2.10 + React 19.2.4**. These are newer than most training data and contain breaking changes. Before writing or changing any Next.js/React code, read the relevant guide under `node_modules/next/dist/docs/` (`01-app` for App Router, `03-architecture`, `index.md`). Do not rely on remembered Next.js APIs — verify against those docs.

## Commands

```bash
npm run dev     # start dev server (Next.js)
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint (flat config)
```

No test runner is configured yet. If adding tests, wire the script into `package.json` and document the single-test invocation here.

## Architecture

- **App Router** under `app/`. `layout.tsx` is the root layout (loads Geist fonts, global CSS); `page.tsx` is the home route (still the default scaffold — replace it).
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` (`postcss.config.mjs`), imported in `app/globals.css`. No `tailwind.config` file — v4 is config-less by default.
- **TypeScript**: `strict` mode. Import alias `@/*` maps to repo root (`tsconfig.json`).
- **ESLint**: flat config (`eslint.config.mjs`) extending `eslint-config-next` core-web-vitals + typescript presets.

## Project intent & workflow

Arcade Vault is a platform to play games online and compete for the highest score (see `README.md`, in Spanish). Development follows **Spec-Driven Design** using the `/spec` and `/spec-impl` skills from [Klerith/fernando-skills](https://github.com/Klerith/fernando-skills) (`npx skills@latest add Klerith/fernando-skills`). Draft a spec before implementing features.
