# Odin (Svelte app)

Everything you need to build and run the Odin Svelte app.

## Prerequisites

Install dependencies with your package manager of choice. This repository uses `pnpm`:

```bash
pnpm install
```

## Development

Start the development server (the project uses an express wrapper in `server/server.js` for dev):

```bash
pnpm run dev
```

## Build & Preview

Create a production build and preview it locally:

```bash
pnpm run build
pnpm run preview
```

The `preview` script runs `vite preview` on port `4173` (Playwright expects this by default).

## Tests

Run unit and end-to-end tests:

```bash
pnpm test
```

- `pnpm run test:unit` — runs Vitest unit tests.
- `pnpm run test:e2e` — runs Playwright end-to-end tests (Playwright will build and preview the app automatically).

Notes:
- The project uses `pnpm` across scripts and CI — Playwright is configured to run `pnpm run build && pnpm run preview` as the test web server.
- A minimal smoke unit test exists at `src/__tests__/smoke.test.ts` to ensure the unit test runner is present in CI.

## Deploy

To deploy, choose the appropriate SvelteKit adapter for your platform. See https://svelte.dev/docs/kit/adapters for options.
