# Technologies

This file lists the primary technologies and libraries used in the Odin codebase as of 2025-11-30.

## Core stack

- Language: `TypeScript` (project is TypeScript-first)
- Frontend: `Svelte` / `SvelteKit` (Svelte v5 + `@sveltejs/kit`)
- Server: Node.js (custom `server/` entry point)
- Package manager: `pnpm`

## Libraries (selected, from `package.json`)

- Web/server frameworks: `@hapi/hapi`, `express` (some server utilities)
- DB: `pg`, `typeorm`
- Validation: `zod`
- Observability: `prom-client`, `@opentelemetry/*`
- Testing: `vitest`, `testcontainers`, e2e scripts under `scripts/` and `e2e/`
- Frontend tooling: `vite`, `tailwindcss`, `svelte-check`, `prettier`

## Recommendations

- Use `zod` for runtime validation and export schemas for OpenAPI docs.
- Prefer `testcontainers` for DB-related tests to keep CI reproducible and isolated.
