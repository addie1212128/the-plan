import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Map, Mountain, Globe2, MapPin, Plus, X, ExternalLink, ImageUp, Image as ImageIcon, Trash2 } from "lucide-react";
import type { Entity, WorldMode } from "@/lib/types";
import { useUI } from "@/lib/store";
import { useAllEntities, useMarkers } from "@/hooks/useEntities";
import { updateEntity } from "@/lib/data";
import { moduleFor } from "@/config/modules";
import { WorldScene } from "@/world/WorldScene";
import { useAtlasMap, setAtlasMap, clearAtlasMap } from "@/lib/atlasMap";

const MODE_META: { mode: WorldMode; label: string; icon: typeof Map; hint: string }[] = [
  { mode: "atlas", label: "Atlas", icon: Map, hint: "A flat map plane — drag to pan, scroll to zoom, right-drag to tilt." },
  { mode: "diorama", label: "Diorama", icon: Mountain, hint: "A low-poly 3D landscape you can orbit around." },
  { mode: "globe", label: "Globe", icon: Globe2, hint: "A whole planet — spin it and zoom into regions." },
];

export function WorldPage() {
  const mode = useUI((s) => s.worldMode);
  const setMode = useUI((s) => s.setWorldMode);
  const markers = useMarkers(mode) ?? [];
  const allEntities = useAllEntities() ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [placingId, setPlacingId] = useState<string | null>(null);

  const selected = markers.find((m) => m.id === selectedId) ?? null;
  const unplaced = allEntities.filter((e) => e.marker?.mode !== mode);
  const meta = MODE_META.find((m) => m.mode === mode)!;

  // User map image for the Atlas mode (local, per-device).
  const atlasMap = useAtlasMap();
  const mapUrl = useMemo(
    () => (atlasMap?.blob ? URL.createObjectURL(atlasMap.blob) : null),
    [atlasMap?.blob],
  );
  useEffect(() => {
    return () => {
      if (mapUrl) URL.revokeObjectURL(mapUrl);
    };
  }, [mapUrl]);
  const mapAspect = atlasMap ? atlasMap.width / atlasMap.height : undefined;
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickMap(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) {
      try {
        await setAtlasMap(f);
      } catch {
        /* non-image / unreadable; ignore */
      }
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPlacingId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function place(coords: { x: number; y: number; z: number }) {
    if (!placingId) return;
    await updateEntity(placingId, { marker: { mode, ...coords } });
    setSelectedId(placingId);
    setPlacingId(null);
  }

  return (
    <div className="relative h-full w-full">
      <WorldScene
        mode={mode}
        markers={markers}
        selectedId={selectedId}
        placing={placingId !== null}
        onSelect={setSelectedId}
        onPlace={place}
        mapUrl={mode === "atlas" ? mapUrl : null}
        mapAspect={mapAspect}
      />

      {/* Mode switcher */}
      <div className="pointer-events-auto absolute left-4 top-4 flex gap-1 rounded-xl border border-ink-500/70 bg-ink-800/80 p-1 backdrop-blur">
        {MODE_META.map((m) => (
          <button
            key={m.mode}
            onClick={() => {
              setMode(m.mode);
              setSelectedId(null);
            }}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              mode === m.mode ? "bg-arcane text-white" : "text-parchment-300/80 hover:bg-ink-600/60"
            }`}
          >
            <m.icon className="h-4 w-4" /> {m.label}
          </button>
        ))}
      </div>

      {/* Hint / placement banner */}
      <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 text-center">
        {placingId ? (
          <div className="pointer-events-auto rounded-full border border-ember/60 bg-ink-800/90 px-4 py-2 text-sm text-ember-soft shadow-glow">
            Click the {mode === "globe" ? "globe" : "ground"} to place
            <span className="font-medium"> {allEntities.find((e) => e.id === placingId)?.name}</span> · Esc to cancel
          </div>
        ) : (
          <div className="rounded-full bg-ink-800/60 px-4 py-1.5 text-xs text-parchment-300/60 backdrop-blur">
            {meta.hint}
          </div>
        )}
      </div>

      {/* Pins + placement panel */}
      <div className="absolute right-4 top-4 flex w-72 flex-col gap-3">
        <PlacePicker unplaced={unplaced} placingId={placingId} onPick={setPlacingId} />
        <div className="panel max-h-[40vh] overflow-y-auto p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-parchment-300/60">
            <MapPin className="h-3.5 w-3.5" /> Placed here · {markers.length}
          </div>
          {markers.length === 0 ? (
            <p className="text-sm text-parchment-300/50">Nothing pinned on the {meta.label.toLowerCase()} yet.</p>
          ) : (
            <div className="space-y-1">
              {markers.map((e) => {
                const m = moduleFor(e.kind);
                return (
                  <button
                    key={e.id}
                    onClick={() => setSelectedId(e.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
                      selectedId === e.id ? "bg-ink-500/70" : "hover:bg-ink-600/50"
                    }`}
                  >
                    <m.icon className="h-4 w-4 shrink-0" style={{ color: m.color }} />
                    <span className="flex-1 truncate text-parchment-100">{e.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected entity card */}
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
          <div className="mt-3 flex items-center gap-2">
            <Link to={`/m/${moduleFor(selected.kind).slug}/${selected.id}`} className="btn-ghost text-sm">
              <ExternalLink className="h-3.5 w-3.5" /> Open entry
            </Link>
            <button
              className="btn-ghost text-sm text-ember-soft hover:bg-ember/10"
              onClick={() => {
                updateEntity(selected.id, { marker: null });
                setSelectedId(null);
              }}
            >
              Remove pin
            </button>
          </div>
        </div>
      )}

      {/* Map image control (Atlas mode) */}
      {mode === "atlas" && (
        <div className="panel absolute bottom-4 right-4 w-64 p-3">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickMap} />
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-parchment-300/60">
            <ImageIcon className="h-3.5 w-3.5" /> Map image
          </div>
          {atlasMap ? (
            <div className="space-y-2">
              <div className="truncate text-sm text-parchment-200">{atlasMap.name}</div>
              <div className="flex gap-2">
                <button className="btn-ghost flex-1 text-sm" onClick={() => fileRef.current?.click()}>
                  <ImageUp className="h-3.5 w-3.5" /> Replace
                </button>
                <button
                  className="btn-ghost text-sm text-ember-soft hover:bg-ember/10"
                  onClick={() => clearAtlasMap()}
                  title="Remove map"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <button className="btn-primary w-full text-sm" onClick={() => fileRef.current?.click()}>
                <ImageUp className="h-4 w-4" /> Upload a map image
              </button>
              <p className="mt-2 text-[11px] leading-snug text-parchment-300/50">
                Drape your own map over the Atlas. Pins keep their spots. Stored on this device.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PlacePicker({
  unplaced,
  placingId,
  onPick,
}: {
  unplaced: Entity[];
  placingId: string | null;
  onPick: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel p-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-sm text-parchment-200"
      >
        <Plus className="h-4 w-4 text-verdant" /> Place an entry on the map
      </button>
      {placingId && (
        <button onClick={() => onPick(null)} className="mt-2 text-xs text-ember-soft">
          Cancel placement
        </button>
      )}
      {open && (
        <div className="mt-2 max-h-56 space-y-1 overflow-y-auto border-t border-ink-600 pt-2">
          {unplaced.length === 0 ? (
            <p className="text-xs text-parchment-300/50">Everything is already placed here.</p>
          ) : (
            unplaced.map((e) => {
              const m = moduleFor(e.kind);
              return (
                <button
                  key={e.id}
                  onClick={() => {
                    onPick(e.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-ink-600/50"
                >
                  <m.icon className="h-4 w-4 shrink-0" style={{ color: m.color }} />
                  <span className="flex-1 truncate text-parchment-100">{e.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
