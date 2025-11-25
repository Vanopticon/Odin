# Application Requirements

Create a set of formal requirement documents in the `docs/design/` folder based on the [README.md](README.md), open GitHub Issues, and existing implemented code, as well as the additional requirments below.

Use the MCP tools available to ensure you are following the current best practices for each tool.

Update your notes to take all of this into account. You may add this to your instructions file if needed.

## Working Environment

- Create branches from `v1.0.0`
- Make small changes and commit often.
- Don't forget to update the designs and documentation as you go.

## Requirements

- Authentication and Authorization are done using OAuth 2.0/OIDC PKCE.
- Unauthenticated users are immediately redirected to login. There is no _anonymous_ access allowed to any part of the application.
- Each component checks authentication to prevent leaks.
- The group names are `odin_admins` and `odin_users` (admin and general user, respectively).
- The application cannot crash under any circumstance. It may return an error page, sanitized, and the usual HTTP response codes.
- If in doubt, take the more secure option. Security trumps all in this app.
- Cookie secrets and similar must be generated and rotated regularly. The default rotation period should be hourly. The rotation period should be configurable.
- All logging must go to `stdout` and `stderr` without color in a standard log format. It will be captured from there by environmental tools, such as Splunk.
- Logging should default to INFO and respect the LOG_LEVEL environment variable, if present.

## Setup and Permissions

- The application will be running under an ID without full premissions to the database during normal operation.
- The first run after installation or upgrade will be under an ID with elevated permissions to the database to allow setup and migration.
- At startup check for the permissions necessary if the database structures don't exist or a migration is necessary. Return an informative error and do not start if the permissions are not present.

## Configuration Environment Variables Provided

- The TLS certificates will be injected as files and can be read from there.
- NODE_ENV - Whether the app is running in 'development' or 'production'; default to 'production'
- OD_TLS_KEY - Path to the TLS Key file; default to `/etc/tls/tls.key`
- OD_TLS_CERT - Path to the TLS Public Certificate file `/etc/tls/tls.crt`
- OD_RATE_LIMIT_MAX - Rate limit; default to 600
- OD_PORT - Port on which to listen; default to 443 (HTTPS)
- OD_HOST - Host name on which to respond; default to the environment host name
- OD_BIND_ADDRESS - Optional comma separated address(es) on which to listen; default to :: and 0.0.0.0
- OD_DB_URL - URL to the database
- OD_PKCE_ID - The OAuth ID for user authentication (Auth Flow, PKCE)
- OD_PKCE_SECRET - The OAuth Secret for user authentication (Auth Flow)
- OD_OAUTH_URL - The .well-known URL for the OAuth provider

## Expected Outcome

A set of formal requirement documents will exist in the `docs/design/` folder and a matching set of GitHub Issues will be created covering everything required to implement the application. Each requirement should reference the associated GitHub Issue and link to it.

The documents should include:

# 1. System Architecture Overview (SAO)

**Purpose**
Define boundaries, trust zones, major components, and system-level rationale.

**Contents**

- Scope and assumptions
- Context diagram
- Trust boundaries and security zones
- Logical architecture (components, data stores, services)
- Physical architecture (nodes, networks, isolation, deployment topology)
- Critical design rationale (security, performance, resilience)

**References**
ISO/IEC/IEEE 42010 (Architecture Description).

# 2. Threat Model & Security Architecture (TMSA)

**Purpose**
Identify adversaries, attack surfaces, and required controls; drive mandatory security behavior.

**Contents**

- Assets and entry points
- DFDs aligned with SAO
- Threat enumeration (STRIDE/LINDDUN)
- Required mitigations (authN/authZ, crypto, isolation, validation, auditing)
- Residual risk and assumptions
- Mapping of controls to components

**References**
Microsoft SDL Threat Modeling; NIST SP 800-154.

---

# 3. Interface Control Document (ICD)

**Purpose**
Formalize all inter-component contracts with no implementation leakage.

**Contents**

- API definitions (OpenAPI/AsyncAPI)
- Message formats, schemas, and serialization rules
- Protocol sequencing and timing
- Error semantics and recovery behavior
- Versioning and backward-compatibility constraints

**References**
OpenAPI Specification; MIL-STD-962 ICD structure.

---

# 4. Data Architecture Specification (DAS)

**Purpose**
Define the system’s data space, invariants, and protections.

**Contents**

- Logical/physical data model
- Database schemas and constraints
- Classification and retention policy
- Integrity/consistency invariants
- Cryptographic requirements (encryption, hashing, MACs)
- Data lineage and allowed transformations

**References**
ISO/IEC 11179; Data modeling standards.

---

# 5. Component Design Specifications (CDS)

**Purpose**
Capture internal logic of security-relevant or complex components.

**Contents**

- Responsibilities, inputs, outputs
- Algorithms and invariants
- Internal data structures
- Failure modes
- Concurrency rules
- Dependencies and limits (timeouts, retries, rate caps)

**References**
IEEE 1016 (Software Design Descriptions).

---

# 6. Behavior & State Specifications (BSS)

**Purpose**
Guarantee deterministic, verifiable behavior for workflows and protocols.

**Contents**

- State machines
- Event/transition tables
- Preconditions and postconditions
- Invariants and forbidden transitions
- Timeouts, retries, and error paths
- Optional formal spec (TLA+, Alloy, Promela)

**References**
UML State Machines; TLA+ spec patterns.

---

# 7. Configuration & Deployment Specification (CDS-Ops)

**Purpose**
Define the runtime environment with no ambiguity to prevent configuration drift.

**Contents**

- Required configuration parameters
- Secrets handling and key management
- Deployment topology (tied to SAO physical model)
- Resource limits and QoS constraints
- Networking zones and firewall rules
- Allowed configuration variance (min/max)

**References**
NIST SP 800-128 (Configuration Management).

---

# 8. Verification & Validation Plan (VVP)

**Purpose**
Define and guarantee the assurance evidence for correctness and security.

**Contents**

- Requirements → test case traceability
- Test strategy (unit, integration, fuzzing, property-based, security)
- Coverage requirements
- Performance and load validation
- Verification of mitigations from TMSA
- Required tooling and artifacts

**References**
IEEE 29119; NIST SP 800-53 assurance mappings.

---

# 9. Operational Security & Runbook Specification (OSR)

**Purpose**
Ensure secure, stable operation and predictable incident response.

**Contents**

- Monitoring and alerting requirements
- Audit/logging scheme
- Deployment/rollback procedures
- Incident response playbooks
- SLOs/SLIs
- Operational dependencies
- Security hardening steps

**References**
NIST SP 800-137 (ISCM); SRE runbook conventions.

---

# 10. Compliance & Governance Map (CGM)

**Purpose**
Provide a minimal but complete mapping to external standards without polluting the technical documents.

**Contents**

- Control mapping (NIST 800-53, PCI-DSS, FedRAMP, ISO 27001)
- Evidence sources (SAO, TMSA, ICD, DAS, CDS, BSS, VVP, OSR)
- Change control workflow
- Audit artifact list

**References**
NIST SP 800-37 (RMF).
