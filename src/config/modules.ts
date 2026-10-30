import {
  Users,
  MapPin,
  Flag,
  Sword,
  Rabbit,
  CalendarClock,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { EntityKind } from "@/lib/types";

export interface ModuleDef {
  kind: EntityKind;
  /** Plural label used for navigation and list headings. */
  label: string;
  /** Singular label used for buttons like "New Character". */
  singular: string;
  /** URL segment, e.g. /characters. */
  slug: string;
  /** Folder name used when reading/writing an Obsidian vault. */
  folder: string;
  icon: LucideIcon;
  /** Accent color token (tailwind color value) for this kind. */
  color: string;
  /** Suggested structured fields shown in the editor for this kind. */
  suggestedFields: string[];
}

export const MODULES: ModuleDef[] = [
  {
    kind: "character",
    label: "Characters",
    singular: "Character",
    slug: "characters",
    folder: "Characters",
    icon: Users,
    color: "#e07a3f",
    suggestedFields: ["Role", "Species", "Age", "Affiliation", "Status"],
  },
  {
    kind: "location",
    label: "Locations",
    singular: "Location",
    slug: "locations",
    folder: "Locations",
    icon: MapPin,
    color: "#4fae7a",
    suggestedFields: ["Type", "Region", "Population", "Ruler", "Climate"],
  },
  {
    kind: "faction",
    label: "Factions",
    singular: "Faction",
    slug: "factions",
    folder: "Factions",
    icon: Flag,
    color: "#7c6cf0",
    suggestedFields: ["Type", "Leader", "Seat", "Allies", "Rivals"],
  },
  {
    kind: "item",
    label: "Items",
    singular: "Item",
    slug: "items",
    folder: "Items",
    icon: Sword,
    color: "#d8c7a0",
    suggestedFields: ["Type", "Owner", "Origin", "Powers", "Rarity"],
  },
  {
    kind: "creature",
    label: "Creatures",
    singular: "Creature",
    slug: "creatures",
    folder: "Creatures",
    icon: Rabbit,
    color: "#7fd0a2",
    suggestedFields: ["Species", "Habitat", "Diet", "Temperament"],
  },
  {
    kind: "event",
    label: "Timeline",
    singular: "Event",
    slug: "events",
    folder: "Events",
    icon: CalendarClock,
    color: "#f0a877",
    suggestedFields: ["Date", "Era", "Location", "Participants"],
  },
  {
    kind: "lore",
    label: "Lore",
    singular: "Lore Note",
    slug: "lore",
    folder: "Lore",
    icon: ScrollText,
    color: "#a99bf7",
    suggestedFields: ["Category", "Related"],
  },
];

const byKind = new Map(MODULES.map((m) => [m.kind, m]));
const bySlug = new Map(MODULES.map((m) => [m.slug, m]));

export function moduleFor(kind: EntityKind): ModuleDef {
  const m = byKind.get(kind);
  if (!m) throw new Error(`Unknown entity kind: ${kind}`);
  return m;
}

export function moduleForSlug(slug: string): ModuleDef | undefined {
  return bySlug.get(slug);
}

export function colorForKind(kind: EntityKind): string {
  return byKind.get(kind)?.color ?? "#e07a3f";
}
