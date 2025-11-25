# Threat Model & Security Architecture (TMSA)

**Purpose:**
Identify adversaries, attack surfaces, and required controls; drive mandatory security behavior.

**References:** Microsoft SDL Threat Modeling; NIST SP 800-154

---

## Assets and Entry Points

- User credentials, session tokens, configuration secrets
- Entry: UI, API endpoints, OAuth callback

## DFDs Aligned with SAO

- Data flows: Auth, DB, logging

## Threat Enumeration (STRIDE/LINDDUN)

- Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege

## Required Mitigations

- AuthN/AuthZ: OAuth 2.0/OIDC PKCE, group checks
- Crypto: TLS, secret rotation
- Isolation: No anonymous access, container isolation
- Validation: Input sanitization, error handling
- Auditing: Logging to stdout/stderr

## Residual Risk and Assumptions

- Assumes OAuth provider is secure
- Assumes DB is hardened

## Mapping of Controls to Components

- Auth: All entry points
- Crypto: All data in transit
- Audit: All actions

---

**GitHub Issue:** [#TMSA](link-to-issue)
