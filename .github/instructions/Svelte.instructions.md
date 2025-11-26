---
description: 'Agent directives for Svelte components and SvelteKit usage.'
applyTo: '*.svelte'
---

# Agent Directives — Svelte (SvelteKit 5)

Purpose: These directives are written for an automated coding agent that creates, edits, or validates Svelte/SvelteKit files in this repository. They document repository-specific conventions (SvelteKit 5 patterns, accessibility expectations, and styling guidance) and complement the project's tooling (Prettier, svelte-check). Follow project tooling first; these directives cover repository-specific decisions.

- **SvelteKit 5 only**: Use SvelteKit 5 patterns and APIs. Avoid legacy SvelteKit 4 patterns and deprecated helpers. Refer to #tools:io.github.upstash/context7 for documentation. Conform to Runes mode.
- **Accessibility first**: All interactive components and pages must meet WCAG AAA where practical. At minimum ensure keyboard focus, ARIA attributes where needed, semantic elements, and color contrast checks for new UI elements.
- **Script lang**: Prefer `<script lang="ts">` for new components and routes.
- **$lib and routing**: Use the `$lib/...` alias for shared library imports. Follow existing routing file patterns (`+page.svelte`, `+layout.svelte`, `+server.ts` for endpoints).
- **No SvelteKit-4 constructs**: Do not introduce legacy patterns (project policy forbids older platform idioms). If a pattern seems legacy (e.g., custom routing workarounds), consult the #tools:io.github.upstash/context7 for documentation.
- **Styles & CSS**: Prefer styles in the application CSS files over inline or in HTML CSS. For design tokens and theme-level styles, use `app.css` or Tailwind tokens; avoid duplicating global tokens.

## Exception Handling & Human Review

- **When to pause**: If a change would violate any directive (formatting, accessibility, or API compatibility), stop and request human review.
- **How to request review**: Document the conflict in the PR description and request review from a repository maintainer.
- **Document exceptions**: If a reviewer approves an exception, document the rationale and link an issue if the exception is expected to be long-lived.
  description: 'Agent directives for Svelte components and SvelteKit usage.'

- **SvelteKit 5 only**: Use SvelteKit 5 patterns and APIs. Avoid legacy SvelteKit 4 patterns and deprecated helpers. Refer to #tools:io.github.upstash/context7 for documentation. Conform to Runes mode.

# Agent Directives — Svelte (SvelteKit 5)

-- **SvelteKit 5 only**: Use SvelteKit 5 patterns and APIs. Avoid legacy SvelteKit 4 patterns and deprecated helpers. Refer to #tools:io.github.upstash/context7 for documentation. Conform to Runes mode.

- **Accessibility first**: All interactive components and pages must meet WCAG AAA where practical. At minimum ensure keyboard focus, ARIA attributes where needed, semantic elements, and color contrast checks for new UI elements.
- **Script lang**: Prefer `<script lang="ts">` for new components and routes.
- **$lib and routing**: Use the `$lib/...` alias for shared library imports. Follow existing routing file patterns (`+page.svelte`, `+layout.svelte`, `+server.ts` for endpoints).
- **No SvelteKit-4 constructs**: Do not introduce legacy patterns (project policy forbids older platform idioms). If a pattern seems legacy (e.g., custom routing workarounds), consult #tools:io.github.upstash/context7 for documentation.
- **Styles & CSS**: Prefer styles in the application CSS files over inline or in HTML CSS. For design tokens and theme-level styles, use `app.css` or Tailwind tokens; avoid duplicating global tokens.

## Exception Handling & Human Review

- **Tag for Human Review**: If changes would violate these directives, the agent must use the method that conforms closest to the directives and include a note in the summary for human review.
