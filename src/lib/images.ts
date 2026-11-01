import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import { updateEntity } from "./data";
import type { EntityImage } from "./types";

/**
 * Portrait / cover images for entities. One image per entity, stored locally as
 * a Blob in the `assets` table (keyed by entity id). The entity keeps the
 * original filename in its `image` field for alt text / future vault export.
 */

function readDimensions(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

/** Store an image blob for an entity (reads its dimensions). Does not touch the
 *  entity record — used by vault import, which already set `image` from frontmatter. */
export async function putImageBlob(entityId: string, blob: Blob, name: string): Promise<void> {
  const { width, height } = await readDimensions(blob);
  await db.assets.put({ entityId, blob, name, width, height, type: blob.type || "image/png" });
}

export async function setEntityImage(entityId: string, file: File): Promise<void> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  await putImageBlob(entityId, file, file.name);
  await updateEntity(entityId, { image: file.name });
}

export async function removeEntityImage(entityId: string): Promise<void> {
  await db.assets.delete(entityId);
  await updateEntity(entityId, { image: "" });
}

/** Reactive single portrait. */
export function useEntityImage(entityId: string | undefined): EntityImage | undefined {
  return useLiveQuery(
    () => (entityId ? db.assets.get(entityId) : undefined),
    [entityId],
  );
}

/** Reactive map of every entity id -> its portrait, for lists/boards. */
export function useAssetMap(): Map<string, EntityImage> | undefined {
  return useLiveQuery(async () => {
    const all = await db.assets.toArray();
    return new Map(all.map((a) => [a.entityId, a]));
  }, []);
}

/* ---- Backup / restore (images travel as base64 so backups stay whole) ---- */

interface SerializedAsset {
  entityId: string;
  name: string;
  width: number;
  height: number;
  type: string;
  data: string; // data: URL
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(blob);
  });
}

export async function exportAssets(): Promise<SerializedAsset[]> {
  const all = await db.assets.toArray();
  return Promise.all(
    all.map(async (a) => ({
      entityId: a.entityId,
      name: a.name,
      width: a.width,
      height: a.height,
      type: a.type,
      data: await blobToDataUrl(a.blob),
    })),
  );
}

export async function importAssets(items: unknown): Promise<void> {
  if (!Array.isArray(items)) return;
  for (const a of items as SerializedAsset[]) {
    if (!a?.entityId || !a?.data) continue;
    const blob = await (await fetch(a.data)).blob();
    await db.assets.put({
      entityId: a.entityId,
      blob,
      name: a.name ?? "",
      width: a.width ?? 0,
      height: a.height ?? 0,
      type: a.type ?? blob.type,
    });
  }
}
