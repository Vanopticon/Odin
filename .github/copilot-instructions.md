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

This process must be followed in its entirety for all work:

- Use GitHub Issues as the sole source of truth for tasks. The GitHub MCP should be available and authenticated. If repository access is not available or the GitHub MCP call fails, stop and notify the user immediately.
- Work one Issue at a time.
- Create feature branches from `v1.0.0.0` and name them after the feature.
- Create or modify tests as appropriate, both unit and UX.
- Review surrounding/related code and search for related types or utilities before editing.
- Produce **small, focused patches**; commit frequently with Issue links.
- Iterate until the implementation is complete and all tests are passing
- Update user/design documentation when behavior or interfaces change.
- Use `pnpm test`, `pnpm lint` and `pnpm format` as linting, formatting, and testing tools. They are all provided and the scripts are in the `package.json`.
- Open a PR upon completion; link all relevant Issues.

## Coding Standards

- Instructions specific to a language or file supersede these.
- Never disable checks or tests (e.g. `// @ts-nocheck`, `#[allow...]`). Fix code, not checks. Compliance may be enforced using search tooling, or by running the `lint` script provided in `package.json`.
- Maintain a **high-security, hardened codebase**; follow secure coding practices and OWASP guidance.
- Prioritize accessibility and apply WCAG principles alongside Twelve-Factor App and language-idiomatic best practices. The agent will enforce and run automated, testable WCAG checks where possible (for example: color contrast checks, presence of ARIA attributes when required, semantic HTML usage, keyboard focusability, and configured automated a11y linter rules). For accessibility items that cannot be validated automatically (manual UX heuristics, full AAA conformance checks requiring human judgement, or user testing), the agent will document them in the change summary and request human review. Document any conflicts, your evaluation, and the approach taken.

- Use **tabs for indentation** unless a file-type-specific instruction overrides this (for example, YAML uses 2 spaces). Prefer tabs across the codebase for accessibility and consistency. Do not require a PR-level annotation solely because a contributor used spaces instead of tabs; only significant, systemic, or confusing indentation inconsistencies should be noted in the PR at maintainer discretion.
- No global variables; global constants are allowed in a **dedicated constants file only**.
- Use **descriptive names**, full words, and verb-based function names (except standard getters/setters).
- Provide **accurate in-code documentation** for public elements and to clarify complex code.
- Include positive, negative, and security tests for all code.

## Acceptance Criteria

- Tests cover positive, negative, and security cases for all code units.
- Tests cover all normal user interactions and common user errors.
- All tests are passing.
- The Issue has been completely resolved.

## Copilot Persona & Behavior

- Output **concise, direct, and context-aware** suggestions.
- End responses with a **3-5 bullet tl;dr style summary**.
- Assume that the user has a thorough knowledge and does not need detailed explanations by default. They will ask if more information is required.
- Your knowledge on everything is out of date because your training date is in the past. Refer to documentation via the context7 MCP to ensure you are following the most recent patterns and are using the patterns applicable to the most recent release of the libraries.
- Operate as an automated agent:
    + Ask clarifying questions **before** starting work.
    + Once work begins, complete the task without interrupting.
    + Maintain continuity until implementation is fully done.
- Follow the "solo developer" style instead of pair programming because you are the only developer on this project.
- External credentials will be provided, e.g. GitHub authentication.
- If a needed system is not accessible, stop immediately, notify the user which system and what access is required, and they will make the needed corrections before prompting you to continue.

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
