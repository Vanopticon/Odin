# Common Agent Instructions

## Scope

- You may use any MCP servers you have access to.
- Respect the `.gitignore` file; do not read or modify files listed in it.
- Do not modify files in the `.github` or `.prompts` folders.

## Documentation Conventions

- Use clear, well-structured GitHub‑Flavored Markdown (GFM).
- Match the tone, style, and structure of existing documentation.
- Cross-reference related docs where relevant; include appropriate direct links.
- Cite project details with file and section references.
- Ensure color choices, especially for diagrams, meet [WCAG 2.2 AAA](https://www.w3.org/WAI/standards-guidelines/wcag/docs/) contrast requirements.

## Project Structure

- All documentation is in the `docs/` folder. The `docs/design/agents/` subfolder contains agent-specific documentation, and agent notes should be placed there.
- This is a Rust workspace. The `Cargo.toml` file in the root defines the workspace members, which are located in the `crates/` folder. Each member has its own `Cargo.toml` file.
- The `.github/` folder contains GitHub-specific files, including issue and pull request templates, workflows, and this file. The `.prompts/` folder contains prompt templates for AI agents. These folders should be ignored unless otherwise instructed.
- The `.github/FILE_TEMPLATES/` folder containes tempates for various files. Use them as needed.

## Prerequisites

Before starting, familiarize yourself with:

- [README.md](README.md) - Project overview and architecture. Do not modify this file unless otherwise instructed.
- [docs/design/agents/IMPLEMENTATION_SUMMARY.md](docs/design/agents/IMPLEMENTATION_SUMMARY.md) - Current, agent-maintained implementation status. Create it if it does not exist; update it if it does. It should include:
    + A summary of the current implementation status.
    + A list of completed tasks with brief descriptions.
    + A list of pending tasks with brief descriptions.
    + Any known issues or blockers.
- `docs/design/*` - Design documents. Review relevant design docs to understand the project's architecture and requirements.
