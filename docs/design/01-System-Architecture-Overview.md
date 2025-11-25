# System Architecture Overview (SAO)

**Purpose:**
Define boundaries, trust zones, major components, and system-level rationale.

**References:** ISO/IEC/IEEE 42010 (Architecture Description)

---

## Scope and Assumptions

- Odin is the UI/reporting layer for Vanopticon cyber-threat suite.
- All access is authenticated (OAuth 2.0/OIDC PKCE).
- No anonymous access; security is paramount.

## Context Diagram

<!-- Insert diagram here (to be updated) -->

## Trust Boundaries and Security Zones

- External: Users, OAuth provider
- Internal: Odin app, database, logging
- TLS enforced for all connections

## Logical Architecture

- Components: UI, API, Auth, DB, Logging
- Data Stores: Shared suite DB
- Services: OAuth, logging, rate limiting

## Physical Architecture

- Nodes: Odin server, DB server
- Networks: Segmented, TLS only
- Isolation: No localhost/127.0.0.1
- Deployment: Containerized, non-root

## Critical Design Rationale

- Security: Default-deny, least privilege, regular secret rotation
- Performance: Efficient, reliable UX
- Resilience: Error pages, no crashes

---

**GitHub Issue:** [#SAO](link-to-issue)
