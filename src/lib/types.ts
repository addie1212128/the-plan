/**
 * Core domain model.
 *
 * Everything a worldbuilder tracks is an "Entity": a character, a location, a
 * faction, an event, a loose lore note, etc. Each entity serializes 1:1 to an
 * Obsidian-friendly markdown file (YAML frontmatter + a markdown body), which
 * is why the shape stays deliberately flat and portable.
 */

export type EntityKind =
  | "character"
  | "location"
  | "faction"
  | "item"
  | "creature"
  | "event"
  | "lore";

/** Which 3D world view a marker belongs to. The world supports all three. */
export type WorldMode = "atlas" | "diorama" | "globe";

/** A placement of an entity within one of the 3D world modes. */
export interface WorldMarker {
  mode: WorldMode;
  /** World-space coordinates for the given mode (meaning depends on the mode). */
  x: number;
  y: number;
  z: number;
  /** Optional color override; otherwise derived from the entity kind. */
  color?: string;
}

export interface Entity {
  id: string;
  kind: EntityKind;
  name: string;
  /** One-line description shown in lists and marker tooltips. */
  summary: string;
  tags: string[];
  /** Markdown body. May contain [[wikilinks]] to other entities by name. */
  body: string;
  /** Kind-specific structured attributes (age, species, population, …). */
  fields: Record<string, string>;
  /** Explicit relationships to other entities, by id. */
  links: string[];
  /** Optional placement on the 3D world. */
  marker: WorldMarker | null;
  createdAt: number;
  updatedAt: number;
}

export type NewEntity = Omit<Entity, "id" | "createdAt" | "updatedAt"> &
  Partial<Pick<Entity, "id" | "createdAt" | "updatedAt">>;
