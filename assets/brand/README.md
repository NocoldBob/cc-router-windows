# CC Router Icon

The master application icon is `cc-router-icon-master.png`.

## Design

- Dark rounded-square application tile
- Mint `C` for CC Router
- White `R` ending in a routing arrow
- Coral terminal prompt and mint cursor

Primary palette:

- Tile: `#20231F`
- Route mark: `#77DFA0`
- Letter mark: `#FFFFFF`
- Terminal prompt: `#F26B5E`

## Provenance

This icon was generated specifically for CC Router on 2026-08-18 using
OpenAI ImageGen. Concept D was selected by the project maintainer and refined
from that generated concept. No Tauri, Anthropic, Claude, or Windows logo was
used as an image reference.

The icon is distributed under the repository's MIT license. Its use does not
imply endorsement by, or affiliation with, any third party.

Platform icon files in `src-tauri/icons` are generated from the master with:

```powershell
pnpm tauri icon assets/brand/cc-router-icon-master.png --output src-tauri/icons
```

The Tauri CLI also emits mobile icon directories. CC Router is Windows-only,
so those unused generated directories are not retained in this repository.
