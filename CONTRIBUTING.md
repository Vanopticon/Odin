# Contributing to Vanopticon: Odin

Thanks for your interest in contributing to Odin. We welcome bug fixes, documentation updates, tests, and well-scoped feature improvements.

Before you start

- Search existing issues and PRs to avoid duplication.
- Open an issue for larger changes to discuss design before implementing.

Branching & commits

- Branch from `main`. Name branches as `feature/short-description` or `fix/short-description`.
- Commit messages should be short and imperative (e.g., "Add migration for users table"). Include a longer description in the commit body when necessary.

Pull requests

- Open your PR against `main` and include a concise description of the change, rationale, and any relevant screenshots or test results.
- Keep PRs small and focused; prefer multiple smaller PRs over one large change.
- Add or update tests for behavior changes.

Code style and tests

- This repo uses TypeScript and SvelteKit. Follow existing patterns and the `tsconfig.json` strictness settings.
- Use tabs for indentation to match project style.
- Run tests and linting locally before opening a PR.

CI and checks

- The project uses GitHub Actions for CI. Ensure your change passes the repository CI checks before requesting review.

Security & responsible disclosure

- Do not include secrets (API keys, credentials) in commits or PRs.
- See `SECURITY.md` for reporting vulnerabilities.

Thanks — the maintainers will review PRs and provide feedback. If you'd like to help triage issues or become a maintainer, open an issue to start the conversation.
