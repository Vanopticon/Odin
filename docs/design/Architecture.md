# Vanopticon Architecture

## Overview

Vanopticon employs a distributed, modular architecture designed for scalability, resilience, and operational flexibility. The system is built around four core modules that can operate independently or as part of an integrated ecosystem.

## Architectural Principles

### Principle 1: Distributed by Design

All components are designed to operate in distributed environments with eventual consistency, automatic service discovery, and graceful degradation.

### Principle 2: Event-Driven Architecture

The system uses asynchronous, event-driven communication patterns to achieve high throughput and loose coupling between components.

### Principle 3: Policy as Code

All operational behavior, security rules, and response actions are defined declaratively and version-controlled.

### Principle 4: Observable and Auditable

Every action, decision, and state change is logged and traceable for compliance and forensic analysis.

### Principle 5: Secure by Default

All communication is encrypted, all data is validated, and all operations are authenticated and authorized.

## System Context

```mermaid
graph TB
    subgraph External["External Systems"]
        SIEM[SIEM Systems]
        IdP[Identity Provider]
        TI[Threat Intelligence]
        Email[Email/Notification]
    end

    subgraph Vanopticon["Vanopticon Ecosystem"]
        Command[Command Module]
        Analysis[Analysis Module]
        Shield[Shield Module]
        Sentinel[Sentinel Modules]
    end

    subgraph Monitored["Monitored Infrastructure"]
        Servers[Servers]
        Network[Network Devices]
        Cloud[Cloud Resources]
        Containers[Containers]
    end

    Sentinel -->|Telemetry| Analysis
    Analysis -->|Alerts| Command
    Analysis -->|Threats| Shield
    Shield -->|Actions| Command
    Command -->|Config| Sentinel
    Command -->|Policy| Shield
    Command -->|Rules| Analysis

    Sentinel -.->|Monitor| Servers
    Sentinel -.->|Monitor| Network
    Sentinel -.->|Monitor| Cloud
    Sentinel -.->|Monitor| Containers

    Shield -.->|Respond| Servers
    Shield -.->|Respond| Network
    Shield -.->|Respond| Containers

    Command -->|Integrate| SIEM
    Command -->|Authenticate| IdP
    Analysis -->|Enrich| TI
    Command -->|Notify| Email

    style Vanopticon fill:#e1f5ff,stroke:#0066cc,stroke-width:3px
    style External fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    style Monitored fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```

## Module Architecture

### Sentinel Module

The Sentinel module provides distributed monitoring and data collection capabilities.

```mermaid
graph TB
    subgraph Sentinel["Sentinel Module"]
        Collector[Data Collector]
        Parser[Log Parser]
        Enricher[Event Enricher]
        Filter[Event Filter]
        Buffer[Local Buffer]
        Transmitter[Data Transmitter]

        Collector --> Parser
        Parser --> Enricher
        Enricher --> Filter
        Filter --> Buffer
        Buffer --> Transmitter
    end

    subgraph Sources["Data Sources"]
        Syslog[System Logs]
        NetFlow[Network Flow]
        ProcMon[Process Monitor]
        FileMon[File Monitor]
        WinEvent[Windows Events]
    end

    subgraph Outputs["Outputs"]
        Analysis[Analysis Module]
        Storage[Local Storage]
    end

    Syslog --> Collector
    NetFlow --> Collector
    ProcMon --> Collector
    FileMon --> Collector
    WinEvent --> Collector

    Transmitter --> Analysis
    Buffer -.->|Backup| Storage

    style Sentinel fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
    style Sources fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Outputs fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
```

### Analysis Module

The Analysis module processes telemetry data using multiple detection techniques.

```mermaid
graph TB
    subgraph Analysis["Analysis Module"]
        Ingestion[Data Ingestion]
        Correlation[Event Correlation]
        SignatureDet[Signature Detection]
        AnomalyDet[Anomaly Detection]
        MLEngine[ML Analysis Engine]
        ThreatScore[Threat Scoring]
        AlertGen[Alert Generator]

        Ingestion --> Correlation
        Correlation --> SignatureDet
        Correlation --> AnomalyDet
        Correlation --> MLEngine
        SignatureDet --> ThreatScore
        AnomalyDet --> ThreatScore
        MLEngine --> ThreatScore
        ThreatScore --> AlertGen
    end

    subgraph Inputs["Inputs"]
        Sentinels[Sentinel Data]
        ThreatIntel[Threat Intelligence]
        Historical[Historical Data]
    end

    subgraph Outputs["Outputs"]
        Alerts[Alert Stream]
        Insights[Insights DB]
        Shield[Shield Module]
    end

    Sentinels --> Ingestion
    ThreatIntel --> SignatureDet
    Historical --> MLEngine

    AlertGen --> Alerts
    AlertGen --> Insights
    AlertGen --> Shield

    style Analysis fill:#e3f2fd,stroke:#1565c0,stroke-width:3px
    style Inputs fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Outputs fill:#fce4ec,stroke:#c2185b,stroke-width:2px
```

### Shield Module

The Shield module provides automated response and containment capabilities.

```mermaid
graph TB
    subgraph Shield["Shield Module"]
        PolicyEngine[Policy Engine]
        DecisionMaker[Decision Maker]
        ActionQueue[Action Queue]
        Executor[Action Executor]
        Validator[Action Validator]
        Rollback[Rollback Handler]

        PolicyEngine --> DecisionMaker
        DecisionMaker --> ActionQueue
        ActionQueue --> Validator
        Validator --> Executor
        Executor -.->|Failure| Rollback
    end

    subgraph Inputs["Inputs"]
        Alerts[Analysis Alerts]
        Policies[Policy Repository]
        Manual[Manual Commands]
    end

    subgraph Actions["Response Actions"]
        Isolate[Network Isolation]
        Terminate[Process Termination]
        Quarantine[File Quarantine]
        Block[IP/Domain Block]
        Escalate[Alert Escalation]
    end

    Alerts --> PolicyEngine
    Policies --> PolicyEngine
    Manual --> DecisionMaker

    Executor --> Isolate
    Executor --> Terminate
    Executor --> Quarantine
    Executor --> Block
    Executor --> Escalate

    style Shield fill:#fff3e0,stroke:#ef6c00,stroke-width:3px
    style Inputs fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style Actions fill:#ffebee,stroke:#c62828,stroke-width:2px
```

### Command Module

The Command module provides centralized coordination and control.

```mermaid
graph TB
    subgraph Command["Command Module"]
        API[API Gateway]
        WebUI[Web Dashboard]
        ConfigMgr[Configuration Manager]
        DeployMgr[Deployment Manager]
        AuthZ[Authentication/Authorization]
        EventBus[Event Bus]
        Audit[Audit Logger]

        API --> AuthZ
        WebUI --> API
        API --> ConfigMgr
        API --> DeployMgr
        API --> EventBus
        EventBus --> Audit
    end

    subgraph Storage["Storage Layer"]
        ConfigDB[(Config Database)]
        StateDB[(State Database)]
        TimeSeriesDB[(Time Series DB)]
        AuditLog[(Audit Logs)]
    end

    subgraph Modules["Managed Modules"]
        Sentinels[Sentinels]
        AnalysisInst[Analysis Instances]
        ShieldInst[Shield Instances]
    end

    ConfigMgr --> ConfigDB
    DeployMgr --> StateDB
    EventBus --> TimeSeriesDB
    Audit --> AuditLog

    ConfigMgr --> Sentinels
    ConfigMgr --> AnalysisInst
    ConfigMgr --> ShieldInst
    DeployMgr --> Sentinels
    DeployMgr --> AnalysisInst
    DeployMgr --> ShieldInst

    style Command fill:#fce4ec,stroke:#ad1457,stroke-width:3px
    style Storage fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    style Modules fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
```

## Data Flow Architecture

### Telemetry Data Flow

```mermaid
sequenceDiagram
    participant S as Sentinel
    participant B as Message Broker
    participant A as Analysis
    participant D as Data Store
    participant C as Command

    S->>B: Publish Events (batched)
    B->>A: Stream Events
    A->>A: Parse & Correlate
    A->>A: Apply Detection Rules
    A->>D: Store Events
    A->>D: Store Detections

    alt Threat Detected
        A->>C: Send Alert
        C->>C: Display on Dashboard
        A->>B: Publish Threat Event
    end

    Note over S,C: Continuous telemetry pipeline
```

### Alert and Response Flow

```mermaid
sequenceDiagram
    participant A as Analysis
    participant C as Command
    participant S as Shield
    participant T as Target System
    participant O as Operator

    A->>C: Alert Generated
    C->>O: Display Alert (Dashboard)
    C->>S: Forward Alert

    S->>S: Evaluate Policy
    alt Policy Match
        S->>S: Queue Action
        S->>T: Execute Response
        T-->>S: Action Result
        S->>C: Report Action
        C->>O: Update Dashboard
    else No Policy Match
        S->>C: Escalate for Manual Review
        O->>C: Manual Decision
        C->>S: Execute Manual Command
    end

    S->>C: Store Audit Trail
```

### Configuration Management Flow

```mermaid
sequenceDiagram
    participant O as Operator
    participant C as Command UI
    participant V as Validator
    participant R as Config Repository
    participant M as Module (Sentinel/Analysis/Shield)

    O->>C: Update Configuration
    C->>V: Validate Config
    V-->>C: Validation Result

    alt Valid Configuration
        C->>R: Store Config Version
        C->>M: Deploy Configuration
        M->>M: Apply Configuration
        M-->>C: Confirm Applied
        C->>O: Success Notification
    else Invalid Configuration
        C->>O: Validation Errors
    end

    Note over O,M: All changes are versioned and auditable
```

## Deployment Architecture

### Single-Host Deployment

```mermaid
graph TB
    subgraph Host["Single Host Deployment"]
        subgraph Container["Container Environment"]
            Command[Command Module]
            Analysis[Analysis Module]
            Shield[Shield Module]
            Sentinel[Sentinel Module]
        end

        subgraph Storage["Local Storage"]
            ConfigDB[(Config DB)]
            TimeSeriesDB[(Metrics DB)]
            AuditLog[(Audit Logs)]
        end

        Command --> Storage
        Analysis --> Storage
        Sentinel --> Analysis
        Analysis --> Shield
    end

    Sentinel -.->|Monitor| Host
    Shield -.->|Respond| Host

    style Container fill:#e1f5ff,stroke:#0277bd,stroke-width:2px
    style Storage fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
```

### Distributed Deployment

```mermaid
graph TB
    subgraph CommandZone["Command Zone"]
        Command1[Command Instance 1]
        Command2[Command Instance 2]
        LB1[Load Balancer]

        LB1 --> Command1
        LB1 --> Command2
    end

    subgraph AnalysisZone["Analysis Zone"]
        Analysis1[Analysis Instance 1]
        Analysis2[Analysis Instance 2]
        Analysis3[Analysis Instance 3]
    end

    subgraph ShieldZone["Shield Zone"]
        Shield1[Shield Instance 1]
        Shield2[Shield Instance 2]
    end

    subgraph DataZone["Data Layer"]
        ConfigDB[(Config DB Cluster)]
        TimeSeriesDB[(Time Series Cluster)]
        MessageBroker[Message Broker Cluster]
        ObjectStore[(Object Storage)]
    end

    subgraph MonitoredInfra["Monitored Infrastructure"]
        Region1[Region 1 Sentinels]
        Region2[Region 2 Sentinels]
        Region3[Region 3 Sentinels]
    end

    Command1 --> DataZone
    Command2 --> DataZone
    Analysis1 --> DataZone
    Analysis2 --> DataZone
    Analysis3 --> DataZone
    Shield1 --> DataZone
    Shield2 --> DataZone

    Region1 --> MessageBroker
    Region2 --> MessageBroker
    Region3 --> MessageBroker

    MessageBroker --> Analysis1
    MessageBroker --> Analysis2
    MessageBroker --> Analysis3

    Analysis1 -.-> Shield1
    Analysis2 -.-> Shield1
    Analysis3 -.-> Shield2
    Analysis1 -.-> Shield2

    style CommandZone fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style AnalysisZone fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style ShieldZone fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style DataZone fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style MonitoredInfra fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```

### Kubernetes Deployment

```mermaid
graph TB
    subgraph K8s["Kubernetes Cluster"]
        subgraph NSCommand["command namespace"]
            CommandDeploy[Command Deployment]
            CommandSvc[Command Service]
            Ingress[Ingress Controller]

            Ingress --> CommandSvc
            CommandSvc --> CommandDeploy
        end

        subgraph NSAnalysis["analysis namespace"]
            AnalysisDeploy[Analysis Deployment]
            AnalysisSvc[Analysis Service]
            AnalysisHPA[HPA]

            AnalysisSvc --> AnalysisDeploy
            AnalysisHPA -.->|Scale| AnalysisDeploy
        end

        subgraph NSShield["shield namespace"]
            ShieldDeploy[Shield Deployment]
            ShieldSvc[Shield Service]
        end

        subgraph NSData["data namespace"]
            PostgreSQL[PostgreSQL StatefulSet]
            TimescaleDB[TimescaleDB StatefulSet]
            NATS[NATS Cluster]
            PVC1[(PVC - Postgres)]
            PVC2[(PVC - TimescaleDB)]

            PostgreSQL --> PVC1
            TimescaleDB --> PVC2
        end

        subgraph NSSentinel["sentinel namespace"]
            SentinelDS[Sentinel DaemonSet]
        end

        CommandDeploy --> PostgreSQL
        CommandDeploy --> TimescaleDB
        AnalysisDeploy --> NATS
        AnalysisDeploy --> TimescaleDB
        ShieldDeploy --> PostgreSQL
        SentinelDS --> NATS
    end

    Users[Users] --> Ingress

    style NSCommand fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style NSAnalysis fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style NSShield fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style NSData fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style NSSentinel fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```

## Communication Patterns

### Synchronous Communication (Request-Response)

Used for:

- Configuration updates from Command to modules
- Health checks and status queries
- Manual operator commands
- API requests to Command module

Protocol: gRPC over HTTP/2 with TLS 1.3

### Asynchronous Communication (Publish-Subscribe)

Used for:

- Telemetry data from Sentinels to Analysis
- Alert distribution from Analysis to Shield and Command
- Event notifications across modules
- Real-time dashboard updates

Protocol: NATS or RabbitMQ with TLS

### Streaming Communication

Used for:

- Real-time dashboard data updates
- Log streaming for monitoring
- Live query results

Protocol: WebSocket over TLS

## Data Architecture

### Data Types and Storage

| Data Type | Volume | Latency Req | Retention | Storage |
|-----------|--------|-------------|-----------|---------|
| Raw Events | Very High | Low | 30-90 days | Time-series DB / Object Storage |
| Processed Events | High | Low | 1 year | Time-series DB |
| Alerts | Medium | Very Low | 2+ years | Relational DB |
| Configurations | Low | Low | Indefinite (versioned) | Relational DB |
| Audit Logs | Medium | Low | 7+ years | Append-only storage |
| ML Models | Low | Medium | Versioned | Object Storage |
| Dashboards | Low | Low | Indefinite | Relational DB |

### Data Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Collected: Event Generated
    Collected --> HotStorage: Real-time Ingestion
    HotStorage --> Indexed: Indexing
    Indexed --> Analyzed: Detection Applied
    Analyzed --> WarmStorage: Age > 30 days
    WarmStorage --> ColdStorage: Age > 90 days
    ColdStorage --> Archived: Age > 1 year
    Archived --> Deleted: Retention Policy
    Deleted --> [*]

    Analyzed --> Alert: Threat Detected
    Alert --> [*]: Resolved
```

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Command API
    participant I as Identity Provider
    participant S as Session Store

    U->>C: Access Request
    C->>I: Redirect to IdP
    I->>U: Login Page
    U->>I: Credentials
    I->>I: Validate
    I->>C: Auth Token (JWT)
    C->>S: Store Session
    C->>U: Access Granted
    U->>C: Subsequent Requests (with token)
    C->>S: Validate Session
    C->>U: Response
```

### Authorization Model

```mermaid
graph TB
    User[User Identity]
    Role[Role Assignment]
    Permission[Permissions]
    Resource[Resource]
    Action[Action]
    Policy[Policy Decision]

    User --> Role
    Role --> Permission
    Permission --> Resource
    Permission --> Action
    Resource --> Policy
    Action --> Policy
    User --> Policy

    Policy --> Decision{Allow/Deny}

    style Policy fill:#ffebee,stroke:#c62828,stroke-width:2px
    style Decision fill:#fff3e0,stroke:#e65100,stroke-width:2px
```

### Network Security Zones

```mermaid
graph TB
    subgraph Internet["Internet"]
        Users[Operators]
    end

    subgraph DMZ["DMZ"]
        LB[Load Balancer]
        WAF[Web Application Firewall]
    end

    subgraph AppZone["Application Zone"]
        Command[Command Module]
        API[API Gateway]
    end

    subgraph DataZone["Data Zone"]
        DB[(Databases)]
        Storage[(Storage)]
    end

    subgraph AnalysisZone["Analysis Zone"]
        Analysis[Analysis Module]
        Shield[Shield Module]
    end

    subgraph MonitorZone["Monitoring Zone"]
        Sentinels[Sentinel Agents]
    end

    Users -->|HTTPS| WAF
    WAF --> LB
    LB -->|mTLS| Command
    Command -->|Encrypted| DB
    Command -->|gRPC/TLS| Analysis
    Analysis -->|gRPC/TLS| Shield
    Sentinels -->|TLS| Analysis
    Shield -.->|Controlled| MonitorZone

    style DMZ fill:#ffebee,stroke:#c62828,stroke-width:2px
    style AppZone fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style DataZone fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style AnalysisZone fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style MonitorZone fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
```

## Scalability Patterns

### Horizontal Scaling

All modules support horizontal scaling:

- **Sentinel**: Deployed as DaemonSet (one per monitored host) or StatefulSet for dedicated monitoring instances
- **Analysis**: Stateless processing nodes; scale based on event ingestion rate
- **Shield**: Stateless action executors; scale based on response volume
- **Command**: Active-active deployment behind load balancer; session affinity via distributed cache

### Vertical Scaling

Resource allocation recommendations per module:

- **Sentinel**: 256MB-512MB RAM, 0.5-1 CPU core per instance
- **Analysis**: 2-4GB RAM, 2-4 CPU cores per instance (scales with detection complexity)
- **Shield**: 512MB-1GB RAM, 1-2 CPU cores per instance
- **Command**: 1-2GB RAM, 1-2 CPU cores per instance

### Load Distribution

```mermaid
graph LR
    subgraph Sources["Event Sources"]
        S1[Sentinel 1]
        S2[Sentinel 2]
        S3[Sentinel 3]
        SN[Sentinel N]
    end

    subgraph Distribution["Load Balancing"]
        LB[Message Broker<br/>Partition by Source]
    end

    subgraph Processing["Analysis Instances"]
        A1[Analysis 1<br/>Partition 1-3]
        A2[Analysis 2<br/>Partition 4-6]
        A3[Analysis 3<br/>Partition 7-9]
    end

    S1 --> LB
    S2 --> LB
    S3 --> LB
    SN --> LB

    LB -->|Part 1-3| A1
    LB -->|Part 4-6| A2
    LB -->|Part 7-9| A3

    style Distribution fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
```

## Technology Stack

### Core Technologies

- **Language**: Rust (1.75+)
- **Async Runtime**: Tokio
- **Serialization**: Protocol Buffers, serde
- **API Framework**: tonic (gRPC), axum (REST)
- **Message Broker**: NATS or RabbitMQ
- **Databases**: PostgreSQL, TimescaleDB
- **Object Storage**: S3-compatible (MinIO, AWS S3)
- **Observability**: OpenTelemetry, Prometheus, Grafana

### Development Tools

- **Build**: Cargo
- **Formatting**: rustfmt
- **Linting**: clippy
- **Testing**: cargo test, cargo-nextest
- **Security**: cargo-audit, cargo-deny
- **Documentation**: rustdoc, mdBook

## Accessibility Considerations

All visual elements in the architecture conform to WCAG 2.2 AAA standards:

- **Color Contrast**: All color combinations in diagrams meet 7:1 contrast ratio
- **Color Independence**: Information is not conveyed by color alone; shapes and labels are used
- **Text Size**: All text in diagrams is readable at standard zoom levels
- **Alternative Text**: All diagrams are accompanied by textual descriptions
- **Keyboard Navigation**: Web UI supports full keyboard navigation
- **Screen Reader Support**: ARIA labels and semantic HTML used throughout

## References

- [Requirements Document](Requirements.md)
- [System Components](System-Components.md)
- [Security Architecture](Security-Architecture.md)
- [Deployment Guide](../deployment/README.md)
- [API Documentation](../api/README.md)
