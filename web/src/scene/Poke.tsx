import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { FIELD_NOTES, type ObjectId } from "../config/copy";
import { STOPS } from "../config/world";
import { store, useWorld } from "../state/store";
import { play, type SoundKind } from "../lib/sound";

const HOVER_LIFT = 0.35;
const LIFT_SPEED = 10;

export interface PokeState {
  hovered: boolean;
  /** Seconds since the last click (Infinity if never). Call inside useFrame. */
  sincePoke: () => number;
}

interface PokeProps {
  id: ObjectId;
  /** Where the speech bubble sits, relative to the group. */
  bubbleAt?: [number, number, number];
  sound?: SoundKind;
  /** Lift the whole object a little on hover (a small "jump"). */
  lift?: boolean;
  children: (s: PokeState) => ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Wraps a 3D object: hover/click handling, cursor label, speech bubble,
 * and the "Field note" it opens. The HTML chips in each stop call the same store actions.
 */
export function Poke({ id, bubbleAt = [0, 2.4, 0], sound = "pop", lift = true, children, ...group }: PokeProps) {
  const note = FIELD_NOTES[id];
  const hoveredId = useWorld((s) => s.hovered);
  const pokes = useWorld((s) => s.pokes[id] ?? 0);
  const activeStop = useWorld((s) => STOPS[s.stopIndex]?.id);
  const ready = useWorld((s) => s.ready);
  const [cycleOn, setCycleOn] = useState(false);
  const lastPoke = useRef(-Infinity);
  const clock = useRef(0);
  const inner = useRef<THREE.Group>(null);
  const hovered = hoveredId === id;

  useEffect(() => {
    if (pokes > 0) lastPoke.current = clock.current;
  }, [pokes]);

  // Bubbles of the active stop take turns so the scene never shouts all at once.
  useEffect(() => {
    if (!ready || activeStop !== note.stop) {
      setCycleOn(false);
      return;
    }
    const peers = (Object.values(FIELD_NOTES) as { id: ObjectId; stop: string }[]).filter((n) => n.stop === note.stop);
    const slot = peers.findIndex((n) => n.id === id);
    const period = 3200;
    const tick = () => {
      const turn = Math.floor(Date.now() / period) % peers.length;
      setCycleOn(turn === slot);
    };
    tick();
    const t = setInterval(tick, 400);
    return () => clearInterval(t);
  }, [activeStop, ready, note.stop, id]);

  useFrame((_, dt) => {
    clock.current += dt;
    if (!inner.current || !lift) return;
    const goal = hovered ? HOVER_LIFT : 0;
    inner.current.position.y += (goal - inner.current.position.y) * Math.min(1, dt * LIFT_SPEED);
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    store.set({ hovered: id });
  };
  const onOut = () => {
    if (store.get().hovered === id) store.set({ hovered: null });
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    play(sound);
    store.poke(id);
    store.set({ openNote: id });
  };

  const state: PokeState = { hovered, sincePoke: () => clock.current - lastPoke.current };
  const showBubble = hovered || cycleOn;

  return (
    <group {...group} scale={group.scale ?? 1}>
      <group ref={inner} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        {children(state)}
      </group>
      {showBubble && (
        <Html position={bubbleAt} center zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
          <div className="speech" role="presentation">
            {note.bubble}
          </div>
        </Html>
      )}
    </group>
  );
}

/** Time-based helper for click animations: 1 → 0 over `duration` seconds after a poke. */
export const pokePulse = (sincePoke: number, duration = 0.8) =>
  sincePoke < duration ? 1 - sincePoke / duration : 0;
