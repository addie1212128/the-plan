import { db } from "./db";
import { vaultAdapter } from "./storage";
import { upsertMany } from "./data";
import { putImageBlob } from "./images";
import type { Entity, EntityImage } from "./types";

/**
 * Bridges the live local store and an Obsidian vault folder.
 *   import  : vault files  -> local store   (markdown + any referenced images)
 *   export  : local store  -> vault files   (markdown + portrait images)
 * Two-way "live" sync (file watching) is a future milestone; for now these are
 * explicit actions the user triggers from Settings.
 *
 * Portraits travel too: on export each portrait is written to `Images/<name>.<ext>`
 * in the vault and the note's `image:` frontmatter points at it; on import that
 * path is read back into the local assets store.
 */

const IMAGE_DIR = "Images";

function imageExt(asset: EntityImage): string {
  const fromName = asset.name.match(/\.([a-z0-9]+)$/i)?.[1];
  if (fromName) return fromName.toLowerCase();
  const fromType = asset.type.split("/")[1];
  return fromType || "png";
}

function vaultImagePath(entity: Entity, asset: EntityImage): string {
  const safe = entity.name.replace(/[\\/:*?"<>|]/g, "-").trim() || entity.id;
  return `${IMAGE_DIR}/${safe}.${imageExt(asset)}`;
}

export async function importFromVault(): Promise<number> {
  if (!vaultAdapter.isReady()) throw new Error("No vault connected.");
  const entities = await vaultAdapter.list();
  const n = await upsertMany(entities);
  // Pull in any portrait images the notes reference.
  for (const e of entities) {
    if (!e.image) continue;
    const blob = await vaultAdapter.readFileAt(e.image);
    if (blob && blob.type.startsWith("image/")) {
      try {
        await putImageBlob(e.id, blob, e.image.split("/").pop() || e.image);
      } catch {
        /* unreadable image — skip */
      }
    }
  }
  return n;
}

export async function exportToVault(): Promise<number> {
  if (!vaultAdapter.isReady()) throw new Error("No vault connected.");
  const all = await db.entities.toArray();
  for (const entity of all) {
    const asset = await db.assets.get(entity.id);
    if (asset) {
      const path = vaultImagePath(entity, asset);
      await vaultAdapter.writeFileAt(path, asset.blob);
      await vaultAdapter.put({ ...entity, image: path });
    } else {
      await vaultAdapter.put(entity);
    }
  }
  return all.length;
}
