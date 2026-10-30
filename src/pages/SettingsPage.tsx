import { useEffect, useRef, useState } from "react";
import { FolderGit2, Download, Upload, Trash2, Sparkles, HardDrive, Link2Off, Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { vaultAdapter, isVaultSupported } from "@/lib/storage";
import { importFromVault, exportToVault } from "@/lib/sync";
import { seedDemoWorld, clearAll } from "@/lib/seed";
import { upsertMany } from "@/lib/data";
import { db } from "@/lib/db";
import { useUI } from "@/lib/store";
import type { Entity } from "@/lib/types";

export function SettingsPage() {
  const supported = isVaultSupported();
  const setStoreId = useUI((s) => s.setStoreId);
  const [folder, setFolder] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    vaultAdapter.init().then(() => {
      if (vaultAdapter.isReady()) {
        setFolder(vaultAdapter.folderName);
        setStoreId("vault");
      }
    });
  }, [setStoreId]);

  function report(kind: "ok" | "err", msg: string) {
    setStatus({ kind, msg });
  }

  async function connect() {
    try {
      setBusy(true);
      await vaultAdapter.connect();
      setFolder(vaultAdapter.folderName);
      setStoreId("vault");
      report("ok", `Connected to "${vaultAdapter.folderName}".`);
    } catch (e) {
      report("err", e instanceof Error ? e.message : "Could not connect to the folder.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    await vaultAdapter.disconnect();
    setFolder(null);
    setStoreId("local");
    report("ok", "Vault disconnected. Your data still lives safely on this device.");
  }

  async function doImport() {
    try {
      setBusy(true);
      const n = await importFromVault();
      report("ok", `Imported ${n} note${n === 1 ? "" : "s"} from the vault.`);
    } catch (e) {
      report("err", e instanceof Error ? e.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  async function doExport() {
    try {
      setBusy(true);
      const n = await exportToVault();
      report("ok", `Wrote ${n} markdown file${n === 1 ? "" : "s"} to the vault.`);
    } catch (e) {
      report("err", e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function backupJson() {
    const all = await db.entities.toArray();
    const blob = new Blob([JSON.stringify({ version: 1, entities: all }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loremkeeper-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function restoreJson(file: File) {
    try {
      const data = JSON.parse(await file.text());
      const entities = (data.entities ?? data) as Entity[];
      const n = await upsertMany(entities);
      report("ok", `Restored ${n} entr${n === 1 ? "y" : "ies"} from backup.`);
    } catch {
      report("err", "That file didn't look like a valid backup.");
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Storage, Obsidian sync, and backups." />
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        {status && (
          <div
            className={`rounded-lg border px-4 py-2.5 text-sm ${
              status.kind === "ok"
                ? "border-verdant/40 bg-verdant/10 text-verdant-soft"
                : "border-ember/40 bg-ember/10 text-ember-soft"
            }`}
          >
            {status.msg}
          </div>
        )}

        {/* Obsidian vault */}
        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-arcane" />
            <h2 className="font-display text-xl text-parchment-100">Obsidian vault</h2>
          </div>
          <p className="mt-1 text-sm text-parchment-300/70">
            Link a folder on your computer — point it at an Obsidian vault and Loremkeeper reads and writes
            the same markdown files (YAML frontmatter + body). Your notes stay yours, on disk.
          </p>

          {!supported ? (
            <div className="mt-4 rounded-lg border border-ink-500 bg-ink-800 p-3 text-sm text-parchment-300/70">
              Direct folder access isn't available in this browser. Use a Chromium browser (Chrome, Edge, Brave,
              Arc) for live vault sync — or use the JSON / markdown backup options below, which work everywhere.
            </div>
          ) : folder ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-verdant/30 bg-verdant/5 px-3 py-2 text-sm">
                <FolderGit2 className="h-4 w-4 text-verdant" />
                Connected to <span className="font-medium text-parchment-100">{folder}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary" disabled={busy} onClick={doImport}>
                  <Download className="h-4 w-4" /> Import from vault
                </button>
                <button className="btn-ember" disabled={busy} onClick={doExport}>
                  <Upload className="h-4 w-4" /> Export to vault
                </button>
                <button className="btn-ghost" disabled={busy} onClick={disconnect}>
                  <Link2Off className="h-4 w-4" /> Disconnect
                </button>
              </div>
              <p className="text-xs text-parchment-300/50">
                Import pulls your existing notes in; export writes your current entries out as markdown. Live
                two-way syncing is on the roadmap.
              </p>
            </div>
          ) : (
            <button className="btn-primary mt-4" disabled={busy} onClick={connect}>
              <FolderGit2 className="h-4 w-4" /> Connect a vault folder
            </button>
          )}
        </section>

        {/* Backup */}
        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-parchment-300" />
            <h2 className="font-display text-xl text-parchment-100">Backup &amp; restore</h2>
          </div>
          <p className="mt-1 text-sm text-parchment-300/70">
            A single portable JSON file with everything. Works in any browser.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={backupJson}>
              <Download className="h-4 w-4" /> Download backup
            </button>
            <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Restore from file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) restoreJson(f);
                e.target.value = "";
              }}
            />
          </div>
        </section>

        {/* Example / danger */}
        <section className="panel p-5">
          <h2 className="font-display text-xl text-parchment-100">Playground</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => seedDemoWorld().then(() => report("ok", "Example world loaded."))}>
              <Sparkles className="h-4 w-4" /> Load example world
            </button>
            <button
              className="btn-ghost text-ember-soft hover:bg-ember/10"
              onClick={() => {
                if (confirm("Delete ALL entries from this device? This can't be undone.")) {
                  clearAll().then(() => report("ok", "All entries cleared."));
                }
              }}
            >
              <Trash2 className="h-4 w-4" /> Clear all data
            </button>
          </div>
        </section>

        <section className="flex items-start gap-3 rounded-lg border border-ink-600 bg-ink-800/40 p-4 text-sm text-parchment-300/60">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Loremkeeper is local-first: your world is stored privately in this browser (and, if you link one, in
            your own folder). There are no accounts and nothing is uploaded to a server.
          </p>
        </section>
      </div>
    </div>
  );
}
