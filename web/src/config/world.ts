/**
 * World layout: strata, stops and the camera path.
 * Units are world units; 1 unit = 6 m of real depth (DEPTH_SCALE).
 * Depths follow borehole NK-094 as documented in docs/design_doc.md §A4.
 */

export const DEPTH_SCALE = 6; // metres per world unit
export const BLOCK_WIDTH = 22;
export const BLOCK_DEPTH = 12;
export const FACE_Z = BLOCK_DEPTH / 2; // the cut face we look at
export const BEDROCK_BOTTOM_M = 312;

export type StopId =
  | "collar"
  | "alluvium"
  | "sandstone"
  | "seam-ix"
  | "interburden"
  | "seam-x"
  | "bedrock"
  | "core-shed";

export interface Stratum {
  id: string;
  label: string;
  fromM: number;
  toM: number;
  /** CSS variable name the colour comes from (keeps 3D and CSS in step). */
  colorVar: string;
  /** Tone tweak applied on top of the variable, -1..1 (negative = darker). */
  shade: number;
}

export const STRATA: Stratum[] = [
  { id: "alluvium", label: "ALLUVIUM 0–42 M", fromM: 0, toM: 42, colorVar: "--stratum", shade: 0 },
  { id: "sandstone", label: "SANDSTONE 42–114.3 M", fromM: 42, toM: 114.3, colorVar: "--hivis-pale", shade: 0 },
  { id: "seam-ix", label: "SEAM IX 114.3–122.7 M", fromM: 114.3, toM: 122.7, colorVar: "--coal", shade: 0 },
  { id: "interburden", label: "INTERBURDEN 122.7–131 M", fromM: 122.7, toM: 131, colorVar: "--rock", shade: 0 },
  { id: "seam-x", label: "SEAM X 131–139 M", fromM: 131, toM: 139, colorVar: "--coal", shade: 0 },
  { id: "bedrock", label: "BASEMENT 139–312 M", fromM: 139, toM: BEDROCK_BOTTOM_M, colorVar: "--rock", shade: -0.25 },
];

export const mToY = (m: number) => -m / DEPTH_SCALE;

export interface Stop {
  id: StopId;
  /** The depth readout shown in the header gauge. */
  depthLabel: string;
  /** Camera position and look-at target in world space. */
  camera: [number, number, number];
  target: [number, number, number];
  /** Simplified camera for phones: straight down, no side swings. */
  mobileCamera: [number, number, number];
  /** Which side the HTML card sits on, so the cut face stays visible. */
  side: "left" | "right" | "center";
}

const mid = (a: number, b: number) => mToY((a + b) / 2);

export const STOPS: Stop[] = [
  { id: "collar", depthLabel: "0 m · collar", camera: [2, 10, 27], target: [-6.5, 1, 0], mobileCamera: [0, 9, 36], side: "left" },
  { id: "alluvium", depthLabel: "0–42 m", camera: [-6, mid(0, 42) + 1, 20], target: [2, mid(0, 42), FACE_Z], mobileCamera: [0, mid(0, 42), 30], side: "right" },
  { id: "sandstone", depthLabel: "42–114 m", camera: [8, mid(42, 114) + 0.5, 21], target: [-2, mid(42, 114), FACE_Z], mobileCamera: [0, mid(42, 114), 30], side: "left" },
  { id: "seam-ix", depthLabel: "114.3–122.7 m", camera: [-4, mid(114.3, 122.7) + 0.8, 19], target: [1, mid(114.3, 122.7), FACE_Z], mobileCamera: [0, mid(114.3, 122.7), 26], side: "right" },
  { id: "interburden", depthLabel: "122.7–131 m", camera: [5, mid(122.7, 131) + 0.4, 19.5], target: [-1, mid(122.7, 131), FACE_Z], mobileCamera: [0, mid(122.7, 131), 26], side: "left" },
  { id: "seam-x", depthLabel: "131–139 m", camera: [-5, mid(131, 139) - 0.5, 19], target: [1, mid(131, 139), FACE_Z], mobileCamera: [0, mid(131, 139), 30], side: "right" },
  { id: "bedrock", depthLabel: "139–312 m", camera: [3, mToY(175), 20], target: [-1, mToY(178), FACE_Z], mobileCamera: [0, mToY(175), 30], side: "left" },
  { id: "core-shed", depthLabel: "back on top", camera: [38, -6, 78], target: [-4, -24, 0], mobileCamera: [0, -20, 120], side: "center" },
];

/** Camera spring: stiffness/damping chosen for a slight overshoot (damping ratio ≈ 0.64). */
export const CAMERA_SPRING = { stiffness: 120, damping: 14 } as const;
export const POINTER_PARALLAX = 0.6;
export const DRAG_LOOK_MAX_RAD = 0.21; // ≈ 12°
export const DPR_CAP = { desktop: 2, mobile: 1.5 } as const;
export const MOBILE_BREAKPOINT_PX = 768;
export const LOADER_BUILD_MS = 1800;
