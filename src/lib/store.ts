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
    }),
    { name: "loremkeeper:ui" },
  ),
);
