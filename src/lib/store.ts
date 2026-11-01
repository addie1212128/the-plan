import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorldMode } from "./types";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  worldMode: WorldMode;
  setWorldMode: (m: WorldMode) => void;
  /** Id of the adapter the user has chosen as their store ("local" | "vault"). */
  storeId: string;
  setStoreId: (id: string) => void;
  /** Command palette (⌘K) visibility — not persisted. */
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      worldMode: "atlas",
      setWorldMode: (worldMode) => set({ worldMode }),
      storeId: "local",
      setStoreId: (storeId) => set({ storeId }),
      paletteOpen: false,
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
    }),
    {
      name: "loremkeeper:ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        worldMode: s.worldMode,
        storeId: s.storeId,
      }),
    },
  ),
);
