import { createEntity } from "./data";
import { db } from "./db";
import type { NewEntity } from "./types";

/** A tiny example world so first-run users (and the 3D map) have something to see. */
const DEMO: NewEntity[] = [
  {
    kind: "character",
    name: "Seren Varr",
    summary: "The exiled heir of House Varr, hunting the truth of the Sundering.",
    tags: ["protagonist", "royalty", "exile"],
    fields: { Role: "Protagonist", Species: "Human", Affiliation: "House Varr", Status: "Exiled" },
    links: [],
    marker: { mode: "atlas", x: -6, y: 0, z: 3 },
    body:
      "Seren fled the capital the night of the [[The Sundering]]. She carries the [[Emberglass Shard]] and will not rest until House Varr is restored.\n\n## History\n\nRaised in the high towers of [[Aethelgard]]...",
  },
  {
    kind: "location",
    name: "Aethelgard",
    summary: "The tiered capital built into a dormant volcano.",
    tags: ["capital", "city"],
    fields: { Type: "City", Region: "The Ashlands", Population: "~120,000", Ruler: "Regent Kael" },
    links: [],
    marker: { mode: "atlas", x: 4, y: 0, z: -2, color: "#4fae7a" },
    body: "Seat of power for a thousand years. Its lowest tiers glow with geothermal forges.",
  },
  {
    kind: "location",
    name: "The Dawnreach",
    summary: "A windswept frontier of standing stones and old magic.",
    tags: ["frontier", "wilds"],
    fields: { Type: "Region", Climate: "Cold, windy" },
    links: [],
    marker: { mode: "atlas", x: -10, y: 0, z: -8, color: "#4fae7a" },
    body: "Few maps agree on where the Dawnreach ends and the sea begins.",
  },
  {
    kind: "faction",
    name: "The Ashen Court",
    summary: "The regent's inner circle, holding the throne in Seren's absence.",
    tags: ["political"],
    fields: { Type: "Royal court", Leader: "Regent Kael", Seat: "Aethelgard" },
    links: [],
    marker: null,
    body: "Officially mourning the lost heir. Privately, relieved.",
  },
  {
    kind: "item",
    name: "Emberglass Shard",
    summary: "A sliver of volcanic glass that remembers fire.",
    tags: ["artifact", "relic"],
    fields: { Type: "Relic", Owner: "Seren Varr", Rarity: "Unique" },
    links: [],
    marker: null,
    body: "Warm to the touch. Hums near ley lines.",
  },
  {
    kind: "event",
    name: "The Sundering",
    summary: "The night the sky cracked and House Varr fell.",
    tags: ["cataclysm"],
    fields: { Era: "Year 0", Location: "Aethelgard" },
    links: [],
    marker: null,
    body: "No one agrees on what caused it. Everyone agrees nothing was the same after.",
  },
  {
    kind: "lore",
    name: "Ley Lines",
    summary: "The world's veins of raw magic.",
    tags: ["magic-system"],
    fields: { Category: "Magic" },
    links: [],
    marker: { mode: "globe", x: 0, y: 0, z: 0 },
    body: "Magic pools where ley lines cross. Cities are rarely built anywhere else.",
  },
];

export async function seedDemoWorld(): Promise<void> {
  for (const d of DEMO) await createEntity(d);
}

export async function clearAll(): Promise<void> {
  await db.entities.clear();
}
