import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Entity, EntityKind } from "@/lib/types";

/** Reactive list of every entity, newest first. */
export function useAllEntities(): Entity[] | undefined {
  return useLiveQuery(() => db.entities.orderBy("updatedAt").reverse().toArray(), []);
}

/** Reactive list filtered to one kind. */
export function useEntitiesByKind(kind: EntityKind): Entity[] | undefined {
  return useLiveQuery(
    () => db.entities.where("kind").equals(kind).reverse().sortBy("updatedAt"),
    [kind],
  );
}

/**
 * Reactive single entity.
 * Returns `undefined` while the query is loading, `null` when the id resolves
 * to no record, and the `Entity` when found — so callers can tell the two apart.
 */
export function useEntity(id: string | undefined): Entity | null | undefined {
  return useLiveQuery(async () => {
    if (!id) return null;
    return (await db.entities.get(id)) ?? null;
  }, [id]);
}

/** Reactive counts per kind for the dashboard. */
export function useEntityCounts(): Record<string, number> | undefined {
  return useLiveQuery(async () => {
    const all = await db.entities.toArray();
    const counts: Record<string, number> = {};
    for (const e of all) counts[e.kind] = (counts[e.kind] ?? 0) + 1;
    return counts;
  }, []);
}

/** Entities that have a marker for the given world mode. */
export function useMarkers(mode: string): Entity[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.entities.toArray();
    return all.filter((e) => e.marker && e.marker.mode === mode);
  }, [mode]);
}
