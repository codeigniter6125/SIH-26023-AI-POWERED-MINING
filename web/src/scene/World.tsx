import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Instance, Instances } from "@react-three/drei";
import * as THREE from "three";
import { BLOCK_DEPTH, BLOCK_WIDTH, DEPTH_SCALE, FACE_Z, LOADER_BUILD_MS, STRATA, mToY, type Stratum } from "../config/world";
import { Toon, toonGradient, usePalette, type Palette } from "./toon";
import { store, useWorld } from "../state/store";
import { Poke } from "./Poke";
import { Person } from "./objects/Person";
import { Dumper, Rig, Theo } from "./objects/SurfaceProps";
import { ArchiveBox, Fossil, HatRack, Lumpy, Mole, Rulers, Tortoise } from "./objects/DeepProps";

const BUILD_STAGGER_S = 0.2;
const BUILD_GROW_S = 0.4;
const TOPSOIL = 0.35;
const PROTRUDE = 0.45; // how far deep props stick out of the cut face
const DRILL_RADIUS = 0.09;

/** Deterministic pseudo-random so the diorama looks the same every visit. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function stratumColor(s: Stratum, pal: Palette): string {
  const base: Record<string, string> = {
    "--stratum": pal.stratum,
    "--hivis-pale": pal.hivisPale,
    "--coal": pal.coal,
    "--rock": pal.rock,
  };
  const c = new THREE.Color(base[s.colorVar] ?? pal.rock);
  if (s.shade) c.multiplyScalar(1 + s.shade);
  return `#${c.getHexString()}`;
}

/** The layered block. Each stratum grows down from its top while the loader runs. */
function Strata({ startAt }: { startAt: React.MutableRefObject<number | null> }) {
  const pal = usePalette();
  const groups = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    if (startAt.current === null) startAt.current = clock.elapsedTime;
    const t = clock.elapsedTime - startAt.current;
    groups.current.forEach((g, i) => {
      if (!g) return;
      const k = THREE.MathUtils.clamp((t - i * BUILD_STAGGER_S) / BUILD_GROW_S, 0, 1);
      g.scale.y = Math.max(0.001, easeOutBack(k));
    });
  });
  return (
    <group>
      {STRATA.map((s, i) => {
        const h = (s.toM - s.fromM) / DEPTH_SCALE;
        return (
          <group key={s.id} ref={(el) => (groups.current[i] = el)} position={[0, mToY(s.fromM), 0]}>
            <mesh position={[0, -h / 2, 0]}>
              <boxGeometry args={[BLOCK_WIDTH, h, BLOCK_DEPTH]} />
              <Toon color={stratumColor(s, pal)} />
            </mesh>
            <Html
              position={[-BLOCK_WIDTH / 2 + 0.4, -Math.min(h / 2, 1.2), FACE_Z + 0.05]}
              transform
              distanceFactor={6}
              zIndexRange={[5, 0]}
              style={{ pointerEvents: "none" }}
            >
              <span className={`stratum-tag ${s.colorVar === "--coal" ? "stratum-tag--coal" : ""}`}>{s.label}</span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function Pebbles({ count }: { count: number }) {
  const pal = usePalette();
  const items = useMemo(() => {
    const rnd = seeded(42);
    return Array.from({ length: count }, () => {
      const s = STRATA[Math.floor(rnd() * STRATA.length)];
      const depth = s.fromM + rnd() * (s.toM - s.fromM);
      const size = 0.08 + rnd() * 0.16;
      return {
        position: [(rnd() - 0.5) * (BLOCK_WIDTH - 1), mToY(depth), FACE_Z + 0.02] as [number, number, number],
        scale: size,
        coal: s.colorVar === "--coal",
        rot: rnd() * Math.PI,
      };
    });
  }, [count]);
  return (
    <Instances limit={count}>
      <icosahedronGeometry args={[1, 0]} />
      <meshToonMaterial gradientMap={toonGradient()} />
      {items.map((p, i) => (
        <Instance key={i} position={p.position} scale={[p.scale, p.scale * 0.7, p.scale * 0.4]} rotation={[0, 0, p.rot]} color={p.coal ? pal.rock : pal.paperDeep} />
      ))}
    </Instances>
  );
}

function Trees({ count }: { count: number }) {
  const pal = usePalette();
  const items = useMemo(() => {
    const rnd = seeded(7);
    const out: { pos: [number, number, number]; s: number }[] = [];
    while (out.length < count) {
      const x = (rnd() - 0.5) * (BLOCK_WIDTH - 2);
      const z = -BLOCK_DEPTH / 2 + 0.8 + rnd() * 4;
      if (Math.abs(x) < 2.5) continue; // keep the rig clear
      out.push({ pos: [x, TOPSOIL, z], s: 0.7 + rnd() * 0.6 });
    }
    return out;
  }, [count]);
  return (
    <group>
      <Instances limit={count}>
        <coneGeometry args={[0.7, 1.8, 7]} />
        <meshToonMaterial gradientMap={toonGradient()} color={pal.hivisDeep} />
        {items.map((t, i) => (
          <Instance key={i} position={[t.pos[0], t.pos[1] + 1.4 * t.s, t.pos[2]]} scale={t.s} />
        ))}
      </Instances>
      <Instances limit={count}>
        <cylinderGeometry args={[0.12, 0.14, 0.8, 6]} />
        <meshToonMaterial gradientMap={toonGradient()} color={pal.coal} />
        {items.map((t, i) => (
          <Instance key={i} position={[t.pos[0], t.pos[1] + 0.4 * t.s, t.pos[2]]} scale={t.s} />
        ))}
      </Instances>
    </group>
  );
}

/** Everything on top of the block. Pops in after the strata finish building. */
function Surface({ startAt, mobile }: { startAt: React.MutableRefObject<number | null>; mobile: boolean }) {
  const pal = usePalette();
  const root = useRef<THREE.Group>(null);
  const done = useRef(false);
  const buildEnd = LOADER_BUILD_MS / 1000;
  useFrame(({ clock }) => {
    if (!root.current || startAt.current === null) return;
    const t = clock.elapsedTime - startAt.current;
    const k = THREE.MathUtils.clamp((t - (buildEnd - 0.5)) / 0.5, 0, 1);
    root.current.scale.setScalar(Math.max(0.001, easeOutBack(k)));
    if (!done.current && t >= buildEnd) {
      done.current = true;
      store.set({ ready: true });
    }
  });
  return (
    <group ref={root}>
      <mesh position={[0, TOPSOIL / 2, 0]}>
        <boxGeometry args={[BLOCK_WIDTH, TOPSOIL, BLOCK_DEPTH]} />
        <Toon color={pal.paperDeep} />
      </mesh>
      <Trees count={mobile ? 6 : 14} />
      <Poke id="rig" position={[0, TOPSOIL, FACE_Z - 1.6]} bubbleAt={[0, 7.2, 0]} sound="thud" lift={false}>
        {(p) => <Rig poke={p} />}
      </Poke>
      <Poke id="mukho" position={[-3.6, TOPSOIL, 3.4]} rotation={[0, 0.35, 0]} bubbleAt={[0, 3.4, 0]}>
        {(p) => <Person poke={p} vest={pal.hivis} shirt={pal.paper} holding="hammer" />}
      </Poke>
      <Poke id="priya" position={[-6.4, TOPSOIL, 2]} rotation={[0, 0.5, 0]} bubbleAt={[0, 3.4, 0]}>
        {(p) => <Person poke={p} vest={pal.flag} shirt={pal.paperDeep} holding="papers" phase={1.3} />}
      </Poke>
      {!mobile && (
        <>
          <Poke id="theo" position={[4.2, TOPSOIL, 3.8]} rotation={[0, -0.4, 0]} bubbleAt={[0, 2.6, 0]}>
            {(p) => <Theo poke={p} />}
          </Poke>
          <Poke id="dumper" position={[6.2, TOPSOIL, -1.5]} bubbleAt={[0, 2.2, 0]} sound="honk" lift={false}>
            {(p) => <Dumper poke={p} />}
          </Poke>
        </>
      )}
    </group>
  );
}

function DrillString() {
  const pal = usePalette();
  const bottom = mToY(139);
  return (
    <mesh position={[0, (TOPSOIL + bottom) / 2, FACE_Z - 0.05]}>
      <cylinderGeometry args={[DRILL_RADIUS, DRILL_RADIUS, TOPSOIL - bottom, 8]} />
      <Toon color={pal.coal} outline={false} />
    </mesh>
  );
}

/** Props stuck into the cut face, one cluster per stop. */
function DeepProps() {
  const z = FACE_Z + PROTRUDE;
  return (
    <group>
      <Poke id="archive" position={[-2.6, mToY(14), z]} rotation={[0, 0.2, 0]} bubbleAt={[0, 2, 0]} sound="thud">
        {(p) => <ArchiveBox poke={p} />}
      </Poke>
      <Poke id="mole" position={[1.8, mToY(31), z]} bubbleAt={[0, 1.5, 0]}>
        {(p) => <Mole poke={p} />}
      </Poke>
      <Poke id="fossil" position={[3, mToY(80), z - 0.3]} bubbleAt={[0, 2.2, 0]}>
        {(p) => <Fossil poke={p} />}
      </Poke>
      <Poke id="lumpy" position={[-1.6, mToY(119.5), z]} bubbleAt={[0, 1.4, 0]}>
        {(p) => <Lumpy poke={p} />}
      </Poke>
      <Poke id="rulers" position={[2.2, mToY(130.5), z]} bubbleAt={[0, 1.9, 0]} sound="click" lift={false}>
        {(p) => <Rulers poke={p} />}
      </Poke>
      <Poke id="hats" position={[-2.2, mToY(138.5), z]} bubbleAt={[0, 1.8, 0]} sound="click" lift={false}>
        {(p) => <HatRack poke={p} />}
      </Poke>
      <Poke id="tortoise" position={[3.2, mToY(181), z + 0.3]} bubbleAt={[0, 2, 0]} sound="thud" lift={false}>
        {(p) => <Tortoise poke={p} />}
      </Poke>
    </group>
  );
}

function Lights() {
  const pal = usePalette();
  const night = useWorld((s) => s.theme === "night");
  const scene = useThree((s) => s.scene);
  useMemo(() => {
    scene.background = new THREE.Color(pal.sky);
  }, [scene, pal.sky]);
  return (
    <>
      <ambientLight intensity={night ? 0.55 : 1.4} />
      <directionalLight position={[10, 18, 14]} intensity={night ? 0.9 : 2.6} />
      <directionalLight position={[-12, -40, 20]} intensity={night ? 0.25 : 0.6} />
    </>
  );
}

export function World({ mobile }: { mobile: boolean }) {
  const startAt = useRef<number | null>(null);
  return (
    <group>
      <Lights />
      <Strata startAt={startAt} />
      <Pebbles count={mobile ? 40 : 110} />
      <DrillString />
      <Surface startAt={startAt} mobile={mobile} />
      <DeepProps />
    </group>
  );
}
