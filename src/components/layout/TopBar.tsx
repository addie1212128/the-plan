import { HardDrive, FolderGit2, Search } from "lucide-react";
import { useUI } from "@/lib/store";

export function TopBar() {
  const storeId = useUI((s) => s.storeId);
  const setPaletteOpen = useUI((s) => s.setPaletteOpen);
  const isVault = storeId === "vault";

  return (
    <header className="flex items-center gap-4 border-b border-ink-600 bg-ink-800/60 px-6 py-3 backdrop-blur">
      <button
        onClick={() => setPaletteOpen(true)}
        className="flex w-full max-w-md items-center gap-2 rounded-lg border border-ink-500 bg-ink-800 px-3 py-2 text-sm text-parchment-300/50 transition hover:border-arcane/50 hover:text-parchment-300/70"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search your world…</span>
        <kbd className="kbd">⌘K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <span
          className="chip gap-1.5"
          title={isVault ? "Synced with an Obsidian vault folder" : "Stored locally in this browser"}
        >
          {isVault ? <FolderGit2 className="h-3.5 w-3.5" /> : <HardDrive className="h-3.5 w-3.5" />}
          {isVault ? "Vault" : "Local"}
        </span>
      </div>
    </header>
  );
}
