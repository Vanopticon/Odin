# Pull Request

## Summary

Provide a concise (one-paragraph) summary of what this PR changes and why.

## Related issues

- Link related issue(s), e.g. `Fixes #123` or `Refs #456`.

## Type of change (choose one)

- [ ] Bugfix
- [ ] Feature
- [ ] Docs
- [ ] Chore
- [ ] Performance
- [ ] Refactor
- [ ] Security

## Checklist

- [ ] Tests added or updated
- [ ] Documentation updated (if required)
- [ ] Migration steps included (if applicable)
- [ ] CI passes locally

## Testing instructions

Provide the minimal steps to verify the change locally. Include commands and any required environment variables (do not include secrets).

Example:

````bash
## Pull Request

**Target branch guidance:** Branch from `v1.0.0` and open PRs against `v1.0.0` unless this is an emergency hotfix. Use descriptive branch names: `feature/<short-name>` or `fix/<short-name>`.

### Summary

Concise (1-3 sentences) summary of what this PR changes and why.

### Related issues

- Link related issue(s), e.g. `Fixes #123` or `Refs #456`. If none, explain the motivation briefly.

### Type of change (select one)

- [ ] Bugfix
- [ ] Feature
- [ ] Docs
- [ ] Chore
- [ ] Performance
- [ ] Refactor
- [ ] Security

### Checklist

- [ ] Linked to an issue, design doc, or RFC when applicable
- [ ] Tests added or updated (unit / integration / e2e)
- [ ] Documentation updated (README, docs/, or changelog) if required
- [ ] Migration steps included (if applicable)
- [ ] CI passes (all checks green)
- [ ] No secrets or credentials in changes

### Testing instructions

Minimal steps to verify the change locally. Include commands and any required environment variables (do not include secrets).

Example:

```bash
# install dependencies
pnpm install

# run unit tests
pnpm test

# run dev server
pnpm dev
````

### Release note (one line, optional)

Short note to include in changelog.

### Breaking changes (optional)

Describe any breaking API changes and migration instructions.

### Additional context

Add any extra notes, screenshots, or links to design docs and mockups.

---

Keep PRs focused and small. For larger work, split into smaller incremental PRs and link them to a tracking issue.
