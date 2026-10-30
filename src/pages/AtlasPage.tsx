import { ExternalLink, Maximize2, BookMarked } from "lucide-react";

/**
 * Embeds the user's own "Ellie Build Atlas" artifact as an in-app page.
 *
 * The atlas is a self-contained HTML document bundled at
 * public/atlas/ellie-build-atlas.html, so it loads from this same origin
 * (no cross-origin frame blocking) and works fully offline. It's a snapshot —
 * re-copy the file from the published artifact to update it.
 */

const LOCAL_SRC = "/atlas/ellie-build-atlas.html";
const LIVE_URL = "https://claude.ai/artifact/T2RimMUXkLMcsy18HD1tMV";

export function AtlasPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-ink-600 bg-ink-800/60 px-6 py-3">
        <BookMarked className="h-5 w-5 text-ember" />
        <div className="min-w-0">
          <div className="font-display text-lg leading-tight text-parchment-100">The Ellie Build Atlas</div>
          <div className="truncate text-xs text-parchment-300/60">
            Production bible for Ellie, the Last Dragon — bundled locally, works offline
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a href={LOCAL_SRC} target="_blank" rel="noreferrer" className="btn-ghost text-sm">
            <Maximize2 className="h-3.5 w-3.5" /> Full screen
          </a>
          <a href={LIVE_URL} target="_blank" rel="noreferrer" className="btn-ghost text-sm">
            <ExternalLink className="h-3.5 w-3.5" /> View live
          </a>
        </div>
      </div>
      <iframe
        src={LOCAL_SRC}
        title="The Ellie Build Atlas"
        className="w-full flex-1 border-0 bg-white"
      />
    </div>
  );
}
