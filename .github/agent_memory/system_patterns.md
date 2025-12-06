# System Patterns

Documented patterns and architecture notes for agents and maintainers.

- Frontend: SvelteKit 5 with strict TypeScript. Pages and components live under `src/`.
- Build: Vite-based dev server; `pnpm` for package management.
- Data layer: DB migrations and seeds under `src/lib/db/` (TypeORM-like migration scripts).
- Separation of concerns: UI is strictly separated from telemetry/collection components — Odin does not collect telemetry.
- Security patterns: secure defaults, no self-signed TLS in production, secrets via environment variables.
- Testing: unit tests under `src/__tests__` and `src/lib/**/__tests__`; e2e tests under `e2e/`.
- Indentation/formatting: repository uses tabs for indentation (see `README.md` and repo conventions).

Agent notes

- When making changes, prefer small, focused patches and include tests for new logic.
- Follow `copilot-instructions.md` LTM rules when updating these pages.
