# Project board proposal — Odin

This file describes a recommended GitHub Project board layout and maps the master TODO issues into columns so maintainers can create the project quickly.

Recommended columns (manual creation in GitHub Projects UI):

- Backlog — new and untriaged issues
- Ready — issues scoped and ready to work on
- In Progress — actively worked issues / PRs
- Review — PRs awaiting review or QA
- Done — merged and released work

Suggested labels

- `spec` — requirement/spec work
- `design` — architecture/UI design
- `backend` — API and server work
- `frontend` — UI and component work
- `database` — migrations and seeds
- `testing` — unit/integration/e2e tests
- `security` — secrets, CI, and TLS work
- `ops` — release, deployment, logging

Suggested mapping (move items below into columns as you triage):

- Backlog
  - <https://github.com/Vanopticon/Odin/issues/17> — Audit repository artifacts
  - <https://github.com/Vanopticon/Odin/issues/16> — Define product requirements
  - <https://github.com/Vanopticon/Odin/issues/15> — Create high-level designs
  - <https://github.com/Vanopticon/Odin/issues/14> — Implement OAuth integration
  - <https://github.com/Vanopticon/Odin/issues/13> — Design user/role/permission model

- Ready
  - <https://github.com/Vanopticon/Odin/issues/12> — Enforce permission checks (routes)
  - <https://github.com/Vanopticon/Odin/issues/10> — Enforce permission checks (UI controls)
  - <https://github.com/Vanopticon/Odin/issues/9> — Backend APIs & persisted sessions
  - <https://github.com/Vanopticon/Odin/issues/8> — Database migrations and seed data

- In Progress
  - <https://github.com/Vanopticon/Odin/issues/7> — Frontend implementation & accessibility
  - <https://github.com/Vanopticon/Odin/issues/5> — Testing: unit, integration, e2e

- Review
  - <https://github.com/Vanopticon/Odin/issues/4> — CI, secrets, and security checks
  - <https://github.com/Vanopticon/Odin/issues/6> — Docs: developer + operator guides

- Done
  - <https://github.com/Vanopticon/Odin/issues/11> — Observability & logging
  - <https://github.com/Vanopticon/Odin/issues/3> — Release & deployment checklist

How to create the project quickly

1. Open GitHub > Projects > New project (classic or beta Projects depending on your org settings).
2. Create columns matching the list above.
3. Use the issue links above to add cards. Assign labels and milestones per your release plan.

Automation tips

- Link PRs to issues by including "Closes #<issue>" in the PR description — the card will move to Done when merged (if automation is enabled).
- Use `assignees`, `labels`, and `milestones` to drive CI pipelines and releases.

If you'd like, I can attempt to create the GitHub Project via the API—give me permission and I'll proceed. Otherwise you can create it manually using this mapping.
