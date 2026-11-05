/** Hand-drawn bits: wobbly underline, star, arrow, scribble. Inline SVG, coloured by currentColor. */

export function Underlined({ children, color = "var(--hivis)" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        className="absolute left-[-4%] bottom-[-0.08em] w-[108%] h-[0.42em] z-0"
        viewBox="0 0 300 30"
        preserveAspectRatio="none"
      >
        <path
          d="M4 18 C 40 8, 80 24, 120 15 S 200 6, 240 16 S 285 22, 296 12"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          style={{ strokeDasharray: 400, animation: "draw 900ms 300ms both cubic-bezier(.6,.1,.3,1)" }}
        />
      </svg>
    </span>
  );
}

export function Star({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40" className={className}>
      <path
        d="M20 3 L23.5 15.5 L37 16 L26 23.5 L30.5 37 L20 28.5 L9 36.5 L13.5 23.5 L3 15.8 L16.5 15.2 Z"
        fill="var(--hivis)"
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Arrow({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg aria-hidden="true" width="96" height="56" viewBox="0 0 96 56" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M4 10 C 30 4, 60 14, 78 40" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      <path d="M66 38 L80 44 L82 28" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="80" height="30" viewBox="0 0 80 30" className={className}>
      <path
        d="M3 20 C 10 4, 16 28, 24 12 S 36 26, 44 10 S 58 26, 66 12 S 74 18, 77 14"
        fill="none"
        stroke="var(--flag)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Small inline icons (no emoji). */
export function Icon({ name, title }: { name: "sun" | "moon" | "sound" | "mute" | "cube" | "flat" | "arrow-down" | "x"; title?: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<typeof name, React.ReactNode> = {
    sun: (
      <>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
      </>
    ),
    moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />,
    sound: (
      <>
        <path d="M4 9v6h4l5 4V5L8 9z" />
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
      </>
    ),
    mute: (
      <>
        <path d="M4 9v6h4l5 4V5L8 9z" />
        <path d="M17 9l5 6M22 9l-5 6" />
      </>
    ),
    cube: <path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3zM12 12l8.5-4.7M12 12v9.5M12 12L3.5 7.3" />,
    flat: <path d="M3 6h18M3 12h18M3 18h18" />,
    "arrow-down": <path d="M12 4v15M5 12l7 7 7-7" />,
    x: <path d="M5 5l14 14M19 5L5 19" />,
  };
  return (
    <svg {...common} aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title && <title>{title}</title>}
      {paths[name]}
    </svg>
  );
}
