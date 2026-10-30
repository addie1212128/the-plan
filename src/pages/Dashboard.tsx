import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Plus, Globe2, ArrowRight } from "lucide-react";
import { MODULES, moduleFor } from "@/config/modules";
import { useAllEntities, useEntityCounts } from "@/hooks/useEntities";
import { PageHeader, EmptyState } from "@/components/ui";
import { seedDemoWorld } from "@/lib/seed";
import { createBlankEntity } from "@/lib/data";

export function Dashboard() {
  const counts = useEntityCounts();
  const all = useAllEntities();
  const navigate = useNavigate();
  const total = all?.length ?? 0;

  async function quickCreate() {
    const e = await createBlankEntity("character");
    navigate(`/m/characters/${e.id}`);
  }

  return (
    <div>
      <PageHeader
        title="Your World"
        subtitle="Everything you've imagined, in one place."
        icon={<Sparkles className="h-5 w-5 text-ember" />}
        actions={
          <>
            <Link to="/world" className="btn-ghost">
              <Globe2 className="h-4 w-4" /> Open Map
            </Link>
            <button className="btn-primary" onClick={quickCreate}>
              <Plus className="h-4 w-4" /> New Entry
            </button>
          </>
        }
      />

      <div className="p-6">
        {all && total === 0 ? (
          <EmptyState icon={<Sparkles className="h-10 w-10" />} title="A blank map awaits">
            <p className="mb-4">
              Start from scratch, or load a small example world to see how everything fits together —
              characters, locations, lore, and pins on the 3D map.
            </p>
            <div className="flex justify-center gap-2">
              <button className="btn-ember" onClick={() => seedDemoWorld()}>
                <Sparkles className="h-4 w-4" /> Load example world
              </button>
              <button className="btn-ghost" onClick={quickCreate}>
                <Plus className="h-4 w-4" /> Create first entry
              </button>
            </div>
          </EmptyState>
        ) : (
          <div className="space-y-8">
            <section>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {MODULES.map((m) => (
                  <Link
                    key={m.kind}
                    to={`/m/${m.slug}`}
                    className="panel group flex items-center gap-3 p-4 transition hover:border-arcane/50"
                  >
                    <div
                      className="grid h-11 w-11 place-items-center rounded-lg"
                      style={{ backgroundColor: `${m.color}22` }}
                    >
                      <m.icon className="h-5 w-5" style={{ color: m.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm text-parchment-200">{m.label}</div>
                      <div className="text-2xl font-semibold tabular-nums text-parchment-100">
                        {counts?.[m.kind] ?? 0}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl text-parchment-100">Recently touched</h2>
              </div>
              <div className="panel divide-y divide-ink-600">
                {all?.slice(0, 8).map((e) => {
                  const m = moduleFor(e.kind);
                  return (
                    <Link
                      key={e.id}
                      to={`/m/${m.slug}/${e.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-ink-600/50"
                    >
                      <m.icon className="h-4 w-4 shrink-0" style={{ color: m.color }} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-parchment-100">{e.name}</div>
                        {e.summary && (
                          <div className="truncate text-xs text-parchment-300/60">{e.summary}</div>
                        )}
                      </div>
                      <span className="chip">{m.singular}</span>
                      <ArrowRight className="h-4 w-4 text-parchment-300/30" />
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
