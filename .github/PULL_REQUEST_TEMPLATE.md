## Summary

Describe the user-visible change and why it belongs in CC Router.

## Security Impact

Describe any effect on credentials, IPC, process environments, PowerShell,
Provider import/export, backups, or executable launch. Write `None` when there
is no security-boundary change.

## Verification

- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `cargo fmt --all -- --check`
- [ ] `cargo test`
- [ ] `cargo check`
- [ ] No real credentials, private paths, or private project data were used.
- [ ] User-facing documentation was updated when needed.
