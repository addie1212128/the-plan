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
  unless a kind genuinely needs a different UI. (The `event` module is the one
  exception: it renders a chronological Timeline at `/timeline`
  — `src/pages/TimelinePage.tsx` — and nav routes to it via `modulePath()`.)
  Entries also have an optional `category` (sub-category) string: the list page
  groups by it and the detail page edits it with an autocomplete of existing
  values for that kind. There are 35 modules; each carries a `group`
  (`MODULE_GROUPS`), and the sidebar + dashboard render them grouped via
  `modulesByGroup()`. The sidebar groups are collapsible.
- **Obsidian compatibility is a feature, keep it.** Entities round-trip through
  `src/lib/frontmatter.ts` (YAML frontmatter + markdown body, `[[wikilinks]]`).
  If you add fields to `Entity`, make them serialize sensibly there.
- **Portrait images** live in the Dexie `assets` table (one Blob per entity,
  keyed by entity id — `src/lib/images.ts`), not on the `Entity` (which only
  keeps the filename in `image`). JSON backup/restore and `clearAll`/
  `deleteEntity` all handle assets too — keep that parity if you touch them.

## Conventions

- Path alias `@/` → `src/`.
- Styling is Tailwind with a small set of component classes in `src/index.css`
  (`.panel`, `.btn-primary`, `.btn-ghost`, `.btn-ember`, `.input`, `.chip`) and
  color tokens in `tailwind.config.js` (`ink`, `parchment`, `ember`, `arcane`,
  `verdant`). Reuse these rather than ad-hoc colors. Dark theme only for now.
- 3D lives in `src/world/`. Keep it in react-three-fiber declarative style;
  the scene is keyed by `mode` so switching modes remounts/reset the camera.
- Global **command palette** (`src/components/CommandPalette.tsx`, mounted in
  `AppShell`) opens on ⌘K/Ctrl-K or via the top-bar button
  (`useUI.paletteOpen`); it searches entries/categories/pages and offers "New …"
  actions. It replaced the old inline `QuickSearch`.
- Don't put a model/marketing model name in commits, code, or PRs.

## Commands

```bash
npm run dev        # dev server on :5173
npm run build      # tsc -b && vite build  (run before claiming a build works)
npm run typecheck  # types only
```

Strict TypeScript is on (incl. noUnusedLocals/Parameters) — keep it clean.

## Known rough edges / next steps

- Heavy routes (`WorldPage`/`GraphPage`/`AtlasPage`) and the markdown renderer
  (`LoreMarkdown`) are code-split with `React.lazy` + `<Suspense>` in `App.tsx`.
  Initial bundle is ~400 kB; the 3D chunk (~880 kB) loads only on `/world`. Keep
  new heavy deps behind a lazy route.
- Vault sync is manual import/export (`src/lib/sync.ts`): markdown round-trips,
  and portraits are written to an `Images/` folder and linked via each note's
  frontmatter `image:` path (read back on import). Live file watching is a
  planned follow-up.
- Atlas mode can drape a user-uploaded map image over the plane
  (`src/lib/atlasMap.ts`, stored in the Dexie `meta` table); 3D heightmap
  terrain is still a future idea.
