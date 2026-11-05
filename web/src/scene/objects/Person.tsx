import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Toon, usePalette } from "../toon";
import { live, useWorld } from "../../state/store";
import type { PokeState } from "../Poke";

const HEAD_YAW_MAX = 0.7;
const HEAD_PITCH_MAX = 0.3;
const WAVE_SPEED = 12;

interface PersonProps {
  vest: string;
  shirt: string;
  poke: PokeState;
  /** Extra prop in hand: "papers" for the desk officer, "hammer" for the geologist. */
  holding?: "papers" | "hammer";
  phase?: number;
}

/** Paper-doll person built from primitives: body, vest, head, hard hat, arms. Head follows the cursor. */
export function Person({ vest, shirt, poke, holding, phase = 0 }: PersonProps) {
  const pal = usePalette();
  const night = useWorld((s) => s.theme === "night");
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    if (body.current) body.current.scale.y = 1 + Math.sin(t * 2) * 0.02;
    if (head.current) {
      const yaw = THREE.MathUtils.clamp(live.pointer.x * 0.9, -HEAD_YAW_MAX, HEAD_YAW_MAX);
      const pitch = THREE.MathUtils.clamp(-live.pointer.y * 0.4, -HEAD_PITCH_MAX, HEAD_PITCH_MAX);
      head.current.rotation.y += (yaw - head.current.rotation.y) * 0.1;
      head.current.rotation.x += (pitch - head.current.rotation.x) * 0.1;
    }
    if (arm.current) {
      const waving = poke.hovered || poke.sincePoke() < 1.2;
      const goal = waving ? -2.6 + Math.sin(t * WAVE_SPEED) * 0.35 : -0.15 + Math.sin(t * 1.5) * 0.05;
      arm.current.rotation.z += (goal - arm.current.rotation.z) * 0.18;
    }
  });

  return (
    <group>
      <group ref={body}>
        {/* legs */}
        <mesh position={[-0.18, 0.45, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.9, 10]} />
          <Toon color={pal.coal} />
        </mesh>
        <mesh position={[0.18, 0.45, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.9, 10]} />
          <Toon color={pal.coal} />
        </mesh>
        {/* torso + vest */}
        <mesh position={[0, 1.35, 0]}>
          <capsuleGeometry args={[0.42, 0.6, 6, 14]} />
          <Toon color={shirt} />
        </mesh>
        <mesh position={[0, 1.3, 0.05]}>
          <cylinderGeometry args={[0.45, 0.47, 0.7, 14, 1, true]} />
          <Toon color={vest} outline={false} />
        </mesh>
        {/* left arm */}
        <mesh position={[-0.55, 1.35, 0]} rotation={[0, 0, 0.15]}>
          <capsuleGeometry args={[0.11, 0.6, 4, 8]} />
          <Toon color={shirt} />
        </mesh>
        {/* right arm (waves) */}
        <group ref={arm} position={[0.5, 1.7, 0]}>
          <mesh position={[0.05, -0.38, 0]}>
            <capsuleGeometry args={[0.11, 0.6, 4, 8]} />
            <Toon color={shirt} />
          </mesh>
          {holding === "hammer" && (
            <group position={[0.08, -0.8, 0.1]} rotation={[0, 0, 0.4]}>
              <mesh>
                <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
                <Toon color={pal.paperDeep} />
              </mesh>
              <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[0.28, 0.1, 0.1]} />
                <Toon color={pal.rock} />
              </mesh>
            </group>
          )}
        </group>
        {holding === "papers" && (
          <mesh position={[-0.35, 1.15, 0.42]} rotation={[0.2, 0.1, 0.1]}>
            <boxGeometry args={[0.5, 0.6, 0.14]} />
            <Toon color={pal.paper} />
          </mesh>
        )}
      </group>
      {/* head */}
      <group ref={head} position={[0, 2.25, 0]}>
        <mesh>
          <sphereGeometry args={[0.36, 16, 12]} />
          <Toon color={pal.paperDeep} />
        </mesh>
        <mesh position={[-0.12, 0.04, 0.32]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshBasicMaterial color={pal.coal} />
        </mesh>
        <mesh position={[0.12, 0.04, 0.32]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshBasicMaterial color={pal.coal} />
        </mesh>
        {/* hard hat */}
        <mesh position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Toon color={pal.hivis} />
        </mesh>
        <mesh position={[0, 0.12, 0.05]}>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 18]} />
          <Toon color={pal.hivis} />
        </mesh>
        {/* lamp: on at night */}
        <mesh position={[0, 0.3, 0.37]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 10]} />
          <meshBasicMaterial color={night ? pal.hivisPale : pal.rock} />
        </mesh>
        {night && <pointLight position={[0, 0.3, 0.8]} intensity={6} distance={5} color={pal.hivisPale} />}
      </group>
    </group>
  );
}
