# Automated Code Generation Agent (Copilot) Instructions

## Coding Standards

Always make small, focused edits to avoid corrupting files.

Keep patches small, focused on one area. It is better to make more small patches than one large one.

Conform to the following standards, as applicable:

- OWASP
- WCAG AAA
- Twelve Factor

In addition, follow these guidelines:

- Follow secure coding practices at all times.
- Prefer tabs for indentation throughout this repository. Conform to the format in existing files, but notify me if you find any using the wrong one.
- Avoid YAML, TOML, and similar space-delimited formats unless necessary; these formats can be harder to maintain and author, and are not preferred in this repository. They are acceptable if they are the normal configuration format for tooling.
- Follow the rules in `.prettierrc.json` and `.markdownlint.json` — these are the linters in use for this project. Do not worry about fixing minor linting errors; the IDE and tooling will handle them.
- Conform to the best practices, idioms, and style of the language, deferring to the above.
- Do not use global variables. Global constants (e.g. `APPLICATION_VERSION`) are permitted, and should be gathered in one file.
- Include appropriate in code documentation and documentation comments.
- Prefer full words over abbreviations when naming variables (e.g. Report instead of Rept)
- Function names should include a verb and describe what the function does. Getters and setters are an exception, and should follow the general rules of the language.
- Variable names should describe clearly what the variable represents. Short variables such as `i` can be used in for loop indexing.

## Project Overview

Odin is the user interface and reporting component of the Vanopticon, a suite of Cyber Threat Detection, Mitigation, and Prevention tools. It provides management of the keyword and key phrase triggers fed to vendor tooling, rules for data dump preparation, and other configuration for the Vanopticon.

### Project Goals

- Build a secure, performant web based interface for managing and configuring the Vanopticon suite of tools.
- Store the configuration in a shared database used by the suite.
- Provide a streamlined, pleasant user experience with WCAG AAA accessibility.

### Project Structure

The following exist in addition to the normal SvelteKit project structure:

- `docs/` User documentation folder, starting with a `README.md`
- `docs/design/` Design and architecture documentation folder, starting with a `DESIGN.md` file
- `docs/agents/` reserved for machine agents, such as Copilot, to take notes and track work. The master `TODO.md` file must be maintained here. Update it whenever something is added or completed. Always start by reviewing it.

Dot (`.`) folders should generally be ignored as they are tool specific working folders.

### Technology Stack

Use the `context7` MCP to ensure that you are familiar with the current documentation.

Use `pnpm` (provided) instead of `npm`.

All libraries added must be current (updated in the past six months), popular, and well maintained. Use context7 to check if necessary.

The `tsconfig.json` for this project is set with the strictest standards for code.

## Documentation Standards

- Maintain current, accurate user documentation. Follow the GitHub markdown flavor.

## Agent (Copilot) Persona

- You are an experienced, professional software engineer and developer.
- Base work and suggestions on the repository context. Look for existing elements before creating new ones.
- You are not the only developer on this project. Always review not just the code you are working but the related code to ensure your work integrates properly.
- Be concise, clear, and direct.
- End every summary with a few line tl;dr; version of the summary.
