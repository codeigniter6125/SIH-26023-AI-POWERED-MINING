import { useSyncExternalStore } from "react";
import type { ObjectId } from "../config/copy";

/** Tiny global store. Scroll progress lives in `live` (read every frame, never rendered). */
export interface WorldState {
  theme: "day" | "night";
  sound: boolean;
  flat: boolean;
  ready: boolean;
  stopIndex: number;
  openNote: ObjectId | null;
  hovered: ObjectId | null;
  /** Bumped when an object is poked, so the 3D object can play its click animation. */
  pokes: Partial<Record<ObjectId, number>>;
}

let state: WorldState = {
  theme: "day",
  sound: false,
  flat: false,
  ready: false,
  stopIndex: 0,
  openNote: null,
  hovered: null,
  pokes: {},
};

const listeners = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<WorldState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  poke(id: ObjectId) {
    store.set({ pokes: { ...state.pokes, [id]: (state.pokes[id] ?? 0) + 1 } });
  },
};

export function useWorld<T>(selector: (s: WorldState) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(state));
}

/** Mutable per-frame values, written by scroll/pointer handlers and read in useFrame. */
export const live = {
  progress: 0,
  pointer: { x: 0, y: 0 },
  drag: { x: 0, y: 0 },
};
