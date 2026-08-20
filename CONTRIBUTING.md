# Contributing to CC Router

Thank you for helping improve CC Router. The project is currently a focused
Windows beta, so changes should preserve its small trust boundary.

## Product Boundaries

- Windows only.
- Claude Code and Anthropic-compatible Provider routes only.
- No HTTP proxy, protocol conversion, request logging, telemetry, or cloud sync.
- Stored API keys stay in Windows Credential Manager and are never returned to
  the frontend, logs, exports, Provider JSON, or `localStorage`.
- Process-scoped launch is the recommended mode and does not modify Windows
  user environment variables or Claude configuration files.

Read `README.md`, `AGENTS.md`, and
`docs/PRODUCT_STRATEGY_AND_HANDOFF.md` before making behavioral changes.

## Development Setup

Requirements:

- Windows 10 or 11 with WebView2.
- Node.js 20 or newer and pnpm 10.
- Rust stable with the `x86_64-pc-windows-msvc` target.
- Visual Studio Build Tools with Desktop development with C++.

```powershell
pnpm install --frozen-lockfile
pnpm desktop:info
```

## Required Checks

```powershell
pnpm lint
pnpm test
pnpm build
pnpm vscode:check
cd src-tauri
cargo fmt --all -- --check
cargo test
cargo check
```

Changes involving credentials, IPC payloads, environment handling, PowerShell
generation, executable launch, import/export, or backup compatibility require
focused regression tests.

## Safe Testing

- Use fake API keys only.
- Do not commit `.env` files, Provider exports containing secrets, route backup
  files, private paths, private project content, or diagnostic logs.
- Automated tests must not modify the maintainer's Windows user environment.
- Test persistent routing manually only on an expendable test account and
  restore the previous route afterward.

## Pull Requests

- Keep changes focused and explain the user-visible behavior.
- Include tests proportional to the security and behavioral impact.
- Update README, security documentation, and Roadmap language when relevant.
- Do not describe Roadmap items as implemented features.
- Confirm all required checks pass before requesting review.

Report vulnerabilities privately according to `SECURITY.md` rather than opening
a public issue.
