import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarClock, Plus, MapPin, Users } from "lucide-react";
import { useEntitiesByKind } from "@/hooks/useEntities";
import { useAssetMap } from "@/lib/images";
import { EntityImage } from "@/components/EntityImage";
import { PageHeader, EmptyState } from "@/components/ui";
import { createBlankEntity } from "@/lib/data";
import type { Entity } from "@/lib/types";

/**
 * Chronological view of the Event module. Events are grouped by their `Era`
 * field and ordered by a year parsed from `Date`/`Era` (e.g. "Year 0" -> 0,
 * "1052 AE" -> 1052, "-300" -> -300). Anything without a parseable number sinks
 * to an "Undated" band at the end.
 */

function yearOf(e: Entity): number | null {
  const src = `${e.fields.Date ?? ""} ${e.fields.Era ?? ""}`;
  const m = src.match(/-?\d+/);
  return m ? parseInt(m[0], 10) : null;
}

export function TimelinePage() {
  const events = useEntitiesByKind("event");
  const assets = useAssetMap();
  const navigate = useNavigate();

  const groups = useMemo(() => {
    const byEra = new Map<string, Entity[]>();
    for (const e of events ?? []) {
      const era = (e.fields.Era ?? "").trim() || "Undated";
      (byEra.get(era) ?? byEra.set(era, []).get(era)!).push(e);
    }
    return [...byEra.entries()]
      .map(([era, evs]) => {
        const years = evs.map(yearOf).filter((y): y is number => y != null);
        const min = years.length ? Math.min(...years) : Infinity;
        evs.sort(
          (a, b) => (yearOf(a) ?? Infinity) - (yearOf(b) ?? Infinity) || a.name.localeCompare(b.name),
        );
        return { era, evs, min };
      })
      .sort((a, b) => a.min - b.min || a.era.localeCompare(b.era));
  }, [events]);

  async function create() {
    const e = await createBlankEntity("event");
    navigate(`/m/events/${e.id}`);
  }

  return (
    <div>
      <PageHeader
        title="Timeline"
        subtitle={`${events?.length ?? 0} ${events?.length === 1 ? "event" : "events"}`}
        icon={<CalendarClock className="h-5 w-5 text-ember-soft" />}
        actions={
          <button className="btn-primary" onClick={create}>
            <Plus className="h-4 w-4" /> New Event
          </button>
        }
      />

      <div className="p-6">
        {events && events.length === 0 ? (
          <EmptyState icon={<CalendarClock className="h-10 w-10" />} title="No events yet">
            <p className="mb-4">
              Add events with a <span className="chip">Date</span> or <span className="chip">Era</span>{" "}
              attribute and they'll line up here in order.
            </p>
            <button className="btn-ember" onClick={create}>
              <Plus className="h-4 w-4" /> New Event
            </button>
          </EmptyState>
        ) : (
          <div className="relative mx-auto max-w-3xl pl-2">
            <div className="absolute bottom-2 left-[9px] top-2 w-px bg-ink-500" />
            {groups.map((g) => (
              <div key={g.era} className="mb-6">
                <div className="relative mb-3 flex items-center gap-3">
                  <span className="z-10 h-4 w-4 rounded-full border-2 border-ember bg-ink-900" />
                  <h3 className="font-display text-xl text-ember-soft">{g.era}</h3>
                </div>
                <div className="space-y-3 pl-8">
                  {g.evs.map((e) => (
                    <EventCard key={e.id} event={e} blob={assets?.get(e.id)?.blob} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, blob }: { event: Entity; blob?: Blob }) {
  const date = event.fields.Date?.trim();
  const location = event.fields.Location?.trim();
  const participants = event.fields.Participants?.trim();
  return (
    <Link
      to={`/m/events/${event.id}`}
      className="panel group relative flex gap-3 p-3 transition hover:border-arcane/50"
    >
      {/* connector dot on the spine */}
      <span className="absolute -left-[26px] top-5 h-2.5 w-2.5 rounded-full bg-ink-400 ring-2 ring-ink-900 group-hover:bg-arcane" />
      {blob && <EntityImage blob={blob} alt={event.name} className="h-16 w-16 shrink-0 rounded-md" />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h4 className="font-display text-lg leading-tight text-parchment-100">{event.name}</h4>
          {date && <span className="chip">{date}</span>}
        </div>
        {event.summary && <p className="mt-1 text-sm text-parchment-300/70">{event.summary}</p>}
        {(location || participants) && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-parchment-300/60">
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {location}
              </span>
            )}
            {participants && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> {participants}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
