import { db } from "./db";
import type { Entity, EntityKind, NewEntity } from "./types";
import { makeId } from "./id";
import { moduleFor } from "@/config/modules";

/**
 * Entity mutations. The local IndexedDB store is the live, reactive source the
 * UI binds to (via dexie-react-hooks). The Obsidian vault is kept in step
 * through import/sync routines in ./sync, so the editing experience stays
 * instant and offline-safe.
 */

export async function createEntity(input: NewEntity): Promise<Entity> {
  const now = Date.now();
  const entity: Entity = {
    id: input.id ?? makeId(),
    kind: input.kind,
    name: input.name.trim() || "Untitled",
    summary: input.summary ?? "",
    tags: input.tags ?? [],
    body: input.body ?? "",
    category: input.category,
    fields: input.fields ?? {},
    links: input.links ?? [],
    marker: input.marker ?? null,
    image: input.image,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
  await db.entities.put(entity);
  return entity;
}

export async function updateEntity(
  id: string,
  patch: Partial<Omit<Entity, "id" | "createdAt">>,
): Promise<void> {
  await db.entities.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteEntity(id: string): Promise<void> {
  await db.entities.delete(id);
  await db.assets.delete(id);
}

export async function createBlankEntity(kind: EntityKind, category?: string): Promise<Entity> {
  const m = moduleFor(kind);
  return createEntity({
    kind,
    name: `New ${m.singular}`,
    summary: "",
    tags: [],
    body: "",
    category,
    fields: {},
    links: [],
    marker: null,
  });
}

/** Bulk upsert, used by vault import. Newer `updatedAt` wins on conflict by id. */
export async function upsertMany(entities: Entity[]): Promise<number> {
  let written = 0;
  await db.transaction("rw", db.entities, async () => {
    for (const incoming of entities) {
      const existing = await db.entities.get(incoming.id);
      if (!existing || incoming.updatedAt >= existing.updatedAt) {
        await db.entities.put(incoming);
        written++;
      }
    }
  });
  return written;
}
