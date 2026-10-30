import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Plus, Globe2, ArrowRight, BookMarked } from "lucide-react";
import { MODULES, moduleFor } from "@/config/modules";
import { useAllEntities, useEntityCounts } from "@/hooks/useEntities";
import { PageHeader, EmptyState } from "@/components/ui";
import { seedDemoWorld } from "@/lib/seed";
import { importEllieCanon } from "@/lib/canon/ellie";
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
              Import the world of <em>Ellie, the Last Dragon</em> from your Build Atlas, load a tiny
              generic example, or start from scratch.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button className="btn-ember" onClick={() => importEllieCanon()}>
                <BookMarked className="h-4 w-4" /> Import Pheocatira canon
              </button>
              <button className="btn-ghost" onClick={() => seedDemoWorld()}>
                <Sparkles className="h-4 w-4" /> Load example world
              </button>
              <button className="btn-ghost" onClick={quickCreate}>
                <Plus className="h-4 w-4" /> Create first entry
              </button>
            </div>
          </EmptyState>
        ) : (
          <div className="space-y-8">
            <Link
              to="/atlas"
              className="panel group flex items-center gap-4 overflow-hidden p-4 transition hover:border-ember/50"
              style={{ background: "linear-gradient(90deg, rgba(224,122,63,0.10), transparent)" }}
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-ember/15">
                <BookMarked className="h-6 w-6 text-ember" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg text-parchment-100">The Ellie Build Atlas</div>
                <div className="truncate text-sm text-parchment-300/70">
                  Your production bible for Pheocatira — open the full atlas inside the app.
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-parchment-300/40 transition group-hover:text-ember" />
            </Link>

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
