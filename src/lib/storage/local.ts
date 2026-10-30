import { db } from "../db";
import type { Entity } from "../types";
import type { StorageAdapter } from "./types";

/** Default adapter: everything in the browser's IndexedDB. */
export class LocalAdapter implements StorageAdapter {
  readonly id = "local";
  readonly label = "This device";
  readonly description =
    "Stored privately in your browser (IndexedDB). Nothing leaves your device.";

  async init(): Promise<void> {
    await db.open();
  }

  async list(): Promise<Entity[]> {
    return db.entities.orderBy("updatedAt").reverse().toArray();
  }

  get(id: string): Promise<Entity | undefined> {
    return db.entities.get(id);
  }

  async put(entity: Entity): Promise<void> {
    await db.entities.put(entity);
  }

  async remove(id: string): Promise<void> {
    await db.entities.delete(id);
  }

  isReady(): boolean {
    return db.isOpen();
  }
}
