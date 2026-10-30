import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { Plus, MapPin } from "lucide-react";
import { moduleForSlug } from "@/config/modules";
import { useEntitiesByKind } from "@/hooks/useEntities";
import { useAssetMap } from "@/lib/images";
import { EntityImage } from "@/components/EntityImage";
import { PageHeader, EmptyState } from "@/components/ui";
import { createBlankEntity } from "@/lib/data";

export function EntityListPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const m = slug ? moduleForSlug(slug) : undefined;
  const entities = useEntitiesByKind(m?.kind ?? "lore");
  const assets = useAssetMap();

  if (!m) return <Navigate to="/" replace />;

  async function create() {
    const e = await createBlankEntity(m!.kind);
    navigate(`/m/${m!.slug}/${e.id}`);
  }

  return (
    <div>
      <PageHeader
        title={m.label}
        subtitle={`${entities?.length ?? 0} ${entities?.length === 1 ? "entry" : "entries"}`}
        icon={<m.icon className="h-5 w-5" style={{ color: m.color }} />}
        actions={
          <button className="btn-primary" onClick={create}>
            <Plus className="h-4 w-4" /> New {m.singular}
          </button>
        }
      />

      <div className="p-6">
        {entities && entities.length === 0 ? (
          <EmptyState icon={<m.icon className="h-10 w-10" />} title={`No ${m.label.toLowerCase()} yet`}>
            <p className="mb-4">Create your first {m.singular.toLowerCase()} to begin.</p>
            <button className="btn-ember" onClick={create}>
              <Plus className="h-4 w-4" /> New {m.singular}
            </button>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {entities?.map((e) => (
              <Link
                key={e.id}
                to={`/m/${m.slug}/${e.id}`}
                className="panel group flex flex-col gap-2 overflow-hidden p-4 transition hover:border-arcane/50"
              >
                {assets?.get(e.id) && (
                  <EntityImage
                    blob={assets.get(e.id)!.blob}
                    alt={e.name}
                    className="-mx-4 -mt-4 mb-1 h-32 w-[calc(100%+2rem)] max-w-none"
                  />
                )}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg leading-tight text-parchment-100">{e.name}</h3>
                  {e.marker && (
                    <MapPin
                      className="h-4 w-4 shrink-0 text-parchment-300/50"
                      aria-label="placed on the world map"
                    />
                  )}
                </div>
                {e.summary && (
                  <p className="line-clamp-3 text-sm text-parchment-300/70">{e.summary}</p>
                )}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
