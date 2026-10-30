import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAllEntities } from "@/hooks/useEntities";
import { moduleFor } from "@/config/modules";

/** Lightweight global jump-to-entity search in the top bar. */
export function QuickSearch() {
  const entities = useAllEntities();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle || !entities) return [];
    return entities
      .filter(
        (e) =>
          e.name.toLowerCase().includes(needle) ||
          e.summary.toLowerCase().includes(needle) ||
          e.tags.some((t) => t.toLowerCase().includes(needle)),
      )
      .slice(0, 8);
  }, [q, entities]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-300/40" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search your world…"
        className="input pl-9"
      />
      {open && results.length > 0 && (
        <div className="panel absolute z-30 mt-2 w-full overflow-hidden p-1">
          {results.map((e) => {
            const m = moduleFor(e.kind);
            return (
              <button
                key={e.id}
                onMouseDown={() => {
                  navigate(`/m/${m.slug}/${e.id}`);
                  setOpen(false);
                  setQ("");
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-ink-500/60"
              >
                <m.icon className="h-4 w-4 shrink-0" style={{ color: m.color }} />
                <span className="flex-1 truncate text-sm text-parchment-100">{e.name}</span>
                <span className="chip">{m.singular}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
