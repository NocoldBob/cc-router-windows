# Changelog

All notable user-visible changes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses semantic versioning with prerelease identifiers during
the public beta.

## [Unreleased]

### Added

- Windows VS Code Companion extension with per-workspace Provider selection.
- Credential Manager-backed Claude Code process wrapper that keeps API Keys out of VS Code
  settings and extension state.
- Shared, secret-free Provider catalog for desktop and extension interoperability.

## [0.1.0-beta.1] - 2026-08-19

### Added

- Windows Tauri desktop application for managing Claude Code Provider routes.
- Process-scoped Claude Code launch with isolated route environment variables.
- Windows Credential Manager storage for Provider API keys.
- Optional confirmation-gated Windows user route with backup and rollback.
- Provider import and export without API keys.
- Launch-readiness checks for Claude CLI, credentials, working directory, route validity,
  and inherited Claude environment variable names without exposing their values.
- Verification dates and official documentation links for built-in Provider templates.
- Open-source repository policy, security, contribution, and release files.
- Clean Windows runner smoke tests for NSIS installation, app startup, and uninstall.

[Unreleased]: https://github.com/NocoldBob/cc-router-windows/compare/v0.1.0-beta.1...HEAD
[0.1.0-beta.1]: https://github.com/NocoldBob/cc-router-windows/releases/tag/v0.1.0-beta.1
