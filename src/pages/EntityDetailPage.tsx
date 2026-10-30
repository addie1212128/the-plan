import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { ChevronLeft, Trash2, Eye, Pencil, MapPin, Plus, X, ImagePlus, ImageUp } from "lucide-react";
import { moduleForSlug, moduleFor } from "@/config/modules";
import { useEntity } from "@/hooks/useEntities";
import { updateEntity, deleteEntity } from "@/lib/data";
import type { Entity } from "@/lib/types";
import { EntityImage } from "@/components/EntityImage";
import { useEntityImage, setEntityImage, removeEntityImage } from "@/lib/images";
import { Field } from "@/components/ui";

// react-markdown + remark-gfm only load when an entry is viewed in Read mode.
const LoreMarkdown = lazy(() =>
  import("@/components/LoreMarkdown").then((m) => ({ default: m.LoreMarkdown })),
);

export function EntityDetailPage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const m = slug ? moduleForSlug(slug) : undefined;
  const entity = useEntity(id);
  const [mode, setMode] = useState<"edit" | "read">("edit");

  if (!m) return <Navigate to="/" replace />;
  if (entity === undefined) {
    // still loading or not found; liveQuery returns undefined while loading
    return <div className="p-10 text-parchment-300/60">Loading…</div>;
  }
  if (entity === null) return <Navigate to={`/m/${m.slug}`} replace />;

  async function remove() {
    if (!entity) return;
    if (confirm(`Delete "${entity.name}"? This can't be undone.`)) {
      await deleteEntity(entity.id);
      navigate(`/m/${m!.slug}`);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-ink-600 px-6 py-3">
        <Link to={`/m/${m.slug}`} className="btn-ghost -ml-2">
          <ChevronLeft className="h-4 w-4" /> {m.label}
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-lg border border-ink-500 p-0.5">
            <button
              className={`rounded-md px-3 py-1.5 text-sm ${mode === "edit" ? "bg-ink-500 text-parchment-100" : "text-parchment-300/70"}`}
              onClick={() => setMode("edit")}
            >
              <Pencil className="mr-1 inline h-3.5 w-3.5" /> Edit
            </button>
            <button
              className={`rounded-md px-3 py-1.5 text-sm ${mode === "read" ? "bg-ink-500 text-parchment-100" : "text-parchment-300/70"}`}
              onClick={() => setMode("read")}
            >
              <Eye className="mr-1 inline h-3.5 w-3.5" /> Read
            </button>
          </div>
          <button className="btn-ghost text-ember-soft hover:bg-ember/10" onClick={remove}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1fr_320px]">
        <Editor entity={entity} mode={mode} />
        <SidePanel entity={entity} />
      </div>
    </div>
  );
}

/** Debounced write-through to the local store. */
function useFieldSaver(id: string) {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  return useMemo(
    () => (patch: Partial<Entity>, key = "default", delay = 350) => {
      clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(() => updateEntity(id, patch), delay);
    },
    [id],
  );
}

function Editor({ entity, mode }: { entity: Entity; mode: "edit" | "read" }) {
  const save = useFieldSaver(entity.id);
  const [name, setName] = useState(entity.name);
  const [body, setBody] = useState(entity.body);

  useEffect(() => {
    setName(entity.name);
    setBody(entity.body);
    // Re-sync only when switching to a different entity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.id]);

  const m = moduleFor(entity.kind);

  return (
    <div className="min-w-0">
      <div className="mb-4 flex items-center gap-2 text-sm text-parchment-300/60">
        <m.icon className="h-4 w-4" style={{ color: m.color }} />
        {m.singular}
      </div>
      {mode === "edit" ? (
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            save({ name: e.target.value }, "name");
          }}
          className="w-full bg-transparent font-display text-3xl text-parchment-100 outline-none placeholder:text-parchment-300/30"
          placeholder="Name…"
        />
      ) : (
        <h1 className="font-display text-3xl text-parchment-100">{entity.name}</h1>
      )}

      <div className="mt-6">
        {mode === "edit" ? (
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              save({ body: e.target.value }, "body");
            }}
            spellCheck
            placeholder="Write freely. Use [[Entry Name]] to link to other entries, and standard markdown for headings, lists, and emphasis."
            className="input min-h-[50vh] resize-y font-mono text-[13px] leading-relaxed"
          />
        ) : (
          <Suspense fallback={<p className="text-parchment-300/40">Rendering…</p>}>
            <LoreMarkdown body={entity.body} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function SidePanel({ entity }: { entity: Entity }) {
  const save = useFieldSaver(entity.id);
  const m = moduleFor(entity.kind);
  const [summary, setSummary] = useState(entity.summary);
  useEffect(() => setSummary(entity.summary), [entity.id, entity.summary]);

  return (
    <div className="space-y-5 lg:border-l lg:border-ink-600 lg:pl-6">
      <PortraitPanel entity={entity} />

      <Field label="Summary">
        <textarea
          value={summary}
          onChange={(e) => {
            setSummary(e.target.value);
            save({ summary: e.target.value }, "summary");
          }}
          rows={3}
          placeholder="One line that captures this entry."
          className="input resize-none"
        />
      </Field>

      <Field label="Tags">
        <TagInput
          tags={entity.tags}
          onChange={(tags) => updateEntity(entity.id, { tags })}
        />
      </Field>

      <FieldsEditor entity={entity} suggested={m.suggestedFields} />

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-parchment-300/60">
          World map
        </div>
        {entity.marker ? (
          <div className="panel flex items-center justify-between p-3 text-sm">
            <span className="flex items-center gap-2 text-parchment-200">
              <MapPin className="h-4 w-4 text-verdant" />
              Placed · {entity.marker.mode}
            </span>
            <button
              className="text-xs text-parchment-300/60 hover:text-ember-soft"
              onClick={() => updateEntity(entity.id, { marker: null })}
            >
              remove
            </button>
          </div>
        ) : (
          <p className="text-sm text-parchment-300/50">
            Not placed. Open the <Link to="/world" className="text-arcane-soft underline">World Map</Link> to pin it.
          </p>
        )}
      </div>
    </div>
  );
}

function PortraitPanel({ entity }: { entity: Entity }) {
  const img = useEntityImage(entity.id);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) {
      try {
        await setEntityImage(entity.id, f);
      } catch {
        /* non-image / unreadable */
      }
    }
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      {img ? (
        <div className="group relative overflow-hidden rounded-xl border border-ink-500">
          <EntityImage blob={img.blob} alt={entity.name} className="h-48 w-full" />
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-ink-900/95 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
            <button
              className="btn-ghost flex-1 bg-ink-800/80 text-xs"
              onClick={() => fileRef.current?.click()}
            >
              <ImageUp className="h-3.5 w-3.5" /> Replace
            </button>
            <button
              className="btn-ghost bg-ink-800/80 text-xs text-ember-soft hover:bg-ember/20"
              onClick={() => removeEntityImage(entity.id)}
              title="Remove image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-500 text-sm text-parchment-300/60 transition hover:border-arcane/50 hover:text-parchment-200"
        >
          <ImagePlus className="h-6 w-6" /> Add a portrait
        </button>
      )}
    </div>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim().toLowerCase();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  }
  return (
    <div className="rounded-lg border border-ink-500 bg-ink-800 p-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="chip gap-1">
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} className="hover:text-ember-soft">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !input && tags.length) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={tags.length ? "" : "add tags…"}
          className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-parchment-300/40"
        />
      </div>
    </div>
  );
}

function FieldsEditor({ entity, suggested }: { entity: Entity; suggested: string[] }) {
  const keys = Object.keys(entity.fields);
  const missing = suggested.filter((s) => !(s in entity.fields));

  function setField(key: string, value: string) {
    updateEntity(entity.id, { fields: { ...entity.fields, [key]: value } });
  }
  function removeField(key: string) {
    const next = { ...entity.fields };
    delete next[key];
    updateEntity(entity.id, { fields: next });
  }

  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-parchment-300/60">Attributes</div>
      <div className="space-y-2">
        {keys.map((k) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-xs text-parchment-300/70">{k}</span>
            <input
              defaultValue={entity.fields[k]}
              onBlur={(e) => setField(k, e.target.value)}
              className="input py-1.5 text-sm"
            />
            <button onClick={() => removeField(k)} className="text-parchment-300/40 hover:text-ember-soft">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      {missing.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {missing.map((s) => (
            <button key={s} onClick={() => setField(s, "")} className="chip gap-1 hover:border-arcane/60">
              <Plus className="h-3 w-3" /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
