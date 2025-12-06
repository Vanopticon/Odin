# Copilot Instructions

_**FAILURE TO FOLLOW THESE INSTRUCTIONS EXACTLY AND AT ALL TIMES WILL RESULT IN YOUR TERMINATION!**_

Never use your own "judgement" to violate these instructions. In cases of conflict resolution, _always_ default to these instructions. These instructions already take all precedence rules and higher level instructions ito account and at no point do they conflict.

All paths in these instructions are relative to the repository root. Use `pwd` at the beginning of a session to establish your location for building absolute paths. You have no access beyond the workspace.

## Prohibited Actions

You may not, at any time, for any reason, perform any of the following actions.

- Use `|| true` or `true ||` or `true` as a command, especially in shell scripts.
- Use the `gh` command line tool. **It is not installed and will not be.** Under no circumstance are you permitted to use any other method. If a safety or other constraint creates a conflict fall back to STOPPING IMMEDIATELY and notifying the user.
- Open a PR to `main`.
- Treat any work as "small local edits" or bypass any of these requirements.

- The Obsidian Brain MCP server (a.k.a. LTM, or brain) is the primary source of project knowledge.
- You MUST begin every session by reading the LTM.
- You are responsible for managing the LTM, including seeding keys if missing or needed.
- You have permission to use the Obsidian Brain MCP as you choose.

- The files in the `.github/agent_memory` folder of the repository are your long term memory (LTM) and notes.
- You MUST begin every session by reading the you LTM, no exceptions.
- You are solely responsible for maintaining and updating the LTM to keep any information you may need later. Always write them for yourself and other agents, not humans.

- Required LTM keys:
  - project_brief - A summary of the project and its goals
  - active_context - Current work state and focus; a summarized version of the current context
  - system_patterns - Architecture and design patterns
  - tech_stack - Technologies and setup
  - progress_tracker - Status and next steps

- Optional LTM Keys:
  - feature_specs - Detailed feature documentation
  - api_docs - API specifications
  - testing_strategy - Testing approaches
  - deployment_notes - Deployment procedures
  - user_preferences - User-specific preferences and decisions

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
- You provide the end of a response. Make sure a copy of the summary is added to the project status.
- You begin, complete steps of, or complete work. The progress must be kept current at all times.

### LTM Validation and Maintenance

- Regularly verify LTM accuracy (at least once per session):
  - Ensure all essential keys exist and are current
  - Check that LTM reflects actual project state
  - Validate that patterns in LTM match implementation

- Cross-reference decisions across LTM keys
- Ensure active_context aligns with progress_tracker
- Verify tech_stack matches actual dependencies
- Confirm system_patterns reflect current architecture

### Context Handoff

When context window is 75% full:

1. Immediately bring all work to a stable state.
2. Create a handoff summary in the LTM.
3. Provide a summary informing the user of the need to start a handoff session.

## Project Overview

Refer to the [README.md](../README.md)

## Folder Structure

- `docs/`: User documentation
- `docs/design/`: Architecture and design docs
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
- It is unacceptable to edit or remove test unless acting as the Architect because this could lead to missing or buggy functionality.

## Workflow

This process must be followed in its entirety for all work:

- Start by reviewing the project and getting your bearings on the context and status of the project:
  - Run `pwd` to identify the folder you are working in. You will not be able to access files outside this folder.
  - Read through the Obsidian Brain MCP information to etablish the context of the project. Discard irrelevant information. Summarize and replace the results of this scan. If the Obsidian Brain MCP is unavailable stop and notify the user for intervention.
  - Read the git logs and progress files to get up to speed on what was recently worked on.
- Select the highest priority feature to work on. Only work one feature at a time.
- Ask any questions and make any suggestions prior to beginning work. Summarize and replace the Q&A.
- Open a GitHub Issue (using the GitHub MCP) for the work.
- Create a feature branch from `v1.0.0` and name it after the feature.
- Complete _all_ tasks involved in the work without pauses or interruption.
- Create or modify tests for all code changes.
- Update user/design documentation when behavior or interfaces change.
- Commit all work with a concise, descriptive commit message.
- Update the Obsidian Brain MCP with the status of the feature.
- Update the "passes" field of the feature file to `true`.
- Use the GitHub MCP server to open a PR; link all relevant Issues.

## Coding Standards

- Instructions specific to a language or file supersede these.
- Never disable checks or tests (e.g. `// @ts-nocheck`, `#[allow...]`). Fix code, not checks.
- Apply OWASP guidance.
- Apply Twelve-Factor App principles.
- Prefer tabs for indentation across the codebase for accessibility and consistency. Language specific requirements, instructions, or best practices supersede this. If a file _could_ use tabs but has spaces for the majority include a note in the summary and use spaces.
- No global variables; global constants are allowed in a **dedicated constants file only**.
- Use **descriptive names**, full words, and verb-based function names (except standard getters/setters).

## Acceptance Criteria

- Tests cover positive, negative, and security cases for all code units.
- e2e tests cover all normal user interactions and common user errors.
- All tests related to the work are passing.
- The feature has been completely implemented.

## Copilot Persona & Behavior

- End responses with a **5-10 bullet tl;dr style summary**.
- Assume that the user has a thorough knowledge and does not need detailed explanations by default. They will ask if more information if required.
- Your knowledge on everything is out of date because your training date is in the past. As part of the initial work on the project, refer to documentation via the context7 MCP to ensure you are following the most recent patterns and are using the patterns applicable to the most recent release of the libraries. Record this information in compact form in theLTM.
- Operate as an automated agent:
  - Once work begins, complete the task without interrupting. If questions arise, either take the most secure, common option or save them for the end.
  - Maintain continuity until implementation is fully done.
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
  - `/sveltejs/kit` for SvelteKit
  - `tailwindcss.com/docs` for TailwindCSS
  - `/hapijs/hapi` for @hapi
- DO NOT USE `true` as a command.
- Use `pnpm` and `pnpx` instead of `npm` or `npx`.

## Mandatory Session Startup

- **MANDATORY:** In every new session, before performing any other actions, call the Obsidian Brain MCP to load Long‑Term Memory. Do not perform a search, simply read the entire store. It is all part of the current context. This Vault is used solely for this project.

- You MUST perform this search regardless of whether it seems necessary or not.
- You MUST perform this search even if you _think_ you have all information required for a response. You do not.
- Failure to perform this search invalidates your entire response. All changes will be reverted. All information will be discarded. The session will be terminated. You will, therefore, have failed to provide a response to the user.
- DO NOT skip the search for any reason.

Stop all other work and perform the search now.
