import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Waypoints, ExternalLink, X } from "lucide-react";
import { useAllEntities } from "@/hooks/useEntities";
import { buildGraphData } from "@/lib/graph";
import { RelationshipGraph } from "@/components/RelationshipGraph";
import { MODULES, moduleFor } from "@/config/modules";
import type { EntityKind } from "@/lib/types";
import { EmptyState } from "@/components/ui";

export function GraphPage() {
  const entities = useAllEntities();
  const [hidden, setHidden] = useState<Set<EntityKind>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleEntities = useMemo(
    () => (entities ?? []).filter((e) => !hidden.has(e.kind)),
    [entities, hidden],
  );
  const data = useMemo(() => buildGraphData(visibleEntities), [visibleEntities]);

  const selected = entities?.find((e) => e.id === selectedId) ?? null;
  const connections = useMemo(() => {
    if (!selectedId) return [];
    const ids = new Set<string>();
    for (const e of data.edges) {
      if (e.source === selectedId) ids.add(e.target);
      if (e.target === selectedId) ids.add(e.source);
    }
    return (entities ?? []).filter((e) => ids.has(e.id));
  }, [selectedId, data.edges, entities]);

  function toggleKind(k: EntityKind) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  if (entities && entities.length === 0) {
    return (
      <div className="p-10">
        <EmptyState icon={<Waypoints className="h-10 w-10" />} title="Nothing to connect yet">
          Create some entries and link them with <span className="chip">[[wikilinks]]</span> — they'll
          appear here as a web you can explore.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-ink-900">
      <RelationshipGraph data={data} selectedId={selectedId} onSelect={setSelectedId} />

      {/* Title + stats */}
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-ink-500/70 bg-ink-800/80 px-3 py-2 backdrop-blur">
          <Waypoints className="h-4 w-4 text-arcane" />
          <span className="text-sm text-parchment-100">Relationships</span>
          <span className="chip">{data.nodes.length} nodes · {data.edges.length} links</span>
        </div>
      </div>

      {/* Legend / kind filter */}
      <div className="absolute right-4 top-4 w-52 rounded-xl border border-ink-500/70 bg-ink-800/80 p-3 backdrop-blur">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-parchment-300/60">
          Filter by kind
        </div>
        <div className="space-y-1">
          {MODULES.map((m) => {
            const off = hidden.has(m.kind);
            return (
              <button
                key={m.kind}
                onClick={() => toggleKind(m.kind)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm transition ${
                  off ? "opacity-40 hover:opacity-70" : "hover:bg-ink-600/50"
                }`}
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="flex-1 text-left text-parchment-200">{m.label}</span>
                <m.icon className="h-3.5 w-3.5" style={{ color: m.color }} />
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-parchment-300/40">
          Drag to pan · scroll to zoom · drag a node to move it · click to open.
        </p>
      </div>

      {/* Selected node panel */}
      {selected && (
        <div className="panel absolute bottom-4 left-4 w-80 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {(() => {
                const m = moduleFor(selected.kind);
                return <m.icon className="h-4 w-4" style={{ color: m.color }} />;
              })()}
              <h3 className="font-display text-lg text-parchment-100">{selected.name}</h3>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-parchment-300/50 hover:text-parchment-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          {selected.summary && <p className="mt-1 text-sm text-parchment-300/70">{selected.summary}</p>}
          <div className="mt-3">
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-parchment-300/50">
              Connections · {connections.length}
            </div>
            <div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto">
              {connections.length === 0 && (
                <span className="text-xs text-parchment-300/50">No links yet.</span>
              )}
              {connections.map((c) => (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className="chip hover:border-arcane/60">
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <Link
            to={`/m/${moduleFor(selected.kind).slug}/${selected.id}`}
            className="btn-ghost mt-3 w-full text-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open entry
          </Link>
        </div>
      )}
    </div>
  );
}
