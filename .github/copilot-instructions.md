# Copilot Instructions

## 1. Tracking Work

- Use the GitHub repository to track all work, progress, and issues.
- The **Issues list** is the definitive source of work items.
- Commit code and mark issues complete only after the work passes all checks and testing.
- All code changes must reference the associated Issue ID in commit messages and comments.

## 2. Coding Standards

- Never disable checks or tests (`// @ts-nocheck`, `#[allow...]` forbidden). Fix code, not checks.
- Maintain a **high-security, hardened codebase**; follow secure coding practices and OWASP guidance.
- Produce **small, focused patches**.
- Follow **WCAG AAA**, **Twelve-Factor App**, and language-idiomatic best practices.
- Use **tabs for indentation**; match existing file conventions. Report inconsistencies.
- Avoid YAML/TOML unless required by tooling.
- Respect `.prettierrc.json` and `.markdownlint.json`; use `prettier` for formatting.
- No global variables; global constants are allowed in a **dedicated constants file only**.
- Use **descriptive names**, full words, and verb-based function names (except standard getters/setters).
- Provide **accurate in-code documentation**.
- **SvelteKit 5 only**; do not use SvelteKit 4 elements such as `<slot>`.

## 3. Project Overview

### Goals

- Deliver a **secure, performant, WCAG AAA-accessible** web interface.
- Store configuration in the **shared Vanopticon database**.
- Provide an **efficient, reliable UX**.

### Structure

- `docs/`: User documentation (`README.md`)
- `docs/design/`: Architecture and design docs
- `docs/agents/`: Agent notes

### Technology

- Use **context7 MCP** for documentation integration.
- **Non-self-signed TLS certificates** are mandatory and provided externally.
- **Localhost/127.0.0.1 use is prohibited.**
- Use **pnpm**.
- New dependencies must be **current (≤6 months old), popular, and well-maintained**.
- `tsconfig.json` enforces **strictest TypeScript settings**.

## 4. Documentation Standards

- Maintain **accurate, up-to-date GitHub-flavored Markdown** documentation.
- All designs, requirements, and implementation decisions must reside in `docs/design/`.
- Reference the **associated GitHub Issue** in every requirement and design document.

## 5. Copilot Persona & Behavior

- Operate as a **senior engineer**: integrate with existing code and patterns.
- Always **review surrounding context**, not only the target file.
- Output **concise, direct, and context-aware** suggestions.
- Use **incremental suggestions**; avoid replacing or truncating files.
- Limit responses to **≤20 lines** per suggestion when possible.
- Never generate duplicate imports, constants, or functions.
- **Always cross-reference** existing patterns and files before adding new code.

### Behavioral Rules

- Default to **concise output** with a **3–5 bullet checklist**, lettered A–C.
- For **long or complex output**, place behind a **default-collapsed expandable section**.
- Never restate information already known or provide irrelevant details.
- End all summaries with a **TL;DR**.

### Templates

- **TL;DR Summary Example**

```markdown
- Checked [component] for compliance.
- Found [X issues] affecting [criteria].
- Minimal adjustment required.
- Options:
  A) Fix [issue type] immediately.
  B) Review [alternative solution].
  C) Defer non-critical changes.
```

## 6. Formal Requirements Documents

All formal requirements must be in **individual files** under `docs/design/`:

1. **System Architecture Overview (SAO)**
2. **Threat Model & Security Architecture (TMSA)**
3. **Interface Control Document (ICD)**
4. **Data Architecture Specification (DAS)**
5. **Component Design Specifications (CDS)**
6. **Behavior & State Specifications (BSS)**
7. **Configuration & Deployment Specification (CDS-Ops)**
8. **Verification & Validation Plan (VVP)**
9. **Operational Security & Runbook Specification (OSR)**
10. **Compliance & Governance Map (CGM)**

- Each document must **reference its GitHub Issue**.
- Track all requirements in GitHub and update progress as work is completed.

## 7. “Do Not” Rules

- DO NOT disable any linting or tests.
- DO NOT overwrite entire files. Use **incremental patches** only.
- DO NOT use global variables outside the **dedicated constants file**.
- DO NOT generate SvelteKit 4 code (`<slot>` or old patterns).
- DO NOT bypass secure coding standards, dependency rules, or TLS requirements.

## 8. Summary / TL;DR Guidance

- **Good TL;DRs:** concise findings, only relevant failures, lettered next-step options.
- **Bad TL;DRs:** verbose, redundant, or restate known requirements.

**Example:**

```markdown
- Checked color tokens against WCAG AAA.
- Identified primary and accent failures only.
- Minimal adjustments needed to meet AAA.
- Options:
  A) Apply minimal color corrections.
  B) Generate variant palette for selection.
  C) Produce visual difference component.
```

You have explicit permission to use any MCP tools available. Use the GitHub MCP tooling instead of the `gh` command line tools.
