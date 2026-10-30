import { HardDrive, FolderGit2 } from "lucide-react";
import { QuickSearch } from "@/components/QuickSearch";
import { useUI } from "@/lib/store";

export function TopBar() {
  const storeId = useUI((s) => s.storeId);
  const isVault = storeId === "vault";

  return (
    <header className="flex items-center gap-4 border-b border-ink-600 bg-ink-800/60 px-6 py-3 backdrop-blur">
      <QuickSearch />
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
