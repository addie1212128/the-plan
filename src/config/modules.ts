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
  Building2,
  Crown,
  Sun,
  Layers,
  Landmark,
  Swords,
  Gem,
  Sprout,
  Boxes,
  Wrench,
  Ship,
  UtensilsCrossed,
  Scale,
  Coins,
  Brain,
  PartyPopper,
  Feather,
  Eye,
  BookText,
  BookOpen,
  GitBranch,
  Lightbulb,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import type { EntityKind } from "@/lib/types";

/** Sidebar/dashboard groupings for the modules, in display order. */
export const MODULE_GROUPS = [
  "People & Beings",
  "Places",
  "Things",
  "Society & Lore",
  "Story",
] as const;
export type ModuleGroup = (typeof MODULE_GROUPS)[number];

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
  /** Which sidebar group this module belongs to. */
  group: ModuleGroup;
  /** Suggested structured fields shown in the editor for this kind. */
  suggestedFields: string[];
}

export const MODULES: ModuleDef[] = [
  // ─── People & Beings ───────────────────────────────────────────────
  { kind: "character", label: "Characters", singular: "Character", slug: "characters", folder: "Characters", icon: Users, color: "#e07a3f", group: "People & Beings", suggestedFields: ["Role", "Species", "Age", "Affiliation", "Status"] },
  { kind: "species", label: "Species", singular: "Species", slug: "species", folder: "Species", icon: Dna, color: "#5ec8b0", group: "People & Beings", suggestedFields: ["Classification", "Lifespan", "Habitat", "Traits", "Diet"] },
  { kind: "creature", label: "Creatures", singular: "Creature", slug: "creatures", folder: "Creatures", icon: Rabbit, color: "#7fd0a2", group: "People & Beings", suggestedFields: ["Species", "Habitat", "Diet", "Temperament"] },
  { kind: "faction", label: "Factions", singular: "Faction", slug: "factions", folder: "Factions", icon: Flag, color: "#7c6cf0", group: "People & Beings", suggestedFields: ["Type", "Leader", "Seat", "Allies", "Rivals"] },
  { kind: "organization", label: "Organizations", singular: "Organization", slug: "organizations", folder: "Organizations", icon: Building2, color: "#8a9bd6", group: "People & Beings", suggestedFields: ["Type", "Leader", "Headquarters", "Members", "Purpose"] },
  { kind: "title", label: "Titles & Ranks", singular: "Title", slug: "titles", folder: "Titles", icon: Crown, color: "#d9b26a", group: "People & Beings", suggestedFields: ["Holder", "Rank", "Granted by", "Domain"] },
  { kind: "deity", label: "Deities", singular: "Deity", slug: "deities", folder: "Deities", icon: Sun, color: "#ffd36b", group: "People & Beings", suggestedFields: ["Domain", "Pantheon", "Symbol", "Worshippers", "Status"] },

  // ─── Places ────────────────────────────────────────────────────────
  { kind: "location", label: "Locations", singular: "Location", slug: "locations", folder: "Locations", icon: MapPin, color: "#4fae7a", group: "Places", suggestedFields: ["Type", "Region", "Population", "Ruler", "Climate"] },
  { kind: "realm", label: "Realms & Planes", singular: "Realm", slug: "realms", folder: "Realms", icon: Layers, color: "#6fb3d9", group: "Places", suggestedFields: ["Type", "Access", "Ruler", "Inhabitants"] },
  { kind: "landmark", label: "Landmarks", singular: "Landmark", slug: "landmarks", folder: "Landmarks", icon: Landmark, color: "#7ac0a0", group: "Places", suggestedFields: ["Type", "Location", "Significance"] },
  { kind: "battle", label: "Battles", singular: "Battle", slug: "battles", folder: "Battles", icon: Swords, color: "#d97a6a", group: "Places", suggestedFields: ["Date", "Location", "Victor", "Belligerents", "Outcome"] },

  // ─── Things ────────────────────────────────────────────────────────
  { kind: "item", label: "Items", singular: "Item", slug: "items", folder: "Items", icon: Sword, color: "#d8c7a0", group: "Things", suggestedFields: ["Type", "Owner", "Origin", "Powers", "Rarity"] },
  { kind: "artifact", label: "Artifacts", singular: "Artifact", slug: "artifacts", folder: "Artifacts", icon: Gem, color: "#c9a0e0", group: "Things", suggestedFields: ["Type", "Owner", "Origin", "Powers", "Rarity"] },
  { kind: "flora", label: "Flora", singular: "Plant", slug: "flora", folder: "Flora", icon: Sprout, color: "#7fcf7a", group: "Things", suggestedFields: ["Type", "Habitat", "Uses", "Rarity"] },
  { kind: "material", label: "Materials", singular: "Material", slug: "materials", folder: "Materials", icon: Boxes, color: "#c0a884", group: "Things", suggestedFields: ["Type", "Source", "Properties", "Rarity", "Uses"] },
  { kind: "tech", label: "Technology", singular: "Technology", slug: "technology", folder: "Technology", icon: Wrench, color: "#9aa7b5", group: "Things", suggestedFields: ["Type", "Inventor", "Era", "Function"] },
  { kind: "vehicle", label: "Vehicles", singular: "Vehicle", slug: "vehicles", folder: "Vehicles", icon: Ship, color: "#6fb0c7", group: "Things", suggestedFields: ["Type", "Owner", "Crew", "Speed", "Armament"] },
  { kind: "food", label: "Food & Drink", singular: "Dish", slug: "food", folder: "Food", icon: UtensilsCrossed, color: "#e0a87a", group: "Things", suggestedFields: ["Type", "Origin", "Ingredients", "Served at"] },

  // ─── Society & Lore ────────────────────────────────────────────────
  { kind: "language", label: "Languages", singular: "Language", slug: "languages", folder: "Languages", icon: Languages, color: "#c79be0", group: "Society & Lore", suggestedFields: ["Family", "Spoken by", "Script", "Status"] },
  { kind: "religion", label: "Religions", singular: "Religion", slug: "religions", folder: "Religions", icon: Church, color: "#e8c35a", group: "Society & Lore", suggestedFields: ["Deities", "Followers", "Tenets", "Origin"] },
  { kind: "culture", label: "Cultures", singular: "Culture", slug: "cultures", folder: "Cultures", icon: Drama, color: "#e0948f", group: "Society & Lore", suggestedFields: ["People", "Region", "Values", "Customs"] },
  { kind: "magic", label: "Magic & Systems", singular: "System", slug: "magic", folder: "Magic", icon: Wand2, color: "#9b8cff", group: "Society & Lore", suggestedFields: ["Type", "Source", "Rules", "Cost", "Practitioners"] },
  { kind: "law", label: "Laws & Government", singular: "Law", slug: "laws", folder: "Laws", icon: Scale, color: "#b7b0c9", group: "Society & Lore", suggestedFields: ["Type", "Jurisdiction", "Authority", "Penalty"] },
  { kind: "economy", label: "Economy", singular: "Economy Entry", slug: "economy", folder: "Economy", icon: Coins, color: "#e8c35a", group: "Society & Lore", suggestedFields: ["Type", "Issuer", "Value", "Used in"] },
  { kind: "philosophy", label: "Philosophies", singular: "Philosophy", slug: "philosophies", folder: "Philosophies", icon: Brain, color: "#b79be0", group: "Society & Lore", suggestedFields: ["Founder", "Tenets", "Adherents", "Origin"] },
  { kind: "tradition", label: "Traditions", singular: "Tradition", slug: "traditions", folder: "Traditions", icon: PartyPopper, color: "#e09b8f", group: "Society & Lore", suggestedFields: ["Observed by", "Occasion", "Practices", "Origin"] },
  { kind: "myth", label: "Myths & Legends", singular: "Myth", slug: "myths", folder: "Myths", icon: Feather, color: "#d9c07a", group: "Society & Lore", suggestedFields: ["Origin", "Subject", "Believed by", "Truth"] },
  { kind: "prophecy", label: "Prophecies", singular: "Prophecy", slug: "prophecies", folder: "Prophecies", icon: Eye, color: "#a99bf7", group: "Society & Lore", suggestedFields: ["Source", "Subject", "Status", "Fulfillment"] },
  { kind: "text", label: "Texts", singular: "Text", slug: "texts", folder: "Texts", icon: BookText, color: "#cdbfa0", group: "Society & Lore", suggestedFields: ["Author", "Type", "Language", "Contents"] },
  { kind: "lore", label: "Lore", singular: "Lore Note", slug: "lore", folder: "Lore", icon: ScrollText, color: "#a99bf7", group: "Society & Lore", suggestedFields: ["Category", "Related"] },

  // ─── Story ─────────────────────────────────────────────────────────
  { kind: "event", label: "Timeline", singular: "Event", slug: "events", folder: "Events", icon: CalendarClock, color: "#f0a877", group: "Story", suggestedFields: ["Date", "Era", "Location", "Participants"] },
  { kind: "manuscript", label: "Manuscript", singular: "Chapter", slug: "manuscript", folder: "Manuscript", icon: BookOpen, color: "#e07a3f", group: "Story", suggestedFields: ["Status", "POV", "Setting", "Wordcount"] },
  { kind: "plot", label: "Plot & Arcs", singular: "Arc", slug: "plot", folder: "Plot", icon: GitBranch, color: "#7c9bd9", group: "Story", suggestedFields: ["Type", "Act", "Status", "Characters"] },
  { kind: "theme", label: "Themes", singular: "Theme", slug: "themes", folder: "Themes", icon: Lightbulb, color: "#e8c35a", group: "Story", suggestedFields: ["Motif", "Expressed in"] },
  { kind: "note", label: "Notes", singular: "Note", slug: "notes", folder: "Notes", icon: StickyNote, color: "#cdd97a", group: "Story", suggestedFields: ["Topic"] },
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

/** Modules bucketed into their display groups, in group order. */
export function modulesByGroup(): { group: ModuleGroup; modules: ModuleDef[] }[] {
  return MODULE_GROUPS.map((group) => ({
    group,
    modules: MODULES.filter((m) => m.group === group),
  }));
}
