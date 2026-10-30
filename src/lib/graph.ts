import type { Entity, EntityKind } from "./types";

/** Pull [[Wikilink]] targets (names) out of a markdown body. */
export function extractWikilinks(body: string): string[] {
  const out: string[] = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) out.push(m[1].trim());
  return out;
}

export interface GraphNode {
  id: string;
  name: string;
  kind: EntityKind;
  degree: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Build an undirected relationship graph from the entity set. Edges come from
 * two places: an entity's explicit `links` (ids) and the [[wikilinks]] in its
 * body, resolved to other entities by name (case-insensitive). Self-links and
 * duplicate edges are dropped.
 */
export function buildGraphData(entities: Entity[]): GraphData {
  const byId = new Map(entities.map((e) => [e.id, e]));
  const byName = new Map(entities.map((e) => [e.name.toLowerCase(), e.id]));

  const degree = new Map<string, number>();
  const seen = new Set<string>();
  const edges: GraphEdge[] = [];

  const addEdge = (a: string, b: string) => {
    if (a === b || !byId.has(a) || !byId.has(b)) return;
    const key = a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ source: a, target: b });
    degree.set(a, (degree.get(a) ?? 0) + 1);
    degree.set(b, (degree.get(b) ?? 0) + 1);
  };

  for (const e of entities) {
    for (const targetId of e.links) addEdge(e.id, targetId);
    for (const name of extractWikilinks(e.body)) {
      const targetId = byName.get(name.toLowerCase());
      if (targetId) addEdge(e.id, targetId);
    }
  }

  const nodes: GraphNode[] = entities.map((e) => ({
    id: e.id,
    name: e.name,
    kind: e.kind,
    degree: degree.get(e.id) ?? 0,
  }));

  return { nodes, edges };
}

/** A stable signature so the layout only rebuilds when the graph actually changes. */
export function graphSignature(data: GraphData): string {
  return (
    data.nodes.map((n) => n.id).sort().join(",") +
    "|" +
    data.edges
      .map((e) => (e.source < e.target ? `${e.source}-${e.target}` : `${e.target}-${e.source}`))
      .sort()
      .join(",")
  );
}
