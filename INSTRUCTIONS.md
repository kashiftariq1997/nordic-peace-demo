# INSTRUCTIONS.md

Project preferences and conventions for Nordic Peace. Every change must follow these.

## Before coding

- Read `AGENTS.md` first. **Never edit `AGENTS.md`** — `next dev` regenerates its managed block; edits are overwritten.
- This Next.js version differs from older ones. Read the relevant guide in `node_modules/next/dist/docs/` before using any Next.js API. Heed deprecation notices.

## Folder structure (everything inside `src/`)

```
src/
  app/          routes, layouts, route handlers only
  components/
    ui/         small reusable pieces (Button, Input, Badge)
    layout/     Header, Footer, Container
    common/     shared pieces used across pages
  constants/    app-wide constants (routes, site config, nav links)
  hooks/        custom React hooks
  icons/        SVG icons as React components
  images/       static images imported in code
  lib/          third-party clients and setup
  services/     API and data-fetching functions
  providers/    React context providers
  types/        shared TypeScript types
  utils/        pure helper functions
```

- `src/app/` holds route files only — no business logic or reusable components.
- Each folder listed above gets an `index.ts` barrel file (components subfolders, `constants`, `hooks`, `icons`, `lib`, `services`, `providers`, `types`, `utils`). `src/images/` gets a `.gitkeep` instead.
- Always import through the `@/` alias (`@/components/ui`), never long relative paths.

## Code quality

- TypeScript strict mode. No `any`, no `@ts-ignore`, no `eslint-disable` unless truly unavoidable — and then leave a comment explaining why.
- Zero TypeScript errors, zero ESLint errors, zero ESLint warnings at all times.
- Prettier formats the codebase: `.prettierrc` (double quotes, semicolons, 2 spaces, trailing commas `"all"`, printWidth 100, Tailwind plugin) and `.prettierignore`. `eslint-config-prettier` is loaded in `eslint.config.mjs` so ESLint and Prettier never conflict.

## Naming conventions

- Component files and components: PascalCase (`ProductCard.tsx`). One component per file.
- Hooks: camelCase starting with `use` (`useCart.ts`).
- Constants: UPPER_SNAKE_CASE values in kebab-case files (`site-config.ts`).
- Utils and services: camelCase functions in kebab-case files.
- Types: PascalCase, kept in `src/types` or next to the component if only used there.

## Rendering

- Server Components by default. Add `"use client"` only where the component actually needs client-side features (state, effects, event handlers), and keep client boundaries as small as possible.
- Route components use the generated props types (`LayoutProps<"/">`, `PageProps<"/route">`) instead of hand-typed `{ children: React.ReactNode }`.

## Before finishing any task

Run all four and fix everything that fails:

```bash
npm run type-check
npm run lint
npm run format:check
npm run build
```
