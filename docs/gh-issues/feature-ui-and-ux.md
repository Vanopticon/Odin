---
title: 'User Interface Patterns and Accessibility'
labels: ['feature', 'ui']
---

Summary

Guidance for SvelteKit UI components, state management, controls, and WCAG accessibility requirements.

Description

Define component patterns, theming, keyboard navigation, and automations for the operator workflows (tuning, feeds, audit). Ensure WCAG AAA where feasible and include automated accessibility tests.

Acceptance criteria

- Key pages reachable and operable via keyboard and screen reader.
- Forms validate equivalently server and client side.
- E2E tests cover major workflows (homepage, login, triggers endpoints).

Tasks

- Review `src/lib/controls/panel.svelte` and document patterns to reuse.
- Add basic axe-core accessibility checks in the e2e pipeline.
- Document design tokens (colors, spacing) and ensure consistent usage.

References

- `src/lib/controls/`
- `src/routes/+layout.svelte`
- `static/`, `app.theme.css`
