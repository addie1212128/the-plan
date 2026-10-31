import { useMemo } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { Plus, MapPin } from "lucide-react";
import { moduleForSlug, type ModuleDef } from "@/config/modules";
import { useEntitiesByKind } from "@/hooks/useEntities";
import { useAssetMap } from "@/lib/images";
import { EntityImage } from "@/components/EntityImage";
import { PageHeader, EmptyState } from "@/components/ui";
import { createBlankEntity } from "@/lib/data";
import type { Entity } from "@/lib/types";

const UNCATEGORIZED = "Uncategorized";

export function EntityListPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const m = slug ? moduleForSlug(slug) : undefined;
  const entities = useEntitiesByKind(m?.kind ?? "lore");
  const assets = useAssetMap();

  // Group entries by sub-category; "Uncategorized" always sorts last.
  const groups = useMemo(() => {
    const byCat = new Map<string, Entity[]>();
    for (const e of entities ?? []) {
      const cat = (e.category ?? "").trim() || UNCATEGORIZED;
      (byCat.get(cat) ?? byCat.set(cat, []).get(cat)!).push(e);
    }
    return [...byCat.entries()].sort((a, b) => {
      if (a[0] === UNCATEGORIZED) return 1;
      if (b[0] === UNCATEGORIZED) return -1;
      return a[0].localeCompare(b[0]);
    });
  }, [entities]);

  if (!m) return <Navigate to="/" replace />;

  async function create(category?: string) {
    const e = await createBlankEntity(m!.kind, category);
    navigate(`/m/${m!.slug}/${e.id}`);
  }

  // Only show group headers once the user has actually used sub-categories.
  const showGroups = groups.length > 1 || (groups.length === 1 && groups[0][0] !== UNCATEGORIZED);

  return (
    <div>
      <PageHeader
        title={m.label}
        subtitle={`${entities?.length ?? 0} ${entities?.length === 1 ? "entry" : "entries"}`}
        icon={<m.icon className="h-5 w-5" style={{ color: m.color }} />}
        actions={
          <button className="btn-primary" onClick={() => create()}>
            <Plus className="h-4 w-4" /> New {m.singular}
          </button>
        }
      />

      <div className="space-y-8 p-6">
        {entities && entities.length === 0 ? (
          <EmptyState icon={<m.icon className="h-10 w-10" />} title={`No ${m.label.toLowerCase()} yet`}>
            <p className="mb-4">
              Create your first {m.singular.toLowerCase()} to begin. Give entries a{" "}
              <span className="chip">Category</span> to group them here.
            </p>
            <button className="btn-ember" onClick={() => create()}>
              <Plus className="h-4 w-4" /> New {m.singular}
            </button>
          </EmptyState>
        ) : (
          groups.map(([cat, evs]) => (
            <section key={cat}>
              {showGroups && (
                <div className="mb-3 flex items-center gap-3 border-b border-ink-600 pb-1.5">
                  <h2 className="font-display text-lg text-parchment-200">{cat}</h2>
                  <span className="chip">{evs.length}</span>
                  <button
                    onClick={() => create(cat === UNCATEGORIZED ? undefined : cat)}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-parchment-300/60 hover:text-arcane-soft"
                  >
                    <Plus className="h-3 w-3" /> New here
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {evs.map((e) => (
                  <Card key={e.id} e={e} m={m} blob={assets?.get(e.id)?.blob} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function Card({ e, m, blob }: { e: Entity; m: ModuleDef; blob?: Blob }) {
  return (
    <Link
      to={`/m/${m.slug}/${e.id}`}
      className="panel group flex flex-col gap-2 overflow-hidden p-4 transition hover:border-arcane/50"
    >
      {blob && (
        <EntityImage
          blob={blob}
          alt={e.name}
          className="-mx-4 -mt-4 mb-1 h-32 w-[calc(100%+2rem)] max-w-none"
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg leading-tight text-parchment-100">{e.name}</h3>
        {e.marker && (
          <MapPin className="h-4 w-4 shrink-0 text-parchment-300/50" aria-label="placed on the world map" />
        )}
      </div>
      {e.summary && <p className="line-clamp-3 text-sm text-parchment-300/70">{e.summary}</p>}
      {e.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          {e.tags.slice(0, 4).map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
