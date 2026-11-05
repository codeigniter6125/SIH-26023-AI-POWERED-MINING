import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Toon, usePalette } from "../toon";
import { live } from "../../state/store";
import { pokePulse, type PokeState } from "../Poke";

const Eyes = ({ z, spread = 0.14, y = 0, size = 0.06 }: { z: number; spread?: number; y?: number; size?: number }) => {
  const pal = usePalette();
  return (
    <>
      {[-spread, spread].map((x) => (
        <mesh key={x} position={[x, y, z]}>
          <sphereGeometry args={[size, 8, 6]} />
          <meshBasicMaterial color={pal.coal} />
        </mesh>
      ))}
    </>
  );
};

/** Archive box, MECL 1998. Lid rattles; jumps on click. */
export function ArchiveBox({ poke }: { poke: PokeState }) {
  const pal = usePalette();
  const lid = useRef<THREE.Mesh>(null);
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (lid.current) lid.current.rotation.z = Math.max(0, Math.sin(t * 9)) * (poke.hovered ? 0.35 : 0.06);
    if (root.current) root.current.position.y = Math.sin(pokePulse(poke.sincePoke(), 0.6) * Math.PI) * 0.6;
  });
  return (
    <group ref={root}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.6, 1, 1.1]} />
        <Toon color={pal.paperDeep} />
      </mesh>
      <mesh ref={lid} position={[0, 1.07, 0]}>
        <boxGeometry args={[1.7, 0.16, 1.2]} />
        <Toon color={pal.paper} />
      </mesh>
      <Html position={[0, 0.5, 0.56]} center transform distanceFactor={8} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <span className="paper-tag">MECL · 1998</span>
      </Html>
    </group>
  );
}

/** Scanner mole: pops up and down, nose follows the cursor. */
export function Mole({ poke }: { poke: PokeState }) {
  const pal = usePalette();
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!body.current) return;
    const t = clock.elapsedTime;
    const pop = poke.hovered ? 0.35 : Math.max(0, Math.sin(t * 1.3)) * 0.25;
    body.current.position.y = pop + pokePulse(poke.sincePoke(), 0.7) * 0.5;
    body.current.rotation.y += (live.pointer.x * 0.8 - body.current.rotation.y) * 0.08;
  });
  return (
    <group ref={body}>
      <mesh scale={[1, 0.9, 1]}>
        <sphereGeometry args={[0.6, 16, 12]} />
        <Toon color={pal.rock} />
      </mesh>
      <mesh position={[0, -0.05, 0.55]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <Toon color={pal.flag} />
      </mesh>
      <Eyes z={0.5} y={0.18} spread={0.18} />
      {/* scanner visor */}
      <mesh position={[0, 0.2, 0.42]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.6, 0.16, 0.12]} />
        <Toon color={pal.hivis} />
      </mesh>
    </group>
  );
}

/** Glossopteris leaf fossil pressed into the sandstone. Sways; click = flutter. */
export function Fossil({ poke }: { poke: PokeState }) {
  const pal = usePalette();
  const leaf = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!leaf.current) return;
    const amp = 0.08 + pokePulse(poke.sincePoke(), 1.2) * 0.5 + (poke.hovered ? 0.15 : 0);
    leaf.current.rotation.z = Math.sin(clock.elapsedTime * 2.2) * amp;
  });
  return (
    <group ref={leaf}>
      <mesh scale={[0.7, 1.6, 0.12]}>
        <sphereGeometry args={[1, 18, 12]} />
        <Toon color={pal.hivisDeep} />
      </mesh>
      <mesh position={[0, -0.2, 0.13]}>
        <boxGeometry args={[0.05, 2.6, 0.04]} />
        <meshBasicMaterial color={pal.ink} />
      </mesh>
      {[-0.8, -0.3, 0.2, 0.7].map((y) => (
        <group key={y} position={[0, y, 0.13]}>
          <mesh rotation={[0, 0, 0.9]} position={[0.22, 0.12, 0]}>
            <boxGeometry args={[0.03, 0.55, 0.03]} />
            <meshBasicMaterial color={pal.ink} />
          </mesh>
          <mesh rotation={[0, 0, -0.9]} position={[-0.22, 0.12, 0]}>
            <boxGeometry args={[0.03, 0.55, 0.03]} />
            <meshBasicMaterial color={pal.ink} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Lumpy, a Grade G7 coal lump. Bounces; squishes on click. */
export function Lumpy({ poke }: { poke: PokeState }) {
  const pal = usePalette();
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!root.current) return;
    const t = clock.elapsedTime;
    const squish = pokePulse(poke.sincePoke(), 0.5);
    root.current.position.y = Math.abs(Math.sin(t * 2.4)) * (poke.hovered ? 0.3 : 0.12);
    root.current.scale.set(1 + squish * 0.35, 1 - squish * 0.35, 1 + squish * 0.35);
    root.current.rotation.y += (live.pointer.x * 0.6 - root.current.rotation.y) * 0.08;
  });
  return (
    <group ref={root}>
      <mesh>
        <dodecahedronGeometry args={[0.55, 0]} />
        <Toon color={pal.coal} />
      </mesh>
      <mesh position={[-0.15, 0.08, 0.47]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshBasicMaterial color={pal.paper} />
      </mesh>
      <mesh position={[0.15, 0.08, 0.47]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshBasicMaterial color={pal.paper} />
      </mesh>
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.5, 0.18, 0.05]} />
        <Toon color={pal.hivis} />
      </mesh>
    </group>
  );
}

/** Two rulers arguing (MECL 6.80 m vs CMPDI 8.42 m). Click = they straighten up and touch tips. */
export function Rulers({ poke }: { poke: PokeState }) {
  const pal = usePalette();
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const truce = pokePulse(poke.sincePoke(), 2.5);
    const lean = (poke.hovered ? 0.4 : 0.22 + Math.sin(t * 3) * 0.06) * (1 - truce);
    if (a.current) a.current.rotation.z = -lean - truce * 0.12;
    if (b.current) b.current.rotation.z = lean + truce * 0.12;
  });
  const Ruler = ({ height, color }: { height: number; color: string }) => (
    <group>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.3, height, 0.12]} />
        <Toon color={color} />
      </mesh>
      {Array.from({ length: Math.floor(height / 0.15) }, (_, i) => (
        <mesh key={i} position={[-0.08, 0.1 + i * 0.15, 0.065]}>
          <boxGeometry args={[i % 2 ? 0.08 : 0.14, 0.02, 0.01]} />
          <meshBasicMaterial color={pal.coal} />
        </mesh>
      ))}
    </group>
  );
  return (
    <group>
      <group ref={a} position={[-0.45, 0, 0]}>
        <Ruler height={1.0} color={pal.paper} />
      </group>
      <group ref={b} position={[0.45, 0, 0]}>
        <Ruler height={1.25} color={pal.hivis} />
      </group>
      <Html position={[-0.6, -0.25, 0.2]} center transform distanceFactor={4} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <span className="paper-tag">MECL 6.80</span>
      </Html>
      <Html position={[0.7, -0.25, 0.2]} center transform distanceFactor={4} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <span className="paper-tag paper-tag--hot">CMPDI 8.42</span>
      </Html>
    </group>
  );
}

/** Hat rack with four role hats. The hovered rack wobbles; click lifts the hats. */
export function HatRack({ poke }: { poke: PokeState }) {
  const pal = usePalette();
  const hats = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!hats.current) return;
    const t = clock.elapsedTime;
    const lift = pokePulse(poke.sincePoke(), 0.9);
    hats.current.children.forEach((h, i) => {
      h.position.y = 0.95 + Math.sin(t * 3 + i) * (poke.hovered ? 0.08 : 0.02) + Math.sin(lift * Math.PI) * 0.4 * ((i % 2) + 1) * 0.5;
      h.rotation.z = Math.sin(t * 2 + i * 1.3) * 0.08;
    });
  });
  const colors = [pal.hivis, pal.paper, pal.flag, pal.hivisDeep];
  return (
    <group>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.6, 0.1, 0.3]} />
        <Toon color={pal.paperDeep} />
      </mesh>
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} position={[x, 0.15, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.3]} />
          <Toon color={pal.paperDeep} />
        </mesh>
      ))}
      <group ref={hats}>
        {colors.map((c, i) => (
          <group key={i} position={[-0.95 + i * 0.63, 0.95, 0]}>
            <mesh position={[0, -0.3, 0]}>
              <sphereGeometry args={[0.26, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <Toon color={c} />
            </mesh>
            <mesh position={[0, -0.3, 0.03]}>
              <cylinderGeometry args={[0.32, 0.32, 0.04, 16]} />
              <Toon color={c} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/** Bedrock tortoise. Blinks; pulls its head in when poked or hovered. */
export function Tortoise({ poke }: { poke: PokeState }) {
  const pal = usePalette();
  const head = useRef<THREE.Group>(null);
  const lids = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const hide = poke.hovered ? 1 : pokePulse(poke.sincePoke(), 2);
    if (head.current) head.current.position.z = 1.05 - hide * 0.55;
    if (lids.current) lids.current.scale.y = t % 4 < 0.15 ? 1 : 0.01;
  });
  return (
    <group>
      <mesh scale={[1.2, 0.8, 1.2]}>
        <sphereGeometry args={[1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Toon color={pal.hivisDeep} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.25, 1.25, 0.12, 20]} />
        <Toon color={pal.paperDeep} />
      </mesh>
      <group ref={head} position={[0, 0.25, 1.05]}>
        <mesh>
          <sphereGeometry args={[0.32, 14, 10]} />
          <Toon color={pal.paperDeep} />
        </mesh>
        <Eyes z={0.28} y={0.08} spread={0.12} size={0.05} />
        <group ref={lids} position={[0, 0.08, 0.29]}>
          <mesh>
            <boxGeometry args={[0.4, 0.09, 0.02]} />
            <meshBasicMaterial color={pal.paperDeep} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
