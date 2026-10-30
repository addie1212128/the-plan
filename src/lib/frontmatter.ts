import yaml from "js-yaml";
import type { Entity, EntityKind } from "./types";
import { moduleFor } from "@/config/modules";

/**
 * Obsidian-compatible (de)serialization.
 *
 * An entity <-> a markdown file:
 *
 *   ---
 *   kind: character
 *   summary: The exiled heir of House Varr
 *   tags: [royalty, exile]
 *   fields:
 *     Role: Protagonist
 *   marker: { mode: atlas, x: 12, y: 0, z: -4 }
 *   ---
 *   # Seren Varr
 *
 *   Body markdown, with [[wikilinks]] to other notes...
 *
 * The H1 is treated as the display name so the files read naturally inside
 * Obsidian. Any key we do not recognise in the frontmatter is preserved on a
 * round-trip via the `fields` bag where possible.
 */

const FM_DELIM = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export interface ParsedFile {
  frontmatter: Record<string, unknown>;
  body: string;
}

export function splitFrontmatter(raw: string): ParsedFile {
  const match = raw.match(FM_DELIM);
  if (!match) return { frontmatter: {}, body: raw.trim() };
  let fm: Record<string, unknown> = {};
  try {
    const loaded = yaml.load(match[1]);
    if (loaded && typeof loaded === "object") fm = loaded as Record<string, unknown>;
  } catch {
    /* malformed frontmatter -> treat as none */
  }
  return { frontmatter: fm, body: raw.slice(match[0].length).trim() };
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function asStringRecord(v: unknown): Record<string, string> {
  if (!v || typeof v !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    out[k] = val == null ? "" : String(val);
  }
  return out;
}

/** Strips a leading `# Heading` and returns [name, remainingBody]. */
function extractHeading(body: string, fallback: string): [string, string] {
  const m = body.match(/^#\s+(.+?)\s*\r?\n+/);
  if (m) return [m[1].trim(), body.slice(m[0].length).trim()];
  return [fallback, body];
}

export function fileToEntity(
  raw: string,
  opts: { kind: EntityKind; fallbackName: string; id: string },
): Entity {
  const { frontmatter: fm, body } = splitFrontmatter(raw);
  const kind = (fm.kind as EntityKind) || opts.kind;
  const [name, rest] = extractHeading(body, (fm.name as string) || opts.fallbackName);
  const now = Date.now();
  return {
    id: (fm.id as string) || opts.id,
    kind,
    name,
    summary: (fm.summary as string) || "",
    tags: asStringArray(fm.tags),
    body: rest,
    fields: asStringRecord(fm.fields),
    links: asStringArray(fm.links),
    marker: (fm.marker as Entity["marker"]) ?? null,
    createdAt: typeof fm.createdAt === "number" ? fm.createdAt : now,
    updatedAt: typeof fm.updatedAt === "number" ? fm.updatedAt : now,
  };
}

export function entityToFile(entity: Entity): string {
  const fm: Record<string, unknown> = {
    id: entity.id,
    kind: entity.kind,
    summary: entity.summary || undefined,
    tags: entity.tags.length ? entity.tags : undefined,
    fields: Object.keys(entity.fields).length ? entity.fields : undefined,
    links: entity.links.length ? entity.links : undefined,
    marker: entity.marker ?? undefined,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
  const yamlBlock = yaml.dump(fm, { skipInvalid: true, lineWidth: 100 }).trimEnd();
  return `---\n${yamlBlock}\n---\n\n# ${entity.name}\n\n${entity.body}\n`;
}

/** Default file path for an entity within a vault, e.g. "Characters/Seren Varr.md". */
export function vaultPathFor(entity: Entity): string {
  const folder = moduleFor(entity.kind).folder;
  const safe = entity.name.replace(/[\\/:*?"<>|]/g, "-").trim() || entity.id;
  return `${folder}/${safe}.md`;
}
