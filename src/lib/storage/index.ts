import { LocalAdapter } from "./local";
import { VaultAdapter, isVaultSupported } from "./filesystem";
import type { StorageAdapter } from "./types";

export { isVaultSupported };
export type { StorageAdapter };

/**
 * Single source of truth for "where entities currently live". The app reads and
 * writes through `activeAdapter`. Swapping adapters (e.g. local -> vault) is how
 * the Obsidian integration is wired without the UI knowing the difference.
 */

export const localAdapter = new LocalAdapter();
export const vaultAdapter = new VaultAdapter();

export const ADAPTERS: Record<string, StorageAdapter> = {
  local: localAdapter,
  vault: vaultAdapter,
};

let active: StorageAdapter = localAdapter;

export function activeAdapter(): StorageAdapter {
  return active;
}

export function setActiveAdapter(id: string): StorageAdapter {
  const next = ADAPTERS[id];
  if (!next) throw new Error(`No adapter: ${id}`);
  active = next;
  return active;
}
