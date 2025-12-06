# Tech Stack

Core technologies and developer tooling used by Odin.

- Node.js: 18+ (LTS recommended)
- Package manager: `pnpm`
- Frontend: SvelteKit 5 (TypeScript)
- Bundler: Vite
- Language: TypeScript (strict settings)
- DB layer: migrations and seeds in `src/lib/db/` (designed like TypeORM-style migrations)
- Test runners: repo unit tests and e2e (Playwright / Selenium under `e2e/`)
- Server: lightweight Node/Express adapter for local dev (`server/server.js`)

Developer tools

- linters/formatters: repo uses `pnpm format` for formatting; follow `.editorconfig`/prettier when present
- CI: GitHub Actions (see `.github/workflows`)
