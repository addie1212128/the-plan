import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Grid, Html, Stars, Edges } from "@react-three/drei";
import * as THREE from "three";
import type { Entity, WorldMode } from "@/lib/types";
import { colorForKind } from "@/config/modules";

const GLOBE_RADIUS = 2.2;

export interface WorldSceneProps {
  mode: WorldMode;
  markers: Entity[];
  selectedId: string | null;
  placing: boolean;
  onSelect: (id: string) => void;
  /** Fired when the user clicks empty ground/surface while in placement mode. */
  onPlace: (coords: { x: number; y: number; z: number }) => void;
}

export function WorldScene(props: WorldSceneProps) {
  const camera =
    props.mode === "globe"
      ? { position: [0, 1.5, 6] as [number, number, number], fov: 45 }
      : { position: [0, 16, 20] as [number, number, number], fov: 45 };

  return (
    // Keyed by mode so the camera resets cleanly when switching worlds.
    <Canvas key={props.mode} camera={camera} dpr={[1, 2]} shadows>
      <color attach="background" args={["#0b0d12"]} />
      <fog attach="fog" args={["#0b0d12", 30, 70]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 18, 8]} intensity={1.1} castShadow />
      <Stars radius={120} depth={40} count={1800} factor={3} saturation={0} fade speed={0.5} />

      {props.mode === "atlas" && <AtlasGround placing={props.placing} onPlace={props.onPlace} />}
      {props.mode === "diorama" && <DioramaGround placing={props.placing} onPlace={props.onPlace} />}
      {props.mode === "globe" && <GlobeBody placing={props.placing} onPlace={props.onPlace} />}

      <Markers {...props} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={props.mode === "globe" ? 3.2 : 6}
        maxDistance={props.mode === "globe" ? 14 : 48}
        maxPolarAngle={props.mode === "globe" ? Math.PI : Math.PI / 2.1}
      />
    </Canvas>
  );
}

/* ---------- Grounds ---------- */

function AtlasGround({ placing, onPlace }: { placing: boolean; onPlace: WorldSceneProps["onPlace"] }) {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(e) => handleGroundPlace(e, placing, onPlace)}
      >
        <planeGeometry args={[60, 60, 1, 1]} />
        <meshStandardMaterial color="#13223a" roughness={0.95} metalness={0} />
      </mesh>
      <Grid
        args={[60, 60]}
        cellSize={2}
        cellColor="#24324d"
        sectionSize={10}
        sectionColor="#3a4e73"
        fadeDistance={60}
        fadeStrength={1.5}
        infiniteGrid={false}
        position={[0, 0.01, 0]}
      />
    </group>
  );
}

function DioramaGround({ placing, onPlace }: { placing: boolean; onPlace: WorldSceneProps["onPlace"] }) {
  // A few procedural low-poly landmarks so the world reads as 3D terrain.
  const hills = [
    { p: [-8, 0, -6] as const, h: 4, c: "#3b5a42" },
    { p: [6, 0, -9] as const, h: 6, c: "#2f4a38" },
    { p: [10, 0, 2] as const, h: 3, c: "#3b5a42" },
    { p: [-12, 0, 4] as const, h: 5, c: "#2f4a38" },
  ];
  const trees = [
    [-4, 2], [-2, 5], [3, 4], [8, 6], [-9, -2], [12, -4],
  ] as const;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={(e) => handleGroundPlace(e, placing, onPlace)}>
        <circleGeometry args={[24, 48]} />
        <meshStandardMaterial color="#2b4532" roughness={1} />
      </mesh>
      {hills.map((hl, i) => (
        <mesh key={i} position={[hl.p[0], hl.h / 2, hl.p[2]]} castShadow>
          <coneGeometry args={[hl.h * 0.9, hl.h, 5]} />
          <meshStandardMaterial color={hl.c} flatShading roughness={1} />
        </mesh>
      ))}
      {trees.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 1, 6]} />
            <meshStandardMaterial color="#5b3f2a" flatShading />
          </mesh>
          <mesh position={[0, 1.4, 0]} castShadow>
            <coneGeometry args={[0.7, 1.6, 7]} />
            <meshStandardMaterial color="#3f7a4e" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GlobeBody({ placing, onPlace }: { placing: boolean; onPlace: WorldSceneProps["onPlace"] }) {
  return (
    <group>
      <mesh castShadow receiveShadow onClick={(e) => handleGlobePlace(e, placing, onPlace)}>
        <icosahedronGeometry args={[GLOBE_RADIUS, 6]} />
        <meshStandardMaterial color="#1b3a5c" roughness={0.8} metalness={0.1} flatShading />
        <Edges threshold={18} color="#2f5f8f" />
      </mesh>
      {/* atmosphere halo */}
      <mesh scale={1.06}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#4f7fae" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/* ---------- Markers ---------- */

function Markers({ mode, markers, selectedId, onSelect }: WorldSceneProps) {
  return (
    <>
      {markers.map((e) => {
        if (!e.marker) return null;
        const pos = markerPosition(mode, e.marker);
        const color = e.marker.color || colorForKind(e.kind);
        const selected = e.id === selectedId;
        const r = mode === "globe" ? (selected ? 0.16 : 0.1) : selected ? 0.35 : 0.25;
        return (
          <group key={e.id} position={pos}>
            <mesh
              onClick={(ev) => {
                ev.stopPropagation();
                onSelect(e.id);
              }}
              onPointerOver={() => (document.body.style.cursor = "pointer")}
              onPointerOut={() => (document.body.style.cursor = "default")}
            >
              <sphereGeometry args={[r, 16, 16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 1.4 : 0.6} />
            </mesh>
            {/* pin stem for grounded modes */}
            {mode !== "globe" && (
              <mesh position={[0, -0.6, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
                <meshStandardMaterial color={color} transparent opacity={0.5} />
              </mesh>
            )}
            <Html center distanceFactor={mode === "globe" ? 6 : 26} position={[0, 0.5, 0]} zIndexRange={[20, 0]}>
              <div
                className={`whitespace-nowrap rounded-md border px-2 py-0.5 text-xs backdrop-blur transition ${
                  selected
                    ? "border-arcane/70 bg-ink-700/95 text-parchment-100"
                    : "border-ink-500/70 bg-ink-800/80 text-parchment-200"
                }`}
                style={{ pointerEvents: "none" }}
              >
                {e.name}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}

/* ---------- geometry helpers ---------- */

function markerPosition(mode: WorldMode, marker: NonNullable<Entity["marker"]>): [number, number, number] {
  if (mode === "globe") {
    // interpret x as longitude, z as latitude (degrees)
    const lon = (marker.x * Math.PI) / 180;
    const lat = (marker.z * Math.PI) / 180;
    const r = GLOBE_RADIUS + 0.06;
    return [
      r * Math.cos(lat) * Math.sin(lon),
      r * Math.sin(lat),
      r * Math.cos(lat) * Math.cos(lon),
    ];
  }
  return [marker.x, (marker.y || 0) + 0.7, marker.z];
}

function handleGroundPlace(
  e: ThreeEvent<MouseEvent>,
  placing: boolean,
  onPlace: WorldSceneProps["onPlace"],
) {
  if (!placing) return;
  e.stopPropagation();
  onPlace({ x: round(e.point.x), y: 0, z: round(e.point.z) });
}

function handleGlobePlace(
  e: ThreeEvent<MouseEvent>,
  placing: boolean,
  onPlace: WorldSceneProps["onPlace"],
) {
  if (!placing) return;
  e.stopPropagation();
  const p = e.point.clone().normalize();
  const lat = (Math.asin(p.y) * 180) / Math.PI;
  const lon = (Math.atan2(p.x, p.z) * 180) / Math.PI;
  onPlace({ x: round(lon), y: 0, z: round(lat) });
}

const round = (n: number) => Math.round(n * 100) / 100;
