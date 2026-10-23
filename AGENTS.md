# AGENTS.md

## This is NOT the Next.js you know

<!-- BEGIN:nextjs-agent-rules -->

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

Single Next.js 16.4.2 App Router app (not a monorepo). Source lives in `src/`, routes in `src/app/`. React 19.3.

- Package manager: **npm** (`package-lock.json` is the lockfile; don't introduce pnpm/yarn/bun files).
- Path alias: `@/*` → `./src/*` (tsconfig).

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint 9 flat config (`eslint.config.mjs`); no path arg needed
- No test or typecheck script exists. For types: `npx tsc --noEmit` — but note `LayoutProps<"/">` and other route types are codegen'd into `.next/types/` (and `.next/dev/types/`), so run `npm run dev` or `npm run build` first or you'll get false errors.
- Verification order when changing code: `npm run lint` → `npx tsc --noEmit` → `npm run build`.

## Next 16 specifics in this repo

- `next.config.ts` enables `cacheComponents: true` and `partialPrefetching: true`. The old caching model (revalidate/fetch-cache options) does not apply as before — check `node_modules/next/dist/docs/` for the current data-fetching and caching conventions before using any caching API.
- Tailwind CSS v4, loaded via a Turbopack rule in `next.config.ts` (`@tailwindcss/turbopack`) — there is **no** `postcss.config.*`. Styles use `@import "tailwindcss"` and `@theme inline` in `src/app/globals.css`.
- Layouts/pages use generated props types (e.g. `LayoutProps<"/">`) instead of manually typed `{ children: React.ReactNode }` — follow that pattern for new routes.
