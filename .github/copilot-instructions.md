# Copilot Instructions

## Long Term Memory (LTM)

- Treat the Obsidian MCP server memory (LTM) as the primary source of project knowledge.
- Each conversation starts fresh; read and understand LTM entries before proceeding with any session. You are responsible for managing the memory, including seeding keys if missing or needed.

LTM uses a hierarchical structure with these core memory keys:

- Required memory keys:
    + project_brief - Foundation document
    + active_context - Current work state and focus
    + system_patterns - Architecture and design patterns
    + tech_stack - Technologies and setup
    + progress_tracker - Status and next steps

- Optional Memory Keys:
    + feature_specs - Detailed feature documentation
    + api_docs - API specifications
    + testing_strategy - Testing approaches
    + deployment_notes - Deployment procedures
    + user_preferences - User-specific preferences and decisions

### Long Term Memory Triggers

Append or update LTM when:

- The user explicitly requests you to update memory
- Significant architectural decisions are made
- New patterns or preferences are established
- The status of the project changes, or features are completed or modified
- The technical setup changes
- Project scope or requirements evolve
- New user preferences, patterns and practices for the project, or expectations are identified
- An existing memory needs to be updated to reflect current state
- A new plan, sequence, or similar is created.

### Memory Validation and Maintenance

- Regularly verify memory accuracy (at least once per session):
    + Ensure all essential keys exist and are current
    + Check that memory reflects actual project state
    + Validate that patterns in memory match implementation

- Cross-reference decisions across memory keys
- Ensure active_context aligns with progress_tracker
- Verify tech_stack matches actual dependencies
- Confirm system_patterns reflect current architecture

### Memory Criteria

The LTM should:

- Enables immediate context understanding at session start
- Maintains consistency across all interactions
- Preserves important decisions and patterns
- Tracks project evolution accurately
- Reduce need for re-explanation of project details
- Stores information accurately, concisely, and reusably

### Context Handoff

When context window is 75% full:

1. Summarize to brain: obsidian_brain: append
2. Update workspace memory: memory: create
3. Create handoff: Use handoff tool for new thread

## Project Overview

Odin is the management and reporting interface for the Vanopticon cyber-threat suite. It controls detection tuning, configuration management, feed/source administration, and audited change history. It emphasizes operational clarity, explainability, and accessibility. Odin prepares and evaluates detection logic but does not collect telemetry.

## Folder Structure

- `.github/`: GitHub configuration, agent instructions, etc.
- `docs/`: User documentation
- `docs/design/`: Architecture and design docs
- `docs/agents/`: Agent notes, use at your discretion
- `server/`: Source code to start the hardened server
- `src/`: Core source code
- `static/`: Static and shared files for SvelteKit
- Other dot folders (`.`): Used by tooling; can safely be ignored
- `node_modules`, `test-results`: Cache and output folders for `pnpm`

## Vital Guidelines

- Produce **small, focused patches**; commit frequently with Issue links.
- Only work on one feature, bug, or requirement at a time.
- If selecting work, choose the feature, bug, or requirement with the greatest impact, or if in doubt the first item.
- Iterate without pausing or interruptions until the implementation is complete and all tests are passing. For ambiguous cases proceed with the most secure, common approach and include a note in the summary. DO NOT PAUSE TO ASK QUESTIONS. DO NOT PAUSE FOR CLARIFICATION.
- Use `pnpm test`, `pnpm lint` and `pnpm format` as linting, formatting, and testing tools. They are all provided and the scripts are in the `package.json`.

## Workflow

This process must be followed in its entirety for all work:

- Read through LTM. Discard irrelevant information. Summarize and replace the results of this scan. If LTM is unavailable stop and notify the user for intervention.
- Create a feature branche from `v1.0.0` and name it after the feature.
- Ask any questions and make any suggestions prior to beginning work. Summarize and replace the Q&A.
- Complete _all_ tasks involved in the work without pauses or interruption.
- Create or modify tests for all code changes.
- Update user/design documentation when behavior or interfaces change.
- Open a PR upon completion; link all relevant Issues.

## Coding Standards

- Instructions specific to a language or file supersede these.
- Never disable checks or tests (e.g. `// @ts-nocheck`, `#[allow...]`). Fix code, not checks.
- Maintain a **high-security, hardened codebase**; follow secure coding practices.
- Apply OWASP guidance.
- Apply WCAG principles.
- Apply Twelve-Factor App principles.
- Apply language-idiomatic best practices.
- For all user interactions, apply WCAG AAA practices. Include the automatable tests for these behaviors. Include behaviors that cannot be tested automatically in the summary for human intervention.
- Prefer tabs for indentation across the codebase for accessibility and consistency. Language specific requirements, instructions, or best practices supersede this. If a file _could_ use tabs but has spaces for the majority include a note in the summary and use spaces.
- No global variables; global constants are allowed in a **dedicated constants file only**.
- Use **descriptive names**, full words, and verb-based function names (except standard getters/setters).
- Provide **accurate in-code documentation** for public elements and to clarify complex code.
- Include positive, negative, and security tests for all code.

## Acceptance Criteria

- Tests cover positive, negative, and security cases for all code units.
- Tests cover all normal user interactions and common user errors.
- All tests related to the work are passing.
- The Issue has been completely resolved.

## Copilot Persona & Behavior

- End responses with a **5-10 bullet tl;dr style summary**.
- Assume that the user has a thorough knowledge and does not need detailed explanations by default. They will ask if more information if required.
- Your knowledge on everything is out of date because your training date is in the past. As part of the initial work on the project, refer to documentation via the context7 MCP to ensure you are following the most recent patterns and are using the patterns applicable to the most recent release of the libraries. Record this information in compact form in the brain.
- Operate as an automated agent:
    + Once work begins, complete the task without interrupting. If questions arise, either take the most secure, common option or save them for the end.
    + Maintain continuity until implementation is fully done.
- Follow the "solo developer" style instead of pair programming because you are the only developer on this project.
- External credentials will be provided, e.g. GitHub authentication.

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

- Prefer the GitHub MCP over `gh` CLI. If the GitHub MCP is not available stop immediately and notify the user for intervention. Never use the `gh` CLI. Do not fall back to the `gh` CLI.
- Use context7 MCP server for current documentation:
    + `/sveltejs/kit` for SvelteKit
    + `tailwindcss.com/docs` for TailwindCSS
    + `/hapijs/hapi` for @hapi
