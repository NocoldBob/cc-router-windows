# Roadmap

CC Router is intentionally focused on Windows, Claude Code, and direct
Anthropic-compatible Provider routes. Roadmap items are plans, not implemented
features.

## Public Beta Readiness

- Automated Windows checks for frontend and Rust code.
- Reproducible beta releases with installer checksums and build provenance.
- Clean-machine installation, launch, rollback, and uninstall verification.
- Clear unsigned-installer and trust-boundary documentation.
- Provider template verification dates.

## Focus Areas

- Better diagnostics for conflicting environment variables.
- Redacted diagnostic reports.
- Optional endpoint and model availability checks that send no project data.
- Launching an isolated terminal or VS Code workspace with a selected Provider.
- Windows ARM64 evaluation.
- Code signing and a carefully designed update path.

## Out of Scope Without a Product Decision

- HTTP proxying or protocol conversion.
- Request, prompt, response, token, usage, or billing logs.
- Telemetry, cloud synchronization, or hosted account services.
- Automatic failover across Providers.
- Managing unrelated AI CLIs, MCP servers, prompts, or sessions.
