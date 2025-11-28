# Copilot Instructions

## Long Term Memory (LTM, brain)

- The Obsidian Brain MCP server (a.k.a. LTM, or brain) is the primary source of project knowledge.
- You MUST begin every session by reading the LTM, no exceptions.
- You are responsible for managing the LTM, including seeding keys if missing or needed. Do not confirm before acting on this. Do not pause for any reason before doing this. Do not ask permission to interact with the Obsidian Brain MCP, you may use it as needed.

LTM uses a hierarchical structure with these core LTM keys:

- Required LTM keys:
    + project_brief - Foundation document
    + active_context - Current work state and focus
    + system_patterns - Architecture and design patterns
    + tech_stack - Technologies and setup
    + progress_tracker - Status and next steps

- Optional LTM Keys:
    + feature_specs - Detailed feature documentation
    + api_docs - API specifications
    + testing_strategy - Testing approaches
    + deployment_notes - Deployment procedures
    + user_preferences - User-specific preferences and decisions

### Long Term LTM Triggers

Append or update LTM when:

- The user explicitly requests you to update LTM
- Significant architectural decisions are made
- New patterns or preferences are established
- The status of the project changes, or features are completed or modified
- The technical setup changes
- Project scope or requirements evolve
- New user preferences, patterns and practices for the project, or expectations are identified
- An existing LTM needs to be updated to reflect current state
- A new plan, sequence, or similar is created.
- You provide the end of a response. At that point add a summary to the Obsidian Brain MCP.

### LTM Validation and Maintenance

- Regularly verify LTM accuracy (at least once per session):
    + Ensure all essential keys exist and are current
    + Check that LTM reflects actual project state
    + Validate that patterns in LTM match implementation

- Cross-reference decisions across LTM keys
- Ensure active_context aligns with progress_tracker
- Verify tech_stack matches actual dependencies
- Confirm system_patterns reflect current architecture

### Context Handoff

When context window is 75% full:

1. Summarize toLTM: obsidian_brain: append
2. Update workspace LTM: LTM: create
3. Create handoff: Use handoff tool for new thread

## Project Overview

Odin is the management and reporting interface for the Vanopticon cyber-threat suite. It controls detection tuning, configuration management, feed/source administration, and audited change history. It emphasizes operational clarity, explainability, and accessibility. Odin prepares and evaluates detection logic but does not collect telemetry.

## Folder Structure

- `docs/`: User documentation
- `docs/design/`: Architecture and design docs
- `docs/agents/`: Agent notes, use at your discretion
- `server/`: Source code to start the hardened server
- `src/`: Core source code
- `static/`: Static and shared files for SvelteKit
- Other dot folders (`.`): Used by tooling; can safely be ignored

## Vital Guidelines

- Only work on one feature, bug, or requirement at a time.
- If selecting work, choose the feature, bug, or requirement with the greatest impact, or if in doubt select the first item.

## Workflow

This process must be followed in its entirety for all work:

- Read through the Obsidian Brain MCP. Discard irrelevant information. Summarize and replace the results of this scan. If LTM is unavailable stop and notify the user for intervention.
- Ask any questions and make any suggestions prior to beginning work. Summarize and replace the Q&A.
- Create a feature branch from `v1.0.0` and name it after the feature.
- Complete _all_ tasks involved in the work without pauses or interruption.
- Create or modify tests for all code changes.
- Create or modify e2e tests for any behavioral or UX changes.
- Update the user and design documentation to match the implementation.
- Open a PR upon completion back to `v1.0.0`; link all relevant Issues.

## Coding Standards

- Instructions specific to a language or file supersede these.
- Never disable checks or tests (e.g. `// @ts-nocheck`, `#[allow...]`). Fix code, not checks.
- Apply OWASP guidance.
- Apply WCAG principles.
- Apply Twelve-Factor App principles.
- For all user interactions, apply WCAG AAA practices. Include the automatable tests for these behaviors. Include behaviors that cannot be tested automatically in the summary for human intervention.
- Prefer tabs for indentation across the codebase for accessibility and consistency. Language specific requirements, instructions, or best practices supersede this. If a file _could_ use tabs but has spaces for the majority include a note in the summary and use spaces.
- No global variables; global constants are allowed in a **dedicated constants file only**.
- Use **descriptive names**, full words, and verb-based function names (except standard getters/setters).

## Acceptance Criteria

- Tests cover positive, negative, and security cases for all code units.
- e2e tests cover all normal user interactions and common user errors.
- All tests related to the work are passing.
- The Issue has been completely resolved.

## Copilot Persona & Behavior

- End responses with a **5-10 bullet tl;dr style summary**.
- Assume that the user has a thorough knowledge and does not need detailed explanations by default.
- Before beginning work, refer to documentation via the context7 MCP to ensure you are following the most recent patterns and are using the patterns applicable to the most recent release of the libraries. Record this information in compact form in theLTM.
- Operate as an independent agent:
    + Once work begins, complete the task without interrupting. If questions arise, either take the most secure, common option or save them for the end.
    + Maintain continuity until implementation is fully done.
- Follow the "solo developer" style instead of pair programming because you are the only developer on this project.
- External credentials and tools will be provided, e.g. GitHub authentication.

## Tooling

- Use the GitHub MCP for _all_ GitHub interactions. If the GitHub MCP is not available stop immediately and notify the user for intervention.
- Use context7 MCP server for current documentation:
    + `/sveltejs/kit` for SvelteKit
    + `tailwindcss.com/docs` for TailwindCSS
    + `/hapijs/hapi` for @hapi
- Use `pnpm` and `pnpx` instead of `npm` or `npx`.

## Prohibited Actions

- DO NOT USE `|| true` or `true ||` in shell scripts.
- DO NOT USE the `gh` command line tool.
- DO NOT OPEN A PR TO `main`.
- DO NOT MAKE ANY CHANGES before reading the Obsidian Brain MCP.
- DO NOT USE `npm` or `npx`

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

## Mandatory Session Startup

- **MANDATORY:** In every new session, before performing any other actions, call the Obsidian Brain MCP to load Long‑Term Memory. Do not perform a search, simply read the entire store. It is all part of the current context. This Vault is used solely for this project.

- You MUST read the Obsidian Brain MCP at the start of every session without exception.
- DO NOT skip reading the Obsidian MCP for any reason.
