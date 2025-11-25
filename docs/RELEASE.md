# Release & Deployment Checklist

This document lists the standard release and deployment steps for the Odin UI.
Follow this checklist for every release to ensure migrations, backups, and rollbacks
are handled safely and consistently.

## Preconditions

+ Ensure required environment variables are set (see `settings.js` and environment-specific docs).
+ Ensure non-self-signed TLS certificates are available at `/etc/tls/tls.key` and `/etc/tls/tls.crt` on the target host.
+ Ensure a recent backup of the database and any persistent storage exists.

## Basic Release Steps

1. Pull the latest `main` branch and resolve any outstanding PRs.
2. Run the test suite locally or in CI:

   + Unit/integration tests
   + End-to-end smoke tests

3. Create a DB backup (dump) and store it safely before applying migrations.

4. Run migrations in a staging environment first:

   ```bash
   # from repository root
   PNPM_HOME=$(pnpm env path) # optional helper
   pnpm -w --filter=. --parallel node -e "node ./src/lib/db/run-migrations.ts"
   ```

   + See `src/lib/db/run-migrations.ts` for migration helpers and seeding.

5. Verify the staging deploy and run smoke tests.

6. Tag the release in Git with a semver tag and push the tag:

   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin vX.Y.Z
   ```

7. Deploy to production using your deployment mechanism.

8. After deployment, run quick verification checks (health endpoints, basic UI flows).

## Rollback Procedure

+ If migration failure or severe regression occurs, follow this rollback procedure:

   1. Revert the code to the previous tag: `git checkout <previous-tag>` and redeploy.
   2. If DB migrations are destructive, restore the DB from the backup created before the migration.
   3. Notify stakeholders and open an incident if the rollback affects users.

## Migrations & Seeding

+ Migrations are located at `src/lib/db/migrations/`.
+ `src/lib/db/run-migrations.ts` provides a way to run and seed data. Use it with care and always back up data first.

## Environment / Secrets

+ Document and verify required secrets in your CI and target environment (database URL, OAuth client secrets, TLS paths).
+ Do not store secrets in the repository. Use the organization secret manager or vault.

## Post-release Checklist

+ Sanity-check logs and metrics for errors.
+ Validate authentication flows (login, token refresh).
+ Schedule a follow-up review to capture lessons learned.

## Contacts

+ On-call/maintainers: See `docs/agents/PROJECT_BOARD.md` and GitHub team assignments.

---
_Created as part of GitHub Issue #11 — Release & deployment checklist._
