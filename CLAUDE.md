# Project notes for Claude

Loremkeeper — a local-first worldbuilding studio (lore/characters wiki + an
interactive 3D world + Obsidian vault sync). See `README.md` for the full tour.

## Ground rules

- **Local-first, no accounts, no backend.** Do not add servers, auth, or
  cloud calls unless explicitly asked. The storage layer is adapter-based so
  cloud sync can be added later without touching the UI.
- **The live source of truth is IndexedDB (Dexie).** The UI binds to it
  reactively via `dexie-react-hooks` (`src/hooks/useEntities.ts`). Mutations go
  through `src/lib/data.ts`. The Obsidian vault is a sync target, not the live
  store (see `src/lib/sync.ts`).
- **Everything is an `Entity`** (`src/lib/types.ts`). New "modules" are added by
  appending to `MODULES` in `src/config/modules.ts` — the list/detail pages,
  nav, dashboard, and search all derive from it. Avoid bespoke per-kind pages
  unless a kind genuinely needs a different UI.
- **Obsidian compatibility is a feature, keep it.** Entities round-trip through
  `src/lib/frontmatter.ts` (YAML frontmatter + markdown body, `[[wikilinks]]`).
  If you add fields to `Entity`, make them serialize sensibly there.

## Conventions

- Path alias `@/` → `src/`.
- Styling is Tailwind with a small set of component classes in `src/index.css`
  (`.panel`, `.btn-primary`, `.btn-ghost`, `.btn-ember`, `.input`, `.chip`) and
  color tokens in `tailwind.config.js` (`ink`, `parchment`, `ember`, `arcane`,
  `verdant`). Reuse these rather than ad-hoc colors. Dark theme only for now.
- 3D lives in `src/world/`. Keep it in react-three-fiber declarative style;
  the scene is keyed by `mode` so switching modes remounts/reset the camera.
- Don't put a model/marketing model name in commits, code, or PRs.

## Commands

```bash
npm run dev        # dev server on :5173
npm run build      # tsc -b && vite build  (run before claiming a build works)
npm run typecheck  # types only
```

Strict TypeScript is on (incl. noUnusedLocals/Parameters) — keep it clean.

## Known rough edges / next steps

- 3D bundle is large (~1.4 MB); consider lazy-loading `WorldPage`.
- Vault sync is manual import/export; live file watching is a planned follow-up.
- Atlas mode is a flat grid; heightmap / uploaded-image terrain is a future idea.
