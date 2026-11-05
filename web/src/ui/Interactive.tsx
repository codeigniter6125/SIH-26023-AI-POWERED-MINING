import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { prefersReducedMotion, isTouch } from "../lib/device";
import { play } from "../lib/sound";
import { useWorld } from "../state/store";

const MAGNET_PX = 10;
const TILT_MAX_DEG = 8;

/** Button that leans toward the pointer (up to 10px). */
export const MagneticButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }>(
  function MagneticButton({ variant = "primary", className = "", onClick, children, ...rest }, ref) {
    const inner = useRef<HTMLSpanElement>(null);
    const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!inner.current || prefersReducedMotion()) return;
      const r = e.currentTarget.getBoundingClientRect();
      const dx = ((e.clientX - r.left) / r.width - 0.5) * 2 * MAGNET_PX;
      const dy = ((e.clientY - r.top) / r.height - 0.5) * 2 * MAGNET_PX;
      e.currentTarget.style.translate = `${dx}px ${dy}px`;
    };
    const onLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.style.translate = "0 0";
    };
    return (
      <button
        ref={ref}
        className={`btn btn-${variant} ${className}`}
        style={{ transition: "translate 220ms cubic-bezier(.3,1.6,.5,1), transform 120ms ease, box-shadow 120ms ease" }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={(e) => {
          play("click");
          onClick?.(e);
        }}
        data-cursor="button"
        {...rest}
      >
        <span ref={inner} className="inline-flex items-center gap-2">
          {children}
        </span>
      </button>
    );
  },
);

/** Sticker card: paper, ink border, hard shadow, small rotation, 3D tilt on hover. */
export function Sticker({
  children,
  rotate = -1.5,
  className = "",
  as: Tag = "div",
  tilt = true,
  ...rest
}: {
  children: ReactNode;
  rotate?: number;
  className?: string;
  as?: "div" | "article" | "li" | "section";
  tilt?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const base = `rotate(${rotate}deg)`;
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!tilt || !ref.current || prefersReducedMotion()) return;
    const r = ref.current.getBoundingClientRect();
    const rx = -((e.clientY - r.top) / r.height - 0.5) * TILT_MAX_DEG;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * TILT_MAX_DEG;
    ref.current.style.transform = `perspective(900px) ${base} rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = base;
  };
  return (
    <Tag
      ref={ref as never}
      className={`sticker pointer-events-auto ${className}`}
      style={{ transform: base, transition: "transform 260ms cubic-bezier(.3,1.4,.5,1)" }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Custom cursor: a dot that turns into a labelled ring over 3D objects,
 * a filled square over buttons, and hides over text inputs. Off on touch and reduced motion.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"default" | "button" | "input">("default");
  const hovered = useWorld((s) => s.hovered);
  const [enabled] = useState(() => !isTouch() && !prefersReducedMotion());

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("has-custom-cursor");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea")) setMode("input");
      else if (el?.closest("button, a, [data-cursor='button'], summary")) setMode("button");
      else setMode("default");
    };
    const loop = () => {
      cx += (x - cx) * 0.3;
      cy += (y - cy) * 0.3;
      if (dot.current) dot.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  const variant = hovered ? "poke" : mode;
  return (
    <div ref={dot} className="cursor" data-variant={variant} aria-hidden="true">
      <span className="cursor__shape" />
      {variant === "poke" && <span className="cursor__label">poke</span>}
    </div>
  );
}
