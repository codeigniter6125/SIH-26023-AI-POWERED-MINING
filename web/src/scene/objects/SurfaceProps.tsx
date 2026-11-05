import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Toon, usePalette } from "../toon";
import { live } from "../../state/store";
import { pokePulse, type PokeState } from "../Poke";

const RIG_HEIGHT = 5.2;
const LEG_SPREAD = 0.9;

/** Rig 7: four-legged mast, crown block, spinning drill pipe. Click = plunge. */
export function Rig({ poke }: { poke: PokeState }) {
  const pal = usePalette();
  const pipe = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!pipe.current) return;
    pipe.current.rotation.y += dt * (poke.hovered ? 9 : 3);
    pipe.current.position.y = -pokePulse(poke.sincePoke(), 1) * 1.2;
  });
  const legs: [number, number][] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  return (
    <group>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[3, 0.5, 2.6]} />
        <Toon color={pal.paperDeep} />
      </mesh>
      {legs.map(([sx, sz]) => {
        const tilt = Math.atan2(LEG_SPREAD, RIG_HEIGHT);
        return (
          <mesh
            key={`${sx}${sz}`}
            position={[sx * LEG_SPREAD * 0.55, 0.5 + RIG_HEIGHT / 2, sz * LEG_SPREAD * 0.55]}
            rotation={[sz * -tilt, 0, sx * tilt]}
          >
            <boxGeometry args={[0.16, RIG_HEIGHT, 0.16]} />
            <Toon color={pal.hivis} />
          </mesh>
        );
      })}
      {[1.6, 3.0, 4.2].map((y) => (
        <mesh key={y} position={[0, 0.5 + y, 0]}>
          <boxGeometry args={[LEG_SPREAD * (2.1 - y * 0.32), 0.1, LEG_SPREAD * (2.1 - y * 0.32)]} />
          <Toon color={pal.hivisDeep} />
        </mesh>
      ))}
      <mesh position={[0, 0.5 + RIG_HEIGHT + 0.15, 0]}>
        <boxGeometry args={[0.7, 0.35, 0.7]} />
        <Toon color={pal.flag} />
      </mesh>
      <group ref={pipe}>
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 5, 8]} />
          <Toon color={pal.rock} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.45, 0.3, 0.45]} />
          <Toon color={pal.coal} />
        </mesh>
      </group>
      {/* doghouse */}
      <mesh position={[1.9, 0.9, -0.4]}>
        <boxGeometry args={[1.2, 1.3, 1.4]} />
        <Toon color={pal.paper} />
      </mesh>
      <Html position={[1.9, 1.9, 0.4]} center transform distanceFactor={9} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <span className="paper-tag">RIG 7</span>
      </Html>
    </group>
  );
}

/** Dumper truck driving a slow loop. Click = honk (sound is in Poke). */
export function Dumper({ poke, radius = 2.4 }: { poke: PokeState; radius?: number }) {
  const pal = usePalette();
  const root = useRef<THREE.Group>(null);
  const bed = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!root.current) return;
    const speed = poke.hovered ? 0.05 : 0.35;
    const a = clock.elapsedTime * speed;
    root.current.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    root.current.rotation.y = -a;
    if (bed.current) bed.current.rotation.z = pokePulse(poke.sincePoke(), 1.2) * 0.6;
  });
  const wheels: [number, number][] = [
    [-0.7, 0.55],
    [0.7, 0.55],
    [-0.7, -0.55],
    [0.7, -0.55],
  ];
  return (
    <group ref={root}>
      <mesh position={[0.75, 0.75, 0]}>
        <boxGeometry args={[0.7, 0.8, 1]} />
        <Toon color={pal.hivis} />
      </mesh>
      <mesh ref={bed} position={[-0.25, 0.85, 0]}>
        <boxGeometry args={[1.3, 0.6, 1.1]} />
        <Toon color={pal.hivisDeep} />
      </mesh>
      {wheels.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.3, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.22, 12]} />
          <Toon color={pal.coal} />
        </mesh>
      ))}
    </group>
  );
}

/** Theo the theodolite: tripod + head that tracks the cursor. */
export function Theo({ poke }: { poke: PokeState }) {
  const pal = usePalette();
  const head = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!head.current) return;
    const goal = poke.hovered ? live.pointer.x * 1.4 : Math.sin(clock.elapsedTime * 0.4) * 0.8 + live.pointer.x * 0.4;
    head.current.rotation.y += (goal - head.current.rotation.y) * 0.08;
  });
  return (
    <group>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.3, 0.7, Math.sin(a) * 0.3]} rotation={[Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35]}>
            <cylinderGeometry args={[0.04, 0.05, 1.5, 6]} />
            <Toon color={pal.hivisDeep} />
          </mesh>
        );
      })}
      <group ref={head} position={[0, 1.55, 0]}>
        <mesh>
          <boxGeometry args={[0.45, 0.4, 0.35]} />
          <Toon color={pal.paper} />
        </mesh>
        <mesh position={[0, 0.05, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.35, 10]} />
          <Toon color={pal.coal} />
        </mesh>
      </group>
    </group>
  );
}
