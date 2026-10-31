import {
  Users,
  MapPin,
  Flag,
  Sword,
  Rabbit,
  CalendarClock,
  ScrollText,
  Dna,
  Languages,
  Church,
  Drama,
  Wand2,
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
    kind: "species",
    label: "Species",
    singular: "Species",
    slug: "species",
    folder: "Species",
    icon: Dna,
    color: "#5ec8b0",
    suggestedFields: ["Classification", "Lifespan", "Habitat", "Traits", "Diet"],
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
    kind: "language",
    label: "Languages",
    singular: "Language",
    slug: "languages",
    folder: "Languages",
    icon: Languages,
    color: "#c79be0",
    suggestedFields: ["Family", "Spoken by", "Script", "Status"],
  },
  {
    kind: "religion",
    label: "Religions",
    singular: "Religion",
    slug: "religions",
    folder: "Religions",
    icon: Church,
    color: "#e8c35a",
    suggestedFields: ["Deities", "Followers", "Tenets", "Origin"],
  },
  {
    kind: "culture",
    label: "Cultures",
    singular: "Culture",
    slug: "cultures",
    folder: "Cultures",
    icon: Drama,
    color: "#e0948f",
    suggestedFields: ["People", "Region", "Values", "Customs"],
  },
  {
    kind: "magic",
    label: "Magic & Systems",
    singular: "System",
    slug: "magic",
    folder: "Magic",
    icon: Wand2,
    color: "#9b8cff",
    suggestedFields: ["Type", "Source", "Rules", "Cost", "Practitioners"],
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

/** Where a module's nav entry should link. Events get the chronological Timeline. */
export function modulePath(m: ModuleDef): string {
  return m.kind === "event" ? "/timeline" : `/m/${m.slug}`;
}
