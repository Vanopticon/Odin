# Contributing to Vanopticon: Odin

Thanks for your interest in contributing to Odin. We welcome bug fixes, documentation updates, tests, and well-scoped feature improvements.

Before you start

- Search existing issues and PRs to avoid duplication.
- Open an issue for larger changes to discuss design before implementing.

Branching & commits

- Branch from `v1.0.0`. Name branches as `feature/short-description` or `fix/short-description`.
- Commit messages should be short and imperative (e.g., "Add migration for users table"). Include a longer description in the commit body when necessary.

Pull requests

- Open your PR against `v1.0.0` and include a concise description of the change, rationale, and any relevant screenshots or test results.
- Keep PRs small and focused; prefer multiple smaller PRs over one large change.
- Add or update tests for behavior changes.

Code style and tests

- This repo uses TypeScript and SvelteKit. Follow existing patterns and the `tsconfig.json` strictness settings.
- Use tabs for indentation to match project style.
- Run tests and linting locally before opening a PR.

## End-to-end tests (Selenium + Chromedriver)

The repository uses a custom Selenium runner `scripts/run-e2e-selenium.cjs` which prefers a system-installed `chromedriver` and spawns it on an ephemeral port. The runner will start the dev server, wait for it to be reachable, locate/launch a Chromedriver, wait for readiness, then run a minimal E2E smoke check.

Prerequisites:

- Install Chromium or Google Chrome on your machine.
- Install a matching `chromedriver` for your Chrome/Chromium version (distribution packages like `chromium-chromedriver` or vendor downloads are fine). Ensure `chromedriver` is executable and available at a system path (e.g. `/usr/bin/chromedriver`).

Environment variables used by the runner:

- `OD_HOST` (optional) — host used when building `BASE_URL` (default: system hostname).
- `OD_PORT` (optional) — port used when building `BASE_URL` (default: `3000`).
- `OD_CHROMEDRIVER_PORT` (optional) — if set, the runner will attempt to use this port for Chromedriver; otherwise the runner spawns Chromedriver on an ephemeral port and connects to it.

Run locally:

```bash
pnpm test:e2e
```

Troubleshooting:

- If you see `SessionNotCreatedError` or `Chrome instance exited`, ensure the installed `chromedriver` version is compatible with your Chrome/Chromium binary.
- If you see `ECONNREFUSED` to the chromedriver URL, ensure the chromedriver binary is executable and not already bound to the requested port. You can set `OD_CHROMEDRIVER_PORT` to a free port or let the runner use ephemeral ports.

CI notes:

- In CI, install both Chrome/Chromium and the corresponding Chromedriver before running `pnpm test:e2e`. For reproducibility prefer installing a specific chrome-for-testing release or using distribution packages that guarantee compatible versions.

CI and checks

- The project uses GitHub Actions for CI. Ensure your change passes the repository CI checks before requesting review.

Security & responsible disclosure

- Do not include secrets (API keys, credentials) in commits or PRs.
- See `SECURITY.md` for reporting vulnerabilities.

Thanks — the maintainers will review PRs and provide feedback. If you'd like to help triage issues or become a maintainer, open an issue to start the conversation.
