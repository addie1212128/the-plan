import { db } from "../db";
import type { Entity, EntityKind, WorldMarker } from "../types";

/**
 * Pheocatira world canon, imported from the user's own "Ellie Build Atlas"
 * artifact (the production bible for *Ellie, the Last Dragon*).
 *
 * Everything here is drawn faithfully from the atlas — it does NOT invent lore.
 * The atlas is clear that the authoritative canon lives in the books / Orbismo;
 * these entities are scaffolding to flesh out, so bodies point at what to expand.
 *
 * Ids are stable (`ellie-<slug>`) so re-importing updates in place instead of
 * duplicating. Region markers are laid out on the Atlas world mode as a rough
 * map of the supercontinent (north = -z, south = +z); tune them freely.
 */

interface CanonSeed {
  id: string;
  kind: EntityKind;
  name: string;
  summary?: string;
  tags?: string[];
  body?: string;
  fields?: Record<string, string>;
  links?: string[];
  marker?: WorldMarker | null;
}

const atlas = (x: number, z: number, y = 0, color?: string): WorldMarker => ({
  mode: "atlas",
  x,
  y,
  z,
  ...(color ? { color } : {}),
});

export const ELLIE_CANON: CanonSeed[] = [
  // ─── The world itself ──────────────────────────────────────────────
  {
    id: "ellie-pheocatira",
    kind: "location",
    name: "Pheocatira",
    summary: "A single enormous supercontinent ringed by a near-impassable ocean.",
    tags: ["continent", "world", "canon"],
    fields: { Type: "Supercontinent", Regions: "14", Ocean: "The ring-sea (near-impassable)" },
    marker: { mode: "globe", x: 0, y: 0, z: 0 },
    body:
      "Pheocatira is one vast supercontinent, ringed by a near-impassable ocean and scarred by dragon-legacy landmarks. It is divided into **14 regions**, and its deepest truth runs beneath all of them: see [[The Mana Veins]].\n\nKingdom borders trace the veins, so geography here is also politics and magic — every region sits on something vast and asleep. Expand the continent's overall shape, scale and history from your books.",
  },

  // ─── The 14 regions ────────────────────────────────────────────────
  {
    id: "ellie-crown-peaks",
    kind: "location",
    name: "Crown Peaks",
    summary: "Alpine summits at the highest elevation, crowned with dragon-legacy landmarks.",
    tags: ["region", "alpine", "mountains"],
    fields: { Type: "Alpine range", Elevation: "Highest in Pheocatira", Feature: "Dragon-legacy summits" },
    marker: atlas(0, -12, 0, "#9fc5e8"),
    body: "The roof of [[Pheocatira]] — scree, high cliffs, and volumetric god-rays above the snow line. Dragon-legacy summits mark the peaks. (On the world-map layout it sits beside the [[Frost Expanse]].)",
  },
  {
    id: "ellie-frost-expanse",
    kind: "location",
    name: "Frost Expanse",
    summary: "A glacial, subzero waste of snow and ice.",
    tags: ["region", "glacial", "snow"],
    fields: { Type: "Glacial waste", Climate: "Subzero", Weather: "Blizzards, snow accumulation" },
    marker: atlas(-5, -13, 0, "#cfe8ff"),
    body: "A glacial, subzero stretch of [[Pheocatira]] — glaciers, blizzards, and deep snow. (On the world-map layout it lies beside the [[Crown Peaks]].)",
  },
  {
    id: "ellie-sky-archipelago",
    kind: "location",
    name: "Sky Archipelago",
    summary: "Floating islands drifting above the clouds — the signature set-piece of the world.",
    tags: ["region", "floating-islands", "signature"],
    fields: { Type: "Floating islands", Feature: "Waterfalls spilling off the edges", Note: "The project's signature visual" },
    marker: atlas(3, -9, 5, "#b9a7ff"),
    body: "Islands hanging in the sky over [[Pheocatira]], waterfalls pouring off their undersides into volumetric cloud. Called out in the atlas as the signature visual of the whole world — give it the most love.",
  },
  {
    id: "ellie-silver-highlands",
    kind: "location",
    name: "Silver Highlands",
    summary: "Rolling misted uplands studded with stone outcrops.",
    tags: ["region", "upland", "mist"],
    fields: { Type: "Rolling upland", Feature: "Mist, moss-covered boulders, lichen rock" },
    marker: atlas(5, -8, 0, "#bcd4c0"),
    body: "Gentle highland country under a low cloud layer that hugs the hills. Part of [[Pheocatira]].",
  },
  {
    id: "ellie-iron-steppe",
    kind: "location",
    name: "Iron Steppe",
    summary: "A harsh, mineral-rich open tableland — Dwarven mining territory.",
    tags: ["region", "tableland", "mining"],
    fields: { Type: "Harsh tableland", Resource: "Iron ore, iron-rich soil", Holds: "Dwarven mining territory" },
    marker: atlas(9, -9, 0, "#c9a07a"),
    body: "Rust-stained rock and sparse hardy grass. The mining heart of the [[Dwarves]], and a source of the ore valued across [[Pheocatira]] — see [[Trade & the Ring-Sea]].",
  },
  {
    id: "ellie-emerald-wilds",
    kind: "location",
    name: "Emerald Wilds",
    summary: "Dense old-growth forest — the territory of the World Spirits.",
    tags: ["region", "forest", "world-spirit"],
    fields: { Type: "Old-growth forest", Home: "Giant Wolves, Moon Stags", Spirit: "World Spirit territory" },
    marker: atlas(-7, -4, 0, "#4fae7a"),
    body: "Deep coniferous and broadleaf canopy, home to [[Giant Wolves]] and sacred [[Moon Stags]], and the territory of the [[World Spirits]]. The atlas suggests building the first playable slice of the game here.",
  },
  {
    id: "ellie-ash-wastes",
    kind: "location",
    name: "Ash Wastes",
    summary: "A volcanic, dragon-scorched, hostile land — where the mana-vein scarring is strongest.",
    tags: ["region", "volcanic", "hostile"],
    fields: { Type: "Volcanic waste", Feature: "Lava, ash fields, basalt", Lore: "Strongest mana-vein scarring" },
    marker: atlas(11, -2, 0, "#e07a3f"),
    body: "Scorched basalt, flowing lava, and ash. Of all [[Pheocatira]], the ground-glow of [[The Mana Veins]] is strongest here — the scar of a dragon that burns closest to the surface. Dead cities lie among the ash.",
  },
  {
    id: "ellie-twilight-forest",
    kind: "location",
    name: "Twilight Forest",
    summary: "A forest locked in perpetual dusk, lit by bioluminescent flora.",
    tags: ["region", "forest", "bioluminescent"],
    fields: { Type: "Forest", Light: "Permanent magic-hour (violet/amber dusk)", Feature: "Emissive flora" },
    marker: atlas(-10, 1, 0, "#b57fff"),
    body: "A wood where the sun never fully sets — emissive flora and an endless violet-amber dusk; the atlas likens its glow to the [[Crystal Serpents]]' habitat. Part of [[Pheocatira]].",
  },
  {
    id: "ellie-endless-plains",
    kind: "location",
    name: "Endless Plains",
    summary: "A vast, wind-driven grassland that runs to the horizon.",
    tags: ["region", "grassland", "wind"],
    fields: { Type: "Grassland", Feature: "Wind-driven grass to the horizon" },
    marker: atlas(3, 0, 0, "#cdd97a"),
    body: "Open grass bending in the wind as far as the eye can see — the horizon test of the world. Part of [[Pheocatira]].",
  },
  {
    id: "ellie-crystal-basin",
    kind: "location",
    name: "Crystal Basin",
    summary: "A pure-magic zone of exposed mana-crystal — home of the Crystal Serpents.",
    tags: ["region", "magic", "crystal"],
    fields: { Type: "Mana-crystal zone", Home: "Crystal Serpents", Lore: "Strongest vein-glow; pure magic" },
    marker: atlas(-3, 3, 0, "#a99bf7"),
    body: "Caverns and formations of raw [[Mana-Crystal]], the purest magic in [[Pheocatira]]. The home of the [[Crystal Serpents]], whose scales are prized spell components — see [[Crystal Serpent Scales]]. The glow of [[The Mana Veins]] runs strongest here.",
  },
  {
    id: "ellie-golden-desert",
    kind: "location",
    name: "Golden Desert",
    summary: "Arid dunes under an extreme, harsh sun.",
    tags: ["region", "desert", "arid"],
    fields: { Type: "Desert", Feature: "Dunes, wind ripples, heat-haze", Light: "Harsh single-source sun" },
    marker: atlas(11, 5, 0, "#e8cf7a"),
    body: "Endless sand and sandstone under a punishing sun. Part of [[Pheocatira]].",
  },
  {
    id: "ellie-whispering-swamps",
    kind: "location",
    name: "Whispering Swamps",
    summary: "Fog-wreathed wetland of standing water and rotting logs.",
    tags: ["region", "wetland", "fog"],
    fields: { Type: "Wetland", Feature: "Standing murky water, thick ground fog, fireflies" },
    marker: atlas(-6, 7, 0, "#6f9a7a"),
    body: "Murky shallows, roots, and drifting firefly light under heavy fog. Part of [[Pheocatira]].",
  },
  {
    id: "ellie-azure-coast",
    kind: "location",
    name: "Azure Coast",
    summary: "The ocean edge of the world — beaches against the near-impassable ring-sea.",
    tags: ["region", "coast", "ring-sea"],
    fields: { Type: "Coastline", Water: "The ring-sea", Feature: "Beaches, tide pools, sea cliffs, harbors" },
    marker: atlas(0, 11, 0, "#5fb3c9"),
    body: "Where [[Pheocatira]] meets the **ring-sea** — the near-impassable ocean of canon, endless and threatening. Its harbors are the start of every sea-trade route; see [[Trade & the Ring-Sea]].",
  },
  {
    id: "ellie-shattered-isles",
    kind: "location",
    name: "Shattered Isles",
    summary: "A fractured, sea-broken archipelago of stacks and broken towers.",
    tags: ["region", "archipelago", "ruins"],
    fields: { Type: "Archipelago", Feature: "Sea stacks, eroded arches, broken land" },
    marker: atlas(-12, 11, 0, "#7fa8c9"),
    body: "Land the sea has broken apart — stacks, arches, and the broken towers of old ruins. The far edge of [[Pheocatira]] against the ring-sea.",
  },

  // ─── The lore beneath the map ──────────────────────────────────────
  {
    id: "ellie-the-mana-veins",
    kind: "lore",
    name: "The Mana Veins",
    summary: "The law under the landscape: mana veins are sealed dragons, and ley lines are their cages.",
    tags: ["magic-system", "core-canon", "dragons"],
    fields: { Category: "Foundational law" },
    body:
      "The single idea beneath everything: **mana veins are sealed [[Dragons]] in the earth** — ley lines are cages nobody remembers burying (see [[The Forgetting]]).\n\nEvery region of [[Pheocatira]] sits on something vast and asleep: subtle ground-glow traces the vein paths, crystal intrusions and unnatural growth cluster near the strongest veins (the [[Ash Wastes]] and [[Crystal Basin]] glow brightest). Because kingdom borders trace these veins, geography is also a political and magical fault line — see [[The Vein-Borders]]. This is the strongest story engine in the world; pin its exact rules from your books so nothing drifts.",
  },
  {
    id: "ellie-the-laws-of-magic",
    kind: "lore",
    name: "The Laws of Magic",
    summary: "What a mana-core costs, its limits, who can wield one — and the risk of tearing.",
    tags: ["magic-system", "core-canon"],
    fields: { Category: "Magic", Mechanic: "Mana-cores; tearing" },
    body:
      "Magic is wielded through **mana-cores**. The full ruleset is canon to pin from your books: what a core *costs*, its limits, who can wield one and how cores are born.\n\n**Tearing** — a caster can *tear* their core for extra power at great risk: a spike of power followed by a chance of catastrophic backlash. Large spells wreak environmental havoc (scorched ground, flattened grass, cracked terrain). Cores come in colors by affinity — see [[The Five Core Colors]]. A magic system feels real when its limits are as firm as its powers.",
  },
  {
    id: "ellie-the-five-core-colors",
    kind: "lore",
    name: "The Five Core Colors",
    summary: "Mana-core affinities by color — White, Red, Blue, Green, Violet.",
    tags: ["magic-system", "canon"],
    fields: { Category: "Magic", White: "Dragon (Ellie)", Red: "Fire", Blue: "Water", Green: "Earth", Violet: "Shadow" },
    body:
      "Mana-cores carry an affinity, shown by color:\n\n- **White — Dragon.** [[Ellie]]'s core. Instant-cast, no chant: the fastest, cleanest, brightest magic. Her signature.\n- **Red — Fire.** Embers, heat-haze, ignition; tied to the [[Ash Wastes]].\n- **Blue — Water.** Flowing, refractive, mist.\n- **Green — Earth.** Rising stone, root growth, dust.\n- **Violet — Shadow.** Absorptive, smoky, light-bending.\n\nSee [[The Laws of Magic]] for how cores are wielded and torn.",
  },
  {
    id: "ellie-the-forgetting",
    kind: "lore",
    name: "The Forgetting",
    summary: "The age of dragons, their sealing into the veins, and how the world forgot they're there.",
    tags: ["history", "core-canon"],
    fields: { Category: "History" },
    body:
      "The history under everything: the age of the [[Dragons]], the sealing of them into [[The Mana Veins]], and how the world *forgot* they are there — the eras, the turning points, and the ruins left behind (ancient temple / seal-sites sit over the strongest veins). The buried truth is the world's strongest engine; pin the eras from your books so quests and lore never contradict it.",
  },
  {
    id: "ellie-the-vein-borders",
    kind: "lore",
    name: "The Vein-Borders",
    summary: "Kingdom borders trace the mana veins, so geography is politics.",
    tags: ["politics", "canon"],
    fields: { Category: "Politics" },
    body:
      "Because borders trace [[The Mana Veins]], **geography is politics**. Who holds which veins, the alliances and the current tensions, and who (if anyone) suspects the truth — this is the canon that turns into live territory and hostility. Define the real politics of [[Pheocatira]] from your books first.",
  },
  {
    id: "ellie-trade-and-the-ring-sea",
    kind: "lore",
    name: "Trade & the Ring-Sea",
    summary: "What the world values — and the sea-lanes and routes that move it.",
    tags: ["economy", "canon"],
    fields: { Category: "Economy" },
    body:
      "What [[Pheocatira]] values: [[Mana-Crystal]] from the [[Crystal Basin]], [[Crystal Serpent Scales]] as spell components, ore from the [[Iron Steppe]], and safe passage across the ring-sea. Each region specializes, so prices differ by place — the gap *is* the economy, and controlling a trade route (or the ring-sea lanes off the [[Azure Coast]]) is worth fighting over.",
  },
  {
    id: "ellie-faiths-of-the-ten-races",
    kind: "lore",
    name: "Faiths of the Ten Races",
    summary: "What the peoples believe about the veins and the dragons — rites, naming, language.",
    tags: ["culture", "canon"],
    fields: { Category: "Culture, faith & language" },
    body:
      "What the ten races believe about [[The Mana Veins]] and the [[Dragons]], their rites, and how they name people and places. Consistent belief and naming are what make a world feel lived-in rather than assembled. Draw each people's faith from your books.",
  },
  {
    id: "ellie-the-moons-and-seasons",
    kind: "lore",
    name: "The Moons & Seasons",
    summary: "The sky and its cycles — the moon(s) the Moon Stags answer to, and the seasons.",
    tags: ["cosmology", "canon"],
    fields: { Category: "Cosmology" },
    body:
      "The sky and its cycles: the moon(s) the sacred [[Moon Stags]] answer to, the seasons that drive the weather, and whatever hangs over the [[Sky Archipelago]]. Cosmology sets the calendar the whole living world runs on — pin it from your books.",
  },
  {
    id: "ellie-the-food-chain",
    kind: "lore",
    name: "The Food Chain",
    summary: "What the bestiary eats and fears — the ecology that ties the wildlife together.",
    tags: ["ecology", "canon"],
    fields: { Category: "Ecology" },
    body:
      "What the bestiary eats and fears — do [[Giant Wolves]] hunt the [[Moon Stags]]? What do the strongest veins warp into being nearby? A believable ecology is what makes the wildlife of [[Pheocatira]] feel like a system instead of scattered spawns.",
  },

  // ─── The ten races (peoples) ───────────────────────────────────────
  {
    id: "ellie-humans",
    kind: "faction",
    name: "Humans",
    summary: "One of Pheocatira's ten canon races.",
    tags: ["race", "people"],
    fields: { Type: "People", Architecture: "Timber, stone & thatch villages" },
    body: "One of the ten peoples of [[Pheocatira]]. Human and Halfling settlements share a medieval timber-stone-thatch look. Flesh out their history, lands and faith (see [[Faiths of the Ten Races]]) from your books.",
  },
  {
    id: "ellie-high-elves",
    kind: "faction",
    name: "High Elves",
    summary: "One of Pheocatira's ten canon races.",
    tags: ["race", "people", "elf"],
    fields: { Type: "People", Architecture: "Pale stone spires — tall, organic curves" },
    body: "One of the ten peoples of [[Pheocatira]]. Known (per the atlas's build notes) for pale stone, height, and organic curves. Expand from your books.",
  },
  {
    id: "ellie-dark-elves",
    kind: "faction",
    name: "Dark Elves",
    summary: "One of Pheocatira's ten canon races.",
    tags: ["race", "people", "elf"],
    fields: { Type: "People" },
    body: "One of the ten peoples of [[Pheocatira]]. Details live in your books — expand here.",
  },
  {
    id: "ellie-wood-elves",
    kind: "faction",
    name: "Wood Elves",
    summary: "One of Pheocatira's ten canon races.",
    tags: ["race", "people", "elf"],
    fields: { Type: "People" },
    body: "One of the ten peoples of [[Pheocatira]]. Details live in your books — expand here.",
  },
  {
    id: "ellie-dwarves",
    kind: "faction",
    name: "Dwarves",
    summary: "One of Pheocatira's ten canon races — miners of the Iron Steppe.",
    tags: ["race", "people"],
    fields: { Type: "People", Territory: "Iron Steppe", Architecture: "Heavy stone + iron, underground" },
    body: "One of the ten peoples of [[Pheocatira]]. Their mining territory is the [[Iron Steppe]]; their halls are heavy stone and iron, built underground. Expand from your books.",
  },
  {
    id: "ellie-orcs",
    kind: "faction",
    name: "Orcs",
    summary: "One of Pheocatira's ten canon races.",
    tags: ["race", "people"],
    fields: { Type: "People", Architecture: "Rough timber + hide" },
    body: "One of the ten peoples of [[Pheocatira]]. Their building style (per the atlas) is rough timber and hide. Expand from your books.",
  },
  {
    id: "ellie-beastkin",
    kind: "faction",
    name: "Beastkin",
    summary: "One of Pheocatira's ten canon races.",
    tags: ["race", "people"],
    fields: { Type: "People" },
    body: "One of the ten peoples of [[Pheocatira]]. Details live in your books — expand here.",
  },
  {
    id: "ellie-giants",
    kind: "faction",
    name: "Giants",
    summary: "One of Pheocatira's ten canon races.",
    tags: ["race", "people"],
    fields: { Type: "People" },
    body: "One of the ten peoples of [[Pheocatira]]. Details live in your books — expand here.",
  },
  {
    id: "ellie-halflings",
    kind: "faction",
    name: "Halflings",
    summary: "One of Pheocatira's ten canon races.",
    tags: ["race", "people"],
    fields: { Type: "People", Architecture: "Timber, stone & thatch villages" },
    body: "One of the ten peoples of [[Pheocatira]]. Share the medieval village look with [[Humans]]. Expand from your books.",
  },
  {
    id: "ellie-the-fae",
    kind: "faction",
    name: "The Fae",
    summary: "One of Pheocatira's ten canon races.",
    tags: ["race", "people", "fae"],
    fields: { Type: "People" },
    body: "One of the ten peoples of [[Pheocatira]]. Details live in your books — expand here.",
  },

  // ─── The bestiary ──────────────────────────────────────────────────
  {
    id: "ellie-dragons",
    kind: "creature",
    name: "Dragons",
    summary: "The sealed ancients — bound into the earth, they became the mana veins.",
    tags: ["dragon", "legendary", "core-canon"],
    fields: { Species: "Dragon", Status: "Sealed in the earth", Legacy: "Mana veins; dragon-legacy landmarks" },
    body: "The ancients of the age before [[The Forgetting]]. Sealed into the earth, they became [[The Mana Veins]] themselves. [[Ellie]] carries a white dragon-core — see [[The Five Core Colors]]. The truth of the dragons is the buried heart of [[Pheocatira]].",
  },
  {
    id: "ellie-world-spirits",
    kind: "creature",
    name: "World Spirits",
    summary: "The spirits whose territory is the Emerald Wilds; Giant Wolves are bonded to them.",
    tags: ["spirit", "canon"],
    fields: { Habitat: "Emerald Wilds" },
    body: "The spirits that hold the [[Emerald Wilds]] as their territory. [[Giant Wolves]] are bonded to them. Expand their nature and role from your books.",
  },
  {
    id: "ellie-giant-wolves",
    kind: "creature",
    name: "Giant Wolves",
    summary: "Great wolves of the Emerald Wilds, bonded to the World Spirits.",
    tags: ["beast", "wolf"],
    fields: { Habitat: "Emerald Wilds", Bond: "World Spirits" },
    body: "Enormous wolves that range the [[Emerald Wilds]], bonded to the [[World Spirits]]. See [[The Food Chain]] for their place in the ecology.",
  },
  {
    id: "ellie-moon-stags",
    kind: "creature",
    name: "Moon Stags",
    summary: "Sacred stags that answer to the moon(s).",
    tags: ["beast", "sacred", "stag"],
    fields: { Habitat: "Emerald Wilds", Nature: "Sacred; answer to the moons" },
    body: "Sacred stags of the [[Emerald Wilds]] that answer to the moon(s) — see [[The Moons & Seasons]]. Expand their myth and behavior from your books.",
  },
  {
    id: "ellie-crystal-serpents",
    kind: "creature",
    name: "Crystal Serpents",
    summary: "Serpents of the Crystal Basin whose scales are prized spell components.",
    tags: ["beast", "serpent", "magic"],
    fields: { Habitat: "Crystal Basin", Prized: "Scales as spell components" },
    body: "Serpents that dwell among the mana-crystal of the [[Crystal Basin]]. Their scales ([[Crystal Serpent Scales]]) are valued spell components — see [[Trade & the Ring-Sea]].",
  },
  {
    id: "ellie-giant-spiders",
    kind: "creature",
    name: "Giant Spiders",
    summary: "Part of Pheocatira's bestiary.",
    tags: ["beast", "spider"],
    fields: { Species: "Giant arachnid" },
    body: "One of the creatures of [[Pheocatira]]. Details live in your books — expand here.",
  },
  {
    id: "ellie-forest-guardians",
    kind: "creature",
    name: "Forest Guardians",
    summary: "Part of Pheocatira's bestiary.",
    tags: ["beast", "guardian"],
    fields: { Species: "Guardian" },
    body: "One of the creatures of [[Pheocatira]]'s bestiary. Details live in your books — expand here.",
  },

  // ─── The hero ──────────────────────────────────────────────────────
  {
    id: "ellie-ellie",
    kind: "character",
    name: "Ellie",
    summary: "The protagonist — the Last Dragon, a white-dragon-core wielder who casts instantly.",
    tags: ["protagonist", "hero", "dragon-core"],
    fields: { Role: "Protagonist", Core: "White (Dragon)", Gift: "Instant casting — no chant", Title: "The Last Dragon" },
    marker: atlas(-7, -2, 0, "#ffffff"),
    body:
      "The hero of the first book. Ellie wields a **white dragon-core** (the Dragon affinity — see [[The Five Core Colors]]) and casts instantly, with no chant — her signature. The atlas suggests building the first playable slice of the game in the [[Emerald Wilds]]. As the last of the [[Dragons]]' legacy, she is bound to the buried truth of [[The Mana Veins]]. Build her to your Book One cover; expand her arc from your books.",
  },

  // ─── Precious things ───────────────────────────────────────────────
  {
    id: "ellie-mana-crystal",
    kind: "item",
    name: "Mana-Crystal",
    summary: "Raw crystallized magic from the Crystal Basin — among the world's most precious resources.",
    tags: ["resource", "magic", "precious"],
    fields: { Type: "Resource", Source: "Crystal Basin", Value: "Among the most precious in Pheocatira" },
    body: "Raw, crystallized magic mined from the [[Crystal Basin]]. One of the things [[Pheocatira]] values most — see [[Trade & the Ring-Sea]].",
  },
  {
    id: "ellie-crystal-serpent-scales",
    kind: "item",
    name: "Crystal Serpent Scales",
    summary: "Scales of the Crystal Serpents, prized as spell components.",
    tags: ["resource", "spell-component", "precious"],
    fields: { Type: "Spell component", Source: "Crystal Serpents" },
    body: "The scales of the [[Crystal Serpents]] of the [[Crystal Basin]], prized as spell components and traded across the world — see [[Trade & the Ring-Sea]].",
  },
];

/** A tidy default sub-category per canon entity, so the list pages group nicely. */
function canonCategory(c: CanonSeed): string | undefined {
  switch (c.kind) {
    case "location":
      return c.id === "ellie-pheocatira" ? "The World" : "Regions";
    case "faction":
      return "Peoples";
    case "creature":
      return "Bestiary";
    case "lore":
      return "World Systems";
    default:
      return undefined; // characters, items stay uncategorized
  }
}

/** Import (idempotent) the Pheocatira canon into the local store. Returns count. */
export async function importEllieCanon(): Promise<number> {
  const now = Date.now();
  await db.transaction("rw", db.entities, async () => {
    for (const c of ELLIE_CANON) {
      const existing = await db.entities.get(c.id);
      const entity: Entity = {
        id: c.id,
        kind: c.kind,
        name: c.name,
        summary: c.summary ?? "",
        tags: c.tags ?? [],
        body: c.body ?? "",
        category: canonCategory(c),
        fields: c.fields ?? {},
        links: c.links ?? [],
        marker: c.marker ?? null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      await db.entities.put(entity);
    }
  });
  return ELLIE_CANON.length;
}
