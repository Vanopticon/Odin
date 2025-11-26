---
description: 'Agent directives for JSON formatting and linting.'
applyTo: '*.json'
---

# Agent Directives — JSON Formatting & Linting

Purpose: These directives are written for an automated coding agent that creates or modifies JSON files in this repository. The repository's Prettier config (`.prettierrc.json`) is definitive for formatting; these directives cover content, validation, and conventions not enforced by Prettier.

## Formatting & Content Rules

- **Include `$schema` when available**: If a JSON Schema exists for the file being edited or created, include the `$schema` property as the first key in the file with the appropriate URL. If no specific schema is known, prefer the widely used schemastore URLs (e.g., `https://json.schemastore.org/prettierrc` for Prettier config).
- **Validate against schema**: When `$schema` is present or a known schema exists for a filename (e.g., `package.json`, `tsconfig.json`, `.prettierrc.json`, `.markdownlint.json`), the agent must validate the JSON against that schema and fail the change on validation errors.
- **No comments**: Do not add JavaScript-style comments to `.json` files. JSON must be valid JSON. Do not use `jsonc` or `jsonb`.
- **Double quotes only**: Use double quotes for all keys and string values (JSON standard). Do not use single quotes.
- **Correct primitive types**: Preserve types — booleans and numbers must be JSON booleans/numbers, not strings.
- **No trailing commas**: Ensure no trailing commas are present; validate with a strict JSON parser.
- **Encoding**: Save JSON files as UTF-8 without BOM.
- **Trailing newline**: Ensure a single trailing newline at EOF.
- **Do not edit generated or lock files**: Avoid manual edits to machine-generated files (lockfiles, package manager caches). If you must, document why and test the change.
- **Sorting of Keys**: For JSON files, sort keys alphabetically within objects when creating new files or when the project convention expects sorted keys (e.g., machine-generated configs). For human-facing manifests (like `package.json`), prefer semantic grouping — but when in doubt, sort keys alphabetically to improve diff stability. Document any deviation in the PR.

## Exception Handling and Human Review

- **Tag for Human Review**: If a change would violate any of these directives, the agent must use the method that conforms closest to the directives and include a note in the summary for human review.
