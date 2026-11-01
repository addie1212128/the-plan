import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  LayoutDashboard,
  Globe2,
  Waypoints,
  BookMarked,
  CalendarClock,
  Settings as SettingsIcon,
  CornerDownLeft,
} from "lucide-react";
import { useUI } from "@/lib/store";
import { useAllEntities } from "@/hooks/useEntities";
import { MODULES, moduleFor, modulePath } from "@/config/modules";
import { createBlankEntity } from "@/lib/data";

interface CmdItem {
  id: string;
  label: string;
  hint: string;
  icon: ReactNode;
  run: () => void;
  keywords?: string;
}

const PAGES: { label: string; to: string; icon: ReactNode }[] = [
  { label: "Dashboard", to: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "World Map", to: "/world", icon: <Globe2 className="h-4 w-4" /> },
  { label: "Relationships", to: "/graph", icon: <Waypoints className="h-4 w-4" /> },
  { label: "Build Atlas", to: "/atlas", icon: <BookMarked className="h-4 w-4 text-ember" /> },
  { label: "Timeline", to: "/timeline", icon: <CalendarClock className="h-4 w-4" /> },
  { label: "Settings", to: "/settings", icon: <SettingsIcon className="h-4 w-4" /> },
];

function score(hay: string, q: string): number {
  const h = hay.toLowerCase();
  if (h === q) return 5;
  if (h.startsWith(q)) return 4;
  if (h.split(/\s+/).some((w) => w.startsWith(q))) return 3;
  if (h.includes(q)) return 2;
  return 0;
}

export function CommandPalette() {
  const open = useUI((s) => s.paletteOpen);
  const setOpen = useUI((s) => s.setPaletteOpen);
  const entities = useAllEntities();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const selRef = useRef<HTMLButtonElement>(null);

  // Global ⌘K / Ctrl-K toggle.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUI.getState().paletteOpen);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const items: CmdItem[] = useMemo(() => {
    const nav = (to: string) => () => navigate(to);
    const query = q.trim().toLowerCase();

    const pages: CmdItem[] = PAGES.map((p) => ({
      id: `page:${p.to}`,
      label: p.label,
      hint: "Page",
      icon: p.icon,
      run: () => go(nav(p.to)),
    }));

    if (!query) {
      // Default view: pages + a few recent entries.
      const recent: CmdItem[] = (entities ?? []).slice(0, 6).map((e) => {
        const m = moduleFor(e.kind);
        return {
          id: `ent:${e.id}`,
          label: e.name,
          hint: m.singular,
          icon: <m.icon className="h-4 w-4" style={{ color: m.color }} />,
          run: () => go(nav(`/m/${m.slug}/${e.id}`)),
        };
      });
      return [...pages, ...recent];
    }

    const scored: (CmdItem & { s: number })[] = [];
    const push = (it: CmdItem, s: number) => s > 0 && scored.push({ ...it, s });

    for (const p of pages) push(p, score(p.label, query));

    for (const m of MODULES) {
      push(
        {
          id: `mod:${m.slug}`,
          label: m.label,
          hint: "Category",
          icon: <m.icon className="h-4 w-4" style={{ color: m.color }} />,
          run: () => go(nav(modulePath(m))),
        },
        Math.max(score(m.label, query), score(m.singular, query) * 0.9),
      );
      push(
        {
          id: `new:${m.slug}`,
          label: `New ${m.singular}`,
          hint: "Create",
          icon: <Plus className="h-4 w-4 text-verdant" />,
          run: () =>
            go(async () => {
              const e = await createBlankEntity(m.kind);
              navigate(`/m/${m.slug}/${e.id}`);
            }),
        },
        score(`new ${m.singular}`, query) || score(m.label, query) * 0.5,
      );
    }

    for (const e of entities ?? []) {
      const m = moduleFor(e.kind);
      const s = Math.max(
        score(e.name, query),
        score(e.summary, query) * 0.5,
        score(e.tags.join(" "), query) * 0.5,
        e.category ? score(e.category, query) * 0.5 : 0,
      );
      push(
        {
          id: `ent:${e.id}`,
          label: e.name,
          hint: m.singular,
          icon: <m.icon className="h-4 w-4" style={{ color: m.color }} />,
          run: () => go(nav(`/m/${m.slug}/${e.id}`)),
        },
        s,
      );
    }

    return scored
      .sort((a, b) => b.s - a.s || a.label.localeCompare(b.label))
      .slice(0, 40)
      .map(({ s: _s, ...it }) => it);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, entities, navigate]);

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    selRef.current?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  if (!open) return null;

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[sel]?.run();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/70 p-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={() => setOpen(false)}
    >
      <div
        className="panel w-full max-w-xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-ink-600 px-4">
          <Search className="h-4 w-4 shrink-0 text-parchment-300/40" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to anything, or type to search…"
            className="w-full bg-transparent py-3.5 text-sm text-parchment-100 outline-none placeholder:text-parchment-300/40"
          />
          <kbd className="kbd shrink-0">esc</kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-parchment-300/50">
              No matches for “{q}”.
            </div>
          ) : (
            items.map((it, i) => (
              <button
                key={it.id}
                ref={i === sel ? selRef : undefined}
                onMouseEnter={() => setSel(i)}
                onClick={() => it.run()}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                  i === sel ? "bg-ink-500/70 text-parchment-100" : "text-parchment-200 hover:bg-ink-600/50"
                }`}
              >
                <span className="shrink-0">{it.icon}</span>
                <span className="flex-1 truncate">{it.label}</span>
                <span className="chip shrink-0">{it.hint}</span>
                {i === sel && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-parchment-300/40" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
