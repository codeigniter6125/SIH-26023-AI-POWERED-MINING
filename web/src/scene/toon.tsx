import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { Outlines } from "@react-three/drei";
import { useWorld } from "../state/store";

/** 4 tone steps for MeshToonMaterial (design_doc §A3). */
const TONE_STEPS = [90, 160, 215, 255];
export const OUTLINE_THICKNESS = 0.035;

let gradient: THREE.DataTexture | null = null;
export function toonGradient(): THREE.DataTexture {
  if (gradient) return gradient;
  const data = new Uint8Array(TONE_STEPS.length * 4);
  TONE_STEPS.forEach((v, i) => data.set([v, v, v, 255], i * 4));
  gradient = new THREE.DataTexture(data, TONE_STEPS.length, 1, THREE.RGBAFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  return gradient;
}

export interface Palette {
  hivis: string;
  hivisDeep: string;
  hivisPale: string;
  paper: string;
  paperDeep: string;
  ink: string;
  outline: string;
  stratum: string;
  rock: string;
  coal: string;
  flag: string;
  sky: string;
}

const VARS: Record<keyof Palette, string> = {
  hivis: "--hivis",
  hivisDeep: "--hivis-deep",
  hivisPale: "--hivis-pale",
  paper: "--paper",
  paperDeep: "--paper-deep",
  ink: "--ink",
  outline: "--ink",
  stratum: "--stratum",
  rock: "--rock",
  coal: "--coal",
  flag: "--flag",
  sky: "--sky",
};

export function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const out = {} as Palette;
  (Object.keys(VARS) as (keyof Palette)[]).forEach((k) => {
    out[k] = css.getPropertyValue(VARS[k]).trim() || "#ff00ff";
  });
  return out;
}

/** Palette resolved from CSS variables; recomputed when the day/night theme flips. */
export function usePalette(): Palette {
  const theme = useWorld((s) => s.theme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => readPalette(), [theme]);
}

/** Toon material + thick outline. Use as the children of a mesh after its geometry. */
export function Toon({ color, outline = true, thickness = OUTLINE_THICKNESS }: { color: string; outline?: boolean; thickness?: number }) {
  const pal = usePalette();
  return (
    <>
      <meshToonMaterial color={color} gradientMap={toonGradient()} />
      {outline && <Outlines thickness={thickness} color={pal.outline} screenspace={false} />}
    </>
  );
}

export function ToonMesh({
  children,
  color,
  outline = true,
  ...props
}: { children: ReactNode; color: string; outline?: boolean } & JSX.IntrinsicElements["mesh"]) {
  return (
    <mesh {...props}>
      {children}
      <Toon color={color} outline={outline} />
    </mesh>
  );
}
