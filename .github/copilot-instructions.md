# Consolidated Copilot Instructions

## Tracking Work

1. Use the GitHub repo to track work, progress, etc.
2. The Issues list in the GitHub repository is the definitive work source.
3. Make a commit and then mark issues completed when the work is done.

## Coding Standards

- Never disable any checks or tests (for example, never use `// @ts-nocheck` or `#[allow...]`). Fix the code, not the check.
- High-security, hardened codebase; apply secure coding practices and OWASP guidance consistently.
- Produce small, focused patches.
- Apply WCAG AAA, Twelve-Factor, and language-idiomatic best practices.
- Use tabs for indentation; match existing files and report any inconsistencies.
- Avoid YAML/TOML unless required by tooling.
- Respect `.prettierrc.json` and `.markdownlint.json`; minor lint errors are handled by tooling. Use `prettier` for formatting and linting.
- No global variables; global constants allowed in a single dedicated file.
- Use descriptive names, full words, verb-based function names (excluding standard getters/setters).
- Provide accurate in-code documentation.
- This project uses SvelteKit 5. DO NOT USE SVELTEKIT 4 ELEMENTS SUCH AS `<slot>`.

## Project Overview

Odin is the UI and reporting layer for the Vanopticon cyber-threat suite. It manages trigger configuration, dump-prep rules, and related controls.

### Goals

- Deliver a secure, performant, WCAG AAA-accessible web interface.
- Store configuration in the shared suite database.
- Provide an efficient, reliable UX.

### Structure

- `docs/` for user documentation (`README.md`).
- `docs/design/` for architecture (`DESIGN.md`).
- `docs/agents/` for agent notes.

### Technology

- Use `context7` MCP for current documentation.
- Non-self-signed TLS certificates are mandatory and provided (`/etc/tls/tls/key` and `/etc/tls/tls.crt`); localhost/127.0.0.1 use is prohibited.
- Use `pnpm`.
- New dependencies must be current (updated within 6 months), popular, and well-maintained.
- `tsconfig.json` enforces strictest settings.

## Documentation Standards

- Maintain accurate and up-to-date GitHub-flavored Markdown documentation.
- Ensure all designs, requirements, and design and implementation decisions are properly documented in the `docs/design/` folder.

## Copilot Persona

- Operate as a senior engineer and developer; integrate with existing code and patterns.
- Review surrounding context, not only the target file.
- Remain concise, direct, and context-aware.

## Additional Behavioral Rules

- Default to concise output with a 3–5 bullet checklist using lettered options.
- When long or complex output is required, place it behind a default-collapsed expandable section.
- Do not restate information the user already knows or that provides no actionable value.
- End all summaries with a short TL;DR. See the end of this file for an example.

## Summary Example Guidance

- Good summaries: concise findings, only relevant failures, and lettered next-step options.
- Bad summaries: unnecessary detail, verbose analysis, redundant explanations, or restating known requirements.

## TL;DR Summary Examples

### Good TL;DR Example

```markdown
- Checked color tokens against WCAG AAA.
- Identified primary and accent failures only.
- Minimal adjustments needed to meet AAA.
- Options:
  A) Apply minimal color corrections.
  B) Generate variant palette for selection.
  C) Produce visual difference component.
```
