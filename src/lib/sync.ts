import { db } from "./db";
import { vaultAdapter } from "./storage";
import { upsertMany } from "./data";

/**
 * Bridges the live local store and an Obsidian vault folder.
 *   import  : vault files  -> local store
 *   export  : local store  -> vault files
 * Two-way "live" sync (file watching) is a future milestone; for now these are
 * explicit actions the user triggers from Settings.
 */

export async function importFromVault(): Promise<number> {
  if (!vaultAdapter.isReady()) throw new Error("No vault connected.");
  const entities = await vaultAdapter.list();
  return upsertMany(entities);
}

export async function exportToVault(): Promise<number> {
  if (!vaultAdapter.isReady()) throw new Error("No vault connected.");
  const all = await db.entities.toArray();
  for (const entity of all) await vaultAdapter.put(entity);
  return all.length;
}
