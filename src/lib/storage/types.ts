import type { Entity } from "../types";

/**
 * A pluggable backing store for entities. The app is written against this
 * interface so the data source can be swapped without touching the UI:
 *
 *   - LocalAdapter    -> IndexedDB (default; offline, no account)
 *   - VaultAdapter    -> a real folder via the File System Access API,
 *                        i.e. an Obsidian vault of markdown files
 *   - (future)        -> cloud sync, git-backed, etc.
 */
export interface StorageAdapter {
  readonly id: string;
  readonly label: string;
  /** Human description of where data lives, for the Settings screen. */
  readonly description: string;
  init(): Promise<void>;
  list(): Promise<Entity[]>;
  get(id: string): Promise<Entity | undefined>;
  put(entity: Entity): Promise<void>;
  remove(id: string): Promise<void>;
  /** True once the adapter is connected and usable. */
  isReady(): boolean;
}
