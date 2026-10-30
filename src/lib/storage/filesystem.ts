import { db } from "../db";
import type { Entity, EntityKind } from "../types";
import type { StorageAdapter } from "./types";
import { entityToFile, fileToEntity, vaultPathFor } from "../frontmatter";
import { MODULES } from "@/config/modules";
import { makeId } from "../id";

/**
 * Obsidian vault adapter — backs entities with real markdown files in a folder
 * the user grants access to via the File System Access API. Each top-level
 * folder maps to an entity kind (Characters/, Locations/, …); files outside a
 * known folder are imported as generic "lore" notes.
 *
 * Browser support: Chromium (Chrome/Edge/Brave/Arc). Firefox/Safari lack the
 * API, so the UI falls back to "This device" there. See isSupported().
 */

const folderToKind = new Map<string, EntityKind>(
  MODULES.map((m) => [m.folder.toLowerCase(), m.kind]),
);

const HANDLE_KEY = "vault:dirHandle";

export function isVaultSupported(): boolean {
  return typeof (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker === "function";
}

export class VaultAdapter implements StorageAdapter {
  readonly id = "vault";
  readonly label = "Obsidian vault";
  readonly description =
    "Reads and writes markdown files directly in a folder you choose — point it at an Obsidian vault.";

  private dir: FileSystemDirectoryHandle | null = null;

  async init(): Promise<void> {
    // Try to restore a previously granted directory handle.
    const row = await db.meta.get(HANDLE_KEY);
    const handle = row?.value as FileSystemDirectoryHandle | undefined;
    if (handle && (await verifyPermission(handle))) {
      this.dir = handle;
    }
  }

  isReady(): boolean {
    return this.dir !== null;
  }

  /** Prompt the user to pick a folder, then remember it. */
  async connect(): Promise<void> {
    const picker = (window as unknown as {
      showDirectoryPicker: (o?: unknown) => Promise<FileSystemDirectoryHandle>;
    }).showDirectoryPicker;
    const handle = await picker({ mode: "readwrite" });
    if (!(await verifyPermission(handle))) {
      throw new Error("Permission to the folder was not granted.");
    }
    this.dir = handle;
    await db.meta.put({ key: HANDLE_KEY, value: handle });
  }

  async disconnect(): Promise<void> {
    this.dir = null;
    await db.meta.delete(HANDLE_KEY);
  }

  get folderName(): string | null {
    return this.dir?.name ?? null;
  }

  async list(): Promise<Entity[]> {
    if (!this.dir) return [];
    const out: Entity[] = [];
    await walk(this.dir, [], out);
    return out.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<Entity | undefined> {
    return (await this.list()).find((e) => e.id === id);
  }

  async put(entity: Entity): Promise<void> {
    if (!this.dir) throw new Error("No vault connected.");
    const path = vaultPathFor(entity).split("/");
    const fileName = path.pop()!;
    let dir = this.dir;
    for (const seg of path) {
      dir = await dir.getDirectoryHandle(seg, { create: true });
    }
    const fileHandle = await dir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(entityToFile(entity));
    await writable.close();
  }

  async remove(id: string): Promise<void> {
    if (!this.dir) return;
    const entity = await this.get(id);
    if (!entity) return;
    const path = vaultPathFor(entity).split("/");
    const fileName = path.pop()!;
    let dir = this.dir;
    for (const seg of path) dir = await dir.getDirectoryHandle(seg);
    await dir.removeEntry(fileName);
  }
}

async function verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const h = handle as unknown as {
    queryPermission?: (o: { mode: string }) => Promise<PermissionState>;
    requestPermission?: (o: { mode: string }) => Promise<PermissionState>;
  };
  const opts = { mode: "readwrite" };
  if ((await h.queryPermission?.(opts)) === "granted") return true;
  if ((await h.requestPermission?.(opts)) === "granted") return true;
  return false;
}

async function walk(
  dir: FileSystemDirectoryHandle,
  trail: string[],
  out: Entity[],
): Promise<void> {
  // entries() exists at runtime on every browser that supports the API; cast
  // so we don't depend on whether the installed lib.dom types declare it.
  const entries = (
    dir as unknown as { entries(): AsyncIterable<[string, FileSystemHandle]> }
  ).entries();
  for await (const [name, handle] of entries) {
    if (handle.kind === "directory") {
      if (name.startsWith(".")) continue; // skip .obsidian etc.
      await walk(handle as FileSystemDirectoryHandle, [...trail, name], out);
    } else if (name.toLowerCase().endsWith(".md")) {
      const file = await (handle as FileSystemFileHandle).getFile();
      const raw = await file.text();
      const topFolder = trail[0]?.toLowerCase() ?? "";
      const kind = folderToKind.get(topFolder) ?? "lore";
      out.push(
        fileToEntity(raw, {
          kind,
          fallbackName: name.replace(/\.md$/i, ""),
          id: makeId(),
        }),
      );
    }
  }
}
