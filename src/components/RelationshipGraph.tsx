import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type { GraphData, GraphNode } from "@/lib/graph";
import { graphSignature } from "@/lib/graph";
import { colorForKind } from "@/config/modules";

type SimNode = GraphNode & SimulationNodeDatum & { r: number };
type SimLink = SimulationLinkDatum<SimNode>;

const radiusFor = (degree: number) => 5 + Math.min(degree, 10) * 1.6;

export function RelationshipGraph({
  data,
  selectedId,
  onSelect,
}: {
  data: GraphData;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [, forceRender] = useState(0);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [hover, setHover] = useState<string | null>(null);

  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const rafPending = useRef(false);

  const sig = graphSignature(data);

  // Neighbor lookup for hover/selection highlighting.
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of data.edges) {
      if (!map.has(e.source)) map.set(e.source, new Set());
      if (!map.has(e.target)) map.set(e.target, new Set());
      map.get(e.source)!.add(e.target);
      map.get(e.target)!.add(e.source);
    }
    return map;
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure container.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // (Re)build the simulation when the graph structure changes.
  useEffect(() => {
    const prev = new Map(nodesRef.current.map((n) => [n.id, n]));
    const nodes: SimNode[] = data.nodes.map((n) => {
      const old = prev.get(n.id);
      return {
        ...n,
        r: radiusFor(n.degree),
        x: old?.x ?? (Math.cos(hashAngle(n.id)) * 120),
        y: old?.y ?? (Math.sin(hashAngle(n.id)) * 120),
      };
    });
    const links: SimLink[] = data.edges.map((e) => ({ source: e.source, target: e.target }));
    nodesRef.current = nodes;
    linksRef.current = links;

    const sim = forceSimulation(nodes)
      .force("link", forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(64).strength(0.5))
      .force("charge", forceManyBody().strength(-160))
      .force("x", forceX(0).strength(0.05))
      .force("y", forceY(0).strength(0.05))
      .force("collide", forceCollide<SimNode>((d) => d.r + 6))
      .on("tick", () => {
        if (rafPending.current) return;
        rafPending.current = true;
        requestAnimationFrame(() => {
          rafPending.current = false;
          forceRender((v) => v + 1);
        });
      });

    simRef.current = sim;
    return () => {
      sim.stop();
    };
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps

  const { w, h } = size;

  // Screen -> simulation coordinates.
  const toSim = (clientX: number, clientY: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return {
      x: (clientX - rect.left - w / 2 - view.x) / view.k,
      y: (clientY - rect.top - h / 2 - view.y) / view.k,
    };
  };

  // Background panning.
  const panState = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const onBgPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    panState.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
  };
  const onBgPointerMove = (e: React.PointerEvent) => {
    const p = panState.current;
    if (!p) return;
    setView((v) => ({ ...v, x: p.vx + (e.clientX - p.x), y: p.vy + (e.clientY - p.y) }));
  };
  const endPan = () => {
    panState.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const rect = wrapRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left - w / 2;
    const my = e.clientY - rect.top - h / 2;
    setView((v) => {
      const k = Math.max(0.25, Math.min(3, v.k * factor));
      const scale = k / v.k;
      return { k, x: mx - (mx - v.x) * scale, y: my - (my - v.y) * scale };
    });
  };

  // Node dragging + click detection.
  const dragState = useRef<{ id: string; moved: boolean } | null>(null);
  const onNodePointerDown = (e: React.PointerEvent, node: SimNode) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragState.current = { id: node.id, moved: false };
    simRef.current?.alphaTarget(0.25).restart();
    const p = toSim(e.clientX, e.clientY);
    node.fx = p.x;
    node.fy = p.y;
  };
  const onNodePointerMove = (e: React.PointerEvent, node: SimNode) => {
    if (dragState.current?.id !== node.id) return;
    dragState.current.moved = true;
    const p = toSim(e.clientX, e.clientY);
    node.fx = p.x;
    node.fy = p.y;
  };
  const onNodePointerUp = (e: React.PointerEvent, node: SimNode) => {
    if (dragState.current?.id !== node.id) return;
    const moved = dragState.current.moved;
    dragState.current = null;
    simRef.current?.alphaTarget(0);
    node.fx = null;
    node.fy = null;
    e.stopPropagation();
    if (!moved) onSelect(node.id);
  };

  const active = hover ?? selectedId;
  const isLit = (id: string) => !active || id === active || neighbors.get(active)?.has(id);

  const nodes = nodesRef.current;
  const links = linksRef.current;

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
      onPointerDown={onBgPointerDown}
      onPointerMove={onBgPointerMove}
      onPointerUp={endPan}
      onPointerLeave={endPan}
      onWheel={onWheel}
    >
      <svg width={w} height={h} className="block">
        <g transform={`translate(${w / 2 + view.x}, ${h / 2 + view.y}) scale(${view.k})`}>
          {links.map((l, i) => {
            const s = l.source as SimNode;
            const t = l.target as SimNode;
            if (!s || !t || s.x == null || t.x == null) return null;
            const lit = !active || isLit(s.id) && isLit(t.id);
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={lit ? "#3a4e73" : "#222838"}
                strokeWidth={0.8}
                strokeOpacity={lit ? 0.8 : 0.25}
              />
            );
          })}
          {nodes.map((n) => {
            if (n.x == null || n.y == null) return null;
            const lit = isLit(n.id);
            const color = colorForKind(n.kind);
            const isActive = n.id === active;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                style={{ cursor: "pointer", opacity: lit ? 1 : 0.25 }}
                onPointerDown={(e) => onNodePointerDown(e, n)}
                onPointerMove={(e) => onNodePointerMove(e, n)}
                onPointerUp={(e) => onNodePointerUp(e, n)}
                onPointerEnter={() => setHover(n.id)}
                onPointerLeave={() => setHover((cur) => (cur === n.id ? null : cur))}
              >
                <circle
                  r={n.r}
                  fill={color}
                  fillOpacity={0.9}
                  stroke={isActive ? "#f4ecd8" : "#0b0d12"}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {(n.r > 8 || isActive || view.k > 1.3) && (
                  <text
                    y={n.r + 10}
                    textAnchor="middle"
                    fontSize={10}
                    fill={lit ? "#d8c7a0" : "#555d78"}
                    style={{ pointerEvents: "none" }}
                    paintOrder="stroke"
                    stroke="#0b0d12"
                    strokeWidth={3}
                  >
                    {n.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

/** Deterministic angle per id so the initial layout is stable across reloads. */
function hashAngle(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return (h % 360) * (Math.PI / 180);
}
