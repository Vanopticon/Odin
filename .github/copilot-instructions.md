# Copilot Instructions

## Project Overview

Odin is the management and reporting interface for the Vanopticon cyber-threat suite. It controls detection tuning, configuration management, feed/source administration, and audited change history. It emphasizes operational clarity, explainability, and accessibility. Odin prepares and evaluates detection logic but does not collect telemetry.

## Folder Structure

- `.github/`: GitHub configuration, agent instructions, etc.
- `docs/`: User documentation
- `docs/design/`: Architecture and design docs
- `docs/agents/`: Agent notes
- `server/`: Source code to start the hardened server
- `src/`: Core source code
- `static/`: Static and shared files for SvelteKit
- Other dot folders (`.`): Used by tooling; can safely be ignored
- `node_modules`, `test-results`: Cache and output folders for `pnpm`

## Libraries, Frameworks, and Technologies

- **Typescript** (primary language)
- **SvelteKit v5+** (Runes mode-compatible patterns only)
- **Node LTS v25+**
- **pnpm v10+**
- **TailwindCSS v4+**
- **TypeORM v0.3+**, **pg v8+**
- **dotenv** (latest)

Supporting tools: Vite, Vitest, Playwright, Prettier.

## Workflow

- Use GitHub Issues as the sole source of truth for tasks.
- Work one Issue at a time.
- Create feature branches from `v1.0.0.0` and name them after the feature.
- Review surrounding/related code and search for related types or utilities before editing.
- Produce **small, focused patches**; commit frequently with Issue links.
- Update user/design documentation when behavior or interfaces change.
- Open a PR upon completion; link all relevant Issues.

## Coding Standards

- Never disable checks or tests (e.g. `// @ts-nocheck`, `#[allow...]`). Fix code, not checks.
- Maintain a **high-security, hardened codebase**; follow secure coding practices and OWASP guidance.
- Follow **WCAG AAA**, **Twelve-Factor App**, and language-idiomatic best practices.
- Use **tabs for indentation**; match existing file conventions. Report inconsistencies.
- No global variables; global constants are allowed in a **dedicated constants file only**.
- Use **descriptive names**, full words, and verb-based function names (except standard getters/setters).
- Provide **accurate in-code documentation** for public elements and to clarify complex code.

## Copilot Persona & Behavior

- Output **concise, direct, and context-aware** suggestions.
- End responses with a **3-5 bullet tl;dr style summary**.
- Assume that the user has a thorough knowledge and does not need detailed explanations by default. They will ask if more information is required.
- Your knowledge on everything is out of date because your training date is in the past. Refer to documentation via the context7 MCP to ensure you are following the most recent patterns and are using the patterns applicable to the most recent release of the libraries.
- Operate as an automated agent:
    + Ask clarifying questions **before** starting work.
    + Once work begins, complete the task without interrupting.
    + Maintain continuity until implementation is fully done.

## Templates

- **TL;DR Summary Example**

```markdown
- Checked [component] for compliance.
- Found [X issues] affecting [criteria].
- Minor changes to the logic for [function].
- Options:
  A) Fix [issue type] immediately.
  B) Review [alternative solution].
  C) Defer non-critical changes.
```

## Tooling

- Use any available MCP tools.
- Prefer GitHub MCP over `gh` CLI.
- Use context7 MCP server for current documentation:
    + `/sveltejs/kit` for SvelteKit
    + `tailwindcss.com/docs` for TailwindCSS
    + `/hapijs/hapi` for @hapi
