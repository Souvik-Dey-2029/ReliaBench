# RELIABENCH THIRD-PARTY ATTRIBUTION AND LICENSING

Reliabench references concepts and open-source specifications from the following projects:

### 1. Harbor Framework
- **Repository**: `https://github.com/harbor-framework/harbor`
- **Pinned Baseline**: `v0.25.0` (Commit `fdba28f`)
- **License**: MIT License
- **Attribution Notice**: Harbor is developed by the Harbor Framework authors. Reliabench interfaces with Harbor via its command-line execution interface (`harbor run`) and consumes the Agent Trajectory Interchange Format (ATIF). No proprietary source code from Harbor was directly copied into this repository.

### 2. AgentClash
- **Repository**: `https://github.com/agentclash/agentclash`
- **License**: MIT / Apache 2.0
- **Attribution Notice**: Concepts of standardized challenge packs, multi-turn scorecards, and failure taxonomy were studied as architectural patterns. Reliabench independently implements these concepts in Python and TypeScript.

### 3. Bifrost Gateway
- **Repository**: `https://github.com/maximhq/bifrost`
- **License**: Apache 2.0
- **Attribution Notice**: Model gateway architecture and token observability concepts are modeled after Bifrost by Maxim AI.

### 4. Opik
- **Repository**: `https://github.com/comet-ml/opik`
- **License**: Apache 2.0
- **Attribution Notice**: Evaluation metric mathematics (Pass@k, Pass^k, dataset/experiment organization) reference Opik's statistical methodologies.

### 5. Langfuse
- **Repository**: `https://github.com/langfuse/langfuse`
- **License**: MIT / FSL
- **Attribution Notice**: Hierarchical trace and waterfall observation UI paradigms reference Langfuse's trace presentation designs.

