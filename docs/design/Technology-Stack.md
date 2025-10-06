# Vanopticon Technology Stack

## Overview

This document describes the technology choices for Vanopticon, including programming languages, frameworks, libraries, databases, and tools. Each choice is explained with rationale based on the project's requirements and goals.

## Core Programming Language

### Rust

**Version**: 1.75.0 minimum (update as needed)

**Rationale**:

- **Memory Safety**: Rust's ownership system eliminates entire classes of bugs (null pointer dereferences, data races, buffer overflows) without runtime overhead
- **Performance**: Zero-cost abstractions provide C/C++ level performance
- **Concurrency**: Fearless concurrency through type system guarantees
- **Ecosystem**: Rich ecosystem with high-quality crates for networking, serialization, async I/O
- **Tooling**: Excellent tooling (cargo, rustfmt, clippy, rust-analyzer)
- **Safety Requirements**: Meets requirement for 100% safe code (`unsafe_code = "forbid"`)

**Key Crates**:

```toml
[workspace.dependencies]
# Async runtime
tokio = { version = "1.41", features = ["full"] }

# Error handling
thiserror = "2.0"
anyhow = "1.0"

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Networking and APIs
axum = "0.8"  # REST API framework
tonic = "0.13"  # gRPC framework
tower = "0.5"  # Service middleware

# Configuration
config = { version = "0.15", features = ["yaml", "toml", "json"] }

# Logging and tracing
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["json", "env-filter"] }
opentelemetry = "0.27"

# Database
sqlx = { version = "0.8", features = ["runtime-tokio", "postgres", "uuid", "chrono"] }

# Security
rustls = "0.23"  # TLS implementation
argon2 = "0.5"  # Password hashing

# Time handling
chrono = { version = "0.4", features = ["serde"] }

# UUID generation
uuid = { version = "1.11", features = ["v4", "serde"] }

# Async utilities
futures = "0.3"
async-trait = "0.1"

# Testing
proptest = "1.6"  # Property-based testing
criterion = "0.6"  # Benchmarking
```

## Data Serialization

### Protocol Buffers

**Version**: protobuf 3

**Rationale**:

- **Efficiency**: Compact binary format reduces bandwidth and storage
- **Performance**: Fast serialization/deserialization
- **Schema Evolution**: Backward and forward compatibility
- **Language Support**: Wide language support for client libraries
- **Type Safety**: Strongly typed schemas

**Tools**:

- `protoc`: Protocol buffer compiler
- `tonic-build`: Rust code generation for gRPC services
- `prost`: Protocol buffer implementation for Rust

**Example**:

```protobuf
syntax = "proto3";

package vanopticon.v1;

message Event {
  string id = 1;
  int64 timestamp = 2;
  string source_host = 3;
  EventType event_type = 4;
  Severity severity = 5;
  string message = 6;
  map<string, string> fields = 7;
}
```

### JSON

**Usage**: Configuration files, human-readable APIs, debugging

**Rationale**:

- **Human Readable**: Easy to read and edit
- **Ubiquitous**: Supported everywhere
- **Debugging**: Useful for development and troubleshooting

**Library**: `serde_json`

### YAML

**Usage**: Configuration files, policy definitions

**Rationale**:

- **Human Friendly**: More readable than JSON for complex configs
- **Comments**: Supports comments for documentation
- **Multi-line Strings**: Better for long text values

**Library**: `serde_yaml`

## Communication Protocols

### gRPC

**Usage**: Inter-module communication, high-performance APIs

**Rationale**:

- **Performance**: Binary protocol with HTTP/2
- **Streaming**: Bi-directional streaming support
- **Type Safety**: Strongly typed via Protocol Buffers
- **Efficiency**: Multiplexing, flow control, header compression

**Library**: `tonic`

**Transport**: HTTP/2 over TLS 1.3

### REST APIs

**Usage**: Web dashboard, external integrations, human-friendly APIs

**Rationale**:

- **Simplicity**: Easy to understand and use
- **Ubiquity**: Widely supported
- **Debugging**: Can be tested with curl/browser
- **Flexibility**: Works well with JSON

**Framework**: `axum`

**Transport**: HTTP/2 over TLS 1.3

### WebSocket

**Usage**: Real-time dashboard updates, streaming data to UI

**Rationale**:

- **Real-time**: Low latency bidirectional communication
- **Efficiency**: Persistent connection reduces overhead
- **Browser Support**: Native browser support

**Library**: `axum` with WebSocket support

## Message Broker

### NATS

**Version**: 2.10+

**Rationale**:

- **Performance**: Very high throughput (millions of messages/sec)
- **Simplicity**: Easy to deploy and operate
- **Features**: Pub-sub, request-reply, queuing, JetStream for persistence
- **Security**: TLS, token authentication, NKEYS
- **Clustering**: Built-in clustering and high availability

**Alternative**: RabbitMQ (if advanced routing needed)

**Client Library**: `async-nats`

**Use Cases**:

- Event streaming from Sentinels to Analysis
- Alert distribution to Shield and Command
- Internal event bus in Command module

## Databases

### PostgreSQL

**Version**: 16+

**Usage**: Configuration, state, alerts, users, policies

**Rationale**:

- **Reliability**: Battle-tested, ACID compliant
- **Features**: JSON support, full-text search, indexes
- **Performance**: Good performance for transactional workloads
- **Extensions**: Rich ecosystem of extensions
- **Replication**: Built-in streaming replication

**Client Library**: `sqlx`

**Schema Management**: `sqlx` migrations

### TimescaleDB

**Version**: 2.16+

**Usage**: Time-series event data, metrics, telemetry

**Rationale**:

- **Time-Series Optimized**: Built on PostgreSQL with time-series features
- **Performance**: Automatic partitioning, compression
- **SQL Interface**: Use standard SQL queries
- **Continuous Aggregates**: Pre-computed rollups
- **Retention Policies**: Automatic data lifecycle management

**Integration**: Uses `sqlx` (PostgreSQL client)

### Alternative: ClickHouse

**Consideration**: For very high volume scenarios (>1M events/sec)

**Trade-offs**:

- **Pros**: Extremely fast for analytics queries, excellent compression
- **Cons**: Eventually consistent, different SQL dialect, less mature ecosystem

## Object Storage

### S3-Compatible Storage

**Usage**: Backup storage, large objects, archive data

**Options**:

1. **MinIO**: Self-hosted S3-compatible storage
2. **AWS S3**: Cloud-hosted option
3. **Local Filesystem**: For single-host deployments

**Rationale**:

- **Scalability**: Handle petabytes of data
- **Durability**: High durability guarantees
- **Cost**: Cost-effective for large data
- **Standards**: S3 API is industry standard

**Client Library**: `aws-sdk-s3` or `rusoto_s3`

## Web Frontend

### SvelteKit

**Version**: 2.x

**Rationale**:

- **Performance**: Compiles to efficient vanilla JavaScript
- **Developer Experience**: Less boilerplate, reactive by default
- **SSR Support**: Server-side rendering for better SEO and performance
- **Modern**: Uses latest web standards
- **Bundle Size**: Smaller bundles than React/Vue

**Additional Libraries**:

```json
{
  "dependencies": {
    "@sveltejs/kit": "^2.0.0",
    "svelte": "^5.0.0",
    "d3": "^7.9.0",
    "chart.js": "^4.4.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@sveltejs/adapter-node": "^5.0.0",
    "prettier": "^3.4.0",
    "prettier-plugin-svelte": "^3.2.0",
    "vite": "^6.0.0"
  }
}
```

### Visualization

**D3.js**: Complex, custom visualizations (network graphs, timelines)

**Chart.js**: Standard charts (line, bar, pie)

**Mermaid**: Diagrams and flowcharts (embedded in documentation)

### CSS Framework

**Tailwind CSS**: Utility-first CSS framework

**Rationale**:

- **Productivity**: Rapid UI development
- **Consistency**: Design system built-in
- **Performance**: Purges unused styles
- **Customization**: Highly customizable

## Security

### TLS Implementation

**Library**: `rustls`

**Rationale**:

- **Memory Safety**: Written in Rust, no C vulnerabilities
- **Modern**: Supports TLS 1.3
- **Performance**: Competitive with OpenSSL
- **Simplicity**: Cleaner API than OpenSSL bindings

**Configuration**:

- Minimum TLS version: 1.3
- Cipher suites: Modern, secure ciphers only
- Certificate validation: Strict

### Cryptography

**Library**: `ring`

**Rationale**:

- **Security**: Based on BoringSSL
- **Performance**: Highly optimized
- **Safety**: Memory-safe Rust bindings

**Use Cases**:

- Hashing (SHA-256, SHA-512)
- HMAC
- AES-GCM encryption
- Random number generation

### Password Hashing

**Library**: `argon2`

**Rationale**:

- **Security**: Winner of Password Hashing Competition
- **Resistance**: Memory-hard, resistant to GPU/ASIC attacks
- **Configurable**: Adjustable cost parameters

### JWT

**Library**: `jsonwebtoken`

**Usage**: API authentication tokens, session tokens

**Configuration**:

- Algorithm: RS256 (RSA signatures)
- Expiration: Short-lived tokens (1 hour)
- Refresh tokens: Longer-lived (24 hours)

## Observability

### Metrics

**Standard**: Prometheus exposition format

**Library**: `prometheus` or `metrics`

**Collection**: Prometheus server or OpenTelemetry Collector

**Visualization**: Grafana

**Key Metrics**:

- Request rate, error rate, duration (RED metrics)
- CPU, memory, disk, network usage
- Queue depths, buffer sizes
- Detection accuracy metrics

### Logging

**Library**: `tracing`

**Format**: Structured JSON logs

**Shipping**: Fluentd, Vector, or Logstash

**Storage**: Elasticsearch, Loki, or Object Storage

**Features**:

- Contextual logging (span/event model)
- Dynamic filtering
- Structured fields
- Performance tracing

### Distributed Tracing

**Standard**: OpenTelemetry

**Library**: `opentelemetry` + `tracing-opentelemetry`

**Backend**: Jaeger, Tempo, or Zipkin

**Rationale**:

- **Visibility**: Trace requests across services
- **Performance**: Identify bottlenecks
- **Debugging**: Understand request flow

## Development Tools

### Build System

**Tool**: `cargo`

**Extensions**:

- `cargo-make` or `just`: Task runner for complex workflows
- `cargo-nextest`: Faster test runner
- `cargo-watch`: Auto-rebuild on changes

### Code Quality

**Linting**: `clippy`

**Formatting**: `rustfmt`

**Security Auditing**: `cargo-audit`, `cargo-deny`

**Code Coverage**: `cargo-tarpaulin` or `cargo-llvm-cov`

**Static Analysis**: `cargo-semver-checks`

### Testing

**Unit Tests**: Built-in Rust testing

**Integration Tests**: Custom test harness

**Property Testing**: `proptest`

**Benchmarking**: `criterion`

**Fuzzing**: `cargo-fuzz`

**E2E Testing**: Custom test framework using `tokio`

### Documentation

**API Docs**: `rustdoc`

**User Docs**: `mdBook`

**Diagrams**: Mermaid (embedded in Markdown)

**API Specs**: OpenAPI/Swagger for REST, protobuf for gRPC

### Containerization

**Container Runtime**: Docker

**Base Images**:

- `rust:1.75-slim` for builds
- `debian:bookworm-slim` or `alpine:3.19` for runtime

**Multi-stage Builds**: Yes, to minimize image size

**Security**:

- Run as non-root user
- Minimal attack surface
- Regular base image updates

### CI/CD

**Platform**: GitHub Actions

**Workflows**:

1. **CI**: Lint, test, build on every PR
2. **Security**: Daily security scans
3. **Release**: Automated release on tag
4. **Deploy**: Automated deployment (staging/production)

**Tools**:

- `cargo` for build and test
- `docker` for containerization
- `hadolint` for Dockerfile linting
- `trivy` for container scanning

## Infrastructure as Code

### Terraform

**Version**: 1.9+

**Usage**: Cloud infrastructure provisioning

**Providers**:

- AWS
- Azure
- GCP
- Kubernetes

### Ansible

**Version**: 2.17+

**Usage**: Configuration management, application deployment

**Modules**: Systemd, Docker, file management

### Kubernetes

**Version**: 1.30+

**Usage**: Container orchestration

**Package Manager**: Helm

**Monitoring**: Prometheus Operator

## Deployment Targets

### Operating Systems

**Supported**:

- Linux: Ubuntu 22.04+, Debian 12+, RHEL 9+, Rocky Linux 9+
- Windows: Windows Server 2019+
- Container: Docker, Kubernetes

**Primary**: Linux (production)

**Secondary**: Windows (for Sentinel agents only)

### Architectures

**Supported**:

- x86_64 (amd64)
- aarch64 (arm64)

### Minimum Requirements

**Sentinel**:

- CPU: 1 core
- RAM: 512 MB
- Disk: 10 GB (for buffer)

**Analysis**:

- CPU: 4 cores
- RAM: 4 GB
- Disk: 50 GB (for local data)

**Shield**:

- CPU: 2 cores
- RAM: 2 GB
- Disk: 20 GB

**Command**:

- CPU: 2 cores
- RAM: 2 GB
- Disk: 20 GB

### Recommended Production

**Database Cluster**:

- 3 nodes
- 4 cores, 16 GB RAM each
- 500 GB SSD storage each

**Analysis Cluster**:

- 3+ nodes
- 8 cores, 16 GB RAM each
- 100 GB SSD storage each

**Load Balancer**:

- 2 nodes (HA)
- 2 cores, 4 GB RAM each

## Third-Party Services

### Optional Integrations

**Identity Providers**:

- OAuth 2.0 / OpenID Connect providers
- LDAP / Active Directory
- SAML 2.0 providers

**Threat Intelligence**:

- MISP (Malware Information Sharing Platform)
- AlienVault OTX
- Custom threat feeds

**Ticketing Systems**:

- Jira
- ServiceNow
- PagerDuty

**SIEM Integration**:

- Splunk
- Elastic Security
- IBM QRadar

**Notification Channels**:

- Email (SMTP)
- Slack
- Microsoft Teams
- Webhooks

## License Considerations

### Runtime Dependencies

All runtime dependencies must be compatible with MIT/Apache-2.0 dual licensing:

**Acceptable Licenses**:

- MIT
- Apache 2.0
- BSD (2-clause, 3-clause)
- ISC
- Unlicense

**Unacceptable Licenses**:

- GPL (any version) - viral copyleft
- AGPL - viral copyleft with network clause
- Commercial/proprietary licenses

**Verification**: `cargo-deny` checks licenses automatically

### Build Dependencies

More permissive - any OSI-approved license acceptable for build-time only dependencies.

## Version Control

### Git

**Hosting**: GitHub

**Branching Strategy**: GitHub Flow (feature branches + main)

**Commit Messages**: Conventional Commits

**Signing**: GPG-signed commits recommended

### Semantic Versioning

**Standard**: SemVer 2.0.0

**Format**: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

**Examples**:

- `0.1.0-alpha.1` - Initial alpha release
- `0.1.0-beta.1` - Beta release
- `1.0.0` - First stable release
- `1.1.0` - New features (backward compatible)
- `1.1.1` - Bug fixes
- `2.0.0` - Breaking changes

## Technology Decision Criteria

When evaluating new technologies, consider:

1. **Maturity**: Production-ready, stable API
2. **Maintenance**: Active development, responsive maintainers
3. **Community**: Good documentation, helpful community
4. **Performance**: Meets performance requirements
5. **Security**: Good security track record
6. **Licensing**: Compatible with project license
7. **Dependencies**: Minimal transitive dependencies
8. **Rust Integration**: Good Rust bindings if not Rust-native
9. **Testing**: Well-tested, high code coverage
10. **Alternatives**: Evaluated alternatives

## Technology Evaluation Process

1. **Research**: Identify options
2. **Prototype**: Build small proof-of-concept
3. **Benchmark**: Measure performance
4. **Review**: Team review of choice
5. **Document**: Record decision and rationale
6. **Integrate**: Add to project
7. **Monitor**: Track issues and consider alternatives

## Technology Radar

### Adopt

Technologies we use and recommend:

- Rust
- Tokio
- PostgreSQL
- NATS
- Kubernetes
- Prometheus

### Trial

Technologies we're experimenting with:

- ClickHouse (for very high volume)
- WASM (for plugins)
- eBPF (for advanced Sentinel capabilities)

### Assess

Technologies to evaluate:

- DuckDB (for analytics)
- Apache Arrow (for data interchange)
- Polars (for data processing)

### Hold

Technologies to avoid or phase out:

- Blocking I/O (use async)
- Unsafe Rust (use safe alternatives)
- Synchronous APIs (prefer async)

## References

- [Architecture](Architecture.md)
- [System Components](System-Components.md)
- [Rust Edition Guide](https://doc.rust-lang.org/edition-guide/)
- [Tokio Documentation](https://tokio.rs/)
- [gRPC Documentation](https://grpc.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
