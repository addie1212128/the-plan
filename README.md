# Loremkeeper

A local-first **worldbuilding studio** — a personal take on Campfire. Keep your
lore, characters, factions, items, timeline and notes in one place, and explore
your world on an **interactive 3D map** with three view modes. Your data lives on
your device and can be read/written straight to an **Obsidian vault** of markdown
files.

> Status: **scaffold / foundation.** The architecture, data layer, wiki editing,
> the 3D world, and Obsidian sync are all working. Individual modules are built
> on shared machinery and get fleshed out from here.

## Highlights

- **Local-first, no accounts.** Everything is stored privately in your browser
  (IndexedDB). Nothing is uploaded to a server.
- **Obsidian-friendly.** Entries serialize 1:1 to markdown files with YAML
  frontmatter. Link a folder (your vault) and import/export the real files.
- **A wiki that links itself.** Write in markdown with Obsidian-style
  `[[wikilinks]]` that resolve to other entries.
- **A relationship graph.** A force-directed web of every entry, with edges
  built from both explicit links and the `[[wikilinks]]` in bodies — pan, zoom,
  filter by kind, and click through to any entry.
- **One interactive 3D world, three ways:**
  - **Atlas** — a flat map plane with location pins.
  - **Diorama** — a low-poly 3D landscape you orbit.
  - **Globe** — a whole planet you spin and zoom.
  Pin any entry onto any mode and click through to its page.

## Tech

| Concern        | Choice |
| -------------- | ------ |
| Build / dev    | Vite |
| UI             | React 18 + TypeScript |
| Styling        | Tailwind CSS |
| Routing        | React Router |
| 3D             | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Local storage  | IndexedDB via Dexie (reactive with `dexie-react-hooks`) |
| UI state       | Zustand |
| Markdown       | `react-markdown` + `remark-gfm`; YAML via `js-yaml` |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # typecheck + production build to dist/
npm run preview    # serve the production build
npm run typecheck  # types only
```

On first run, open the Dashboard and click **Load example world** to see a small
sample (characters, locations, lore, and map pins).

## How it's organized

```
src/
  config/modules.ts     # the "modules" (Characters, Locations, …): kinds, icons, folders
  lib/
    types.ts            # Entity domain model
    db.ts               # Dexie (IndexedDB) database
    data.ts             # create/update/delete entities (the live source of truth)
    frontmatter.ts      # Entity <-> Obsidian markdown (YAML frontmatter) codec
    sync.ts             # import/export between the local store and a vault folder
    storage/            # StorageAdapter interface + local & vault (File System Access) adapters
    store.ts            # Zustand UI state
  hooks/useEntities.ts  # reactive queries (live-updating lists/counts/markers)
  components/           # layout shell, quick search, markdown renderer, shared UI
  pages/                # Dashboard, entity list, entity detail/editor, World, Settings
  world/WorldScene.tsx  # the react-three-fiber scene (atlas/diorama/globe)
```

### Data model

Everything you track is an **Entity** (`src/lib/types.ts`): a character,
location, faction, item, creature, event, or lore note. Each one maps to a
markdown file like:

```markdown
---
kind: character
summary: The exiled heir of House Varr
tags: [royalty, exile]
fields:
  Role: Protagonist
marker: { mode: atlas, x: -6, y: 0, z: 3 }
---
# Seren Varr

Body markdown, with [[wikilinks]] to other entries…
```

The **local IndexedDB store is the live, reactive source** the UI binds to.
The **Obsidian vault** is kept in step via explicit import/export in Settings
(live two-way file watching is a planned next step).

## Obsidian connection

In **Settings → Obsidian vault**, "Connect a vault folder" uses the browser's
File System Access API to let you grant access to a folder on disk — point it at
an Obsidian vault. Each top-level folder maps to an entity kind
(`Characters/`, `Locations/`, …).

Folder access requires a Chromium browser (Chrome, Edge, Brave, Arc). In other
browsers, the JSON backup/restore in Settings works everywhere.

## Roadmap ideas

- Live two-way vault sync (file watching) instead of manual import/export
- Relationship graph view; richer timeline
- Heightmap / uploaded-image terrain for the Atlas mode
- Lazy-load the 3D world bundle to shrink first paint
- Optional cloud sync (the storage layer is already adapter-based)
