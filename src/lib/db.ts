import Dexie, { type EntityTable } from "dexie";
import type { Entity } from "./types";

/**
 * Local-first store. IndexedDB via Dexie is the default data source, so the app
 * works fully offline with no account and no server. The Obsidian vault adapter
 * mirrors the same shape on top of real files (see ./storage).
 */
export class LoremDB extends Dexie {
  entities!: EntityTable<Entity, "id">;
  meta!: EntityTable<{ key: string; value: unknown }, "key">;

  constructor() {
    super("loremkeeper");
    this.version(1).stores({
      // Indexed fields; `fields`, `body`, `marker` etc. are stored but not indexed.
      entities: "id, kind, name, updatedAt, *tags",
      meta: "key",
    });
  }
}

export const db = new LoremDB();
