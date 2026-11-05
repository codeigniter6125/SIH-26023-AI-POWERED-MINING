import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import * as THREE from "three";
import { CAMERA_SPRING, DPR_CAP, DRAG_LOOK_MAX_RAD, POINTER_PARALLAX, STOPS } from "../config/world";
import { COPY } from "../config/copy";
import { sampleStops } from "../lib/path";
import { stepSpring3 } from "../lib/spring";
import { isTouch, queryFlag } from "../lib/device";
import { live, store, useWorld } from "../state/store";
import { World } from "./World";

const DRAG_SENSITIVITY = 0.004;
const DRAG_RETURN = 0.06;

/** Camera follows the scroll path through a damped spring (slight overshoot), plus pointer parallax and drag-to-look. */
function CameraRig({ mobile }: { mobile: boolean }) {
  const camera = useThree((s) => s.camera);
  const pos = useRef<number[] | null>(null);
  const vel = useRef([0, 0, 0]);
  const tgt = useRef<number[] | null>(null);
  const tvel = useRef([0, 0, 0]);
  const look = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const { position, target } = sampleStops(STOPS, live.progress, mobile);
    const parallax = mobile ? 0 : POINTER_PARALLAX;
    const goal = [position[0] + live.pointer.x * parallax, position[1] + live.pointer.y * parallax * 0.6, position[2]];
    if (!pos.current || !tgt.current) {
      pos.current = [...goal];
      tgt.current = [...target];
    }
    stepSpring3(pos.current, vel.current, goal, dt, CAMERA_SPRING);
    stepSpring3(tgt.current, tvel.current, target, dt, CAMERA_SPRING);

    camera.position.set(pos.current[0], pos.current[1], pos.current[2]);
    look.current.set(tgt.current[0], tgt.current[1], tgt.current[2]);
    camera.lookAt(look.current);
    // drag-to-look: rotate around the camera's own axes after lookAt
    camera.rotateY(live.drag.x);
    camera.rotateX(live.drag.y);
    live.drag.x += (0 - live.drag.x) * (dragging ? 0 : DRAG_RETURN);
    live.drag.y += (0 - live.drag.y) * (dragging ? 0 : DRAG_RETURN);
  });
  return null;
}

let dragging = false;

export default function WorldCanvas({ mobile }: { mobile: boolean }) {
  const debug = queryFlag("debug");
  const theme = useWorld((s) => s.theme);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      live.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      live.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Drag on empty canvas to look around (not on touch, where drag means scroll).
  const last = useRef<{ x: number; y: number } | null>(null);
  const touch = isTouch();
  const onDown = (e: React.PointerEvent) => {
    if (touch) return;
    dragging = true;
    last.current = { x: e.clientX, y: e.clientY };
  };
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging || !last.current) return;
      const clamp = (v: number) => THREE.MathUtils.clamp(v, -DRAG_LOOK_MAX_RAD, DRAG_LOOK_MAX_RAD);
      live.drag.x = clamp(live.drag.x - (e.clientX - last.current.x) * DRAG_SENSITIVITY);
      live.drag.y = clamp(live.drag.y - (e.clientY - last.current.y) * DRAG_SENSITIVITY);
      last.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      dragging = false;
      last.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" onPointerDown={onDown} role="img" aria-label={COPY.canvasLabel} data-theme-key={theme}>
      <Canvas
        dpr={[1, mobile ? DPR_CAP.mobile : DPR_CAP.desktop]}
        camera={{ fov: mobile ? 50 : 35, near: 0.1, far: 400, position: STOPS[0].camera }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onPointerMissed={() => store.set({ hovered: null })}
      >
        <CameraRig mobile={mobile} />
        <World mobile={mobile} />
        {debug && <Stats />}
      </Canvas>
    </div>
  );
}
