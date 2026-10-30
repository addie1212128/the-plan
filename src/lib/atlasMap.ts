import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";

/**
 * The user's own map image for the Atlas world mode. Stored locally in the
 * IndexedDB `meta` table (per-device, offline) as a Blob plus its pixel
 * dimensions, so the 3D plane can be sized to the image's aspect ratio.
 */
export interface AtlasMap {
  blob: Blob;
  width: number;
  height: number;
  name: string;
}

const KEY = "atlas:map";

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

export async function setAtlasMap(file: File): Promise<void> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  const { width, height } = await readDimensions(file);
  const map: AtlasMap = { blob: file, width, height, name: file.name };
  await db.meta.put({ key: KEY, value: map });
}

export async function clearAtlasMap(): Promise<void> {
  await db.meta.delete(KEY);
}

/** Reactive accessor for the stored map image (or undefined). */
export function useAtlasMap(): AtlasMap | undefined {
  return useLiveQuery(async () => {
    const row = await db.meta.get(KEY);
    return (row?.value as AtlasMap) ?? undefined;
  }, []);
}
