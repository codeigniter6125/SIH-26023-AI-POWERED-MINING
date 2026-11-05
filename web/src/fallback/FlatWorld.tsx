import { BEDROCK_BOTTOM_M, STOPS, STRATA } from "../config/world";
import { useWorld } from "../state/store";

/**
 * Flat 2D stand-in for the 3D world (reduced motion, no WebGL, low-power devices).
 * A static strata column with a marker for the current stop. No camera, no animation.
 */
export function FlatWorld() {
  const stopIndex = useWorld((s) => s.stopIndex);
  const markerPct = (stopIndex / (STOPS.length - 1)) * 100;
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <div className="absolute right-4 md:right-[12%] top-24 bottom-10 w-16 md:w-40 flex flex-col border-3 border-ink rounded-sm overflow-hidden shadow-sticker opacity-90">
        <div className="h-[6%] bg-paper-deep border-b-3 border-ink" style={{ background: "var(--paper-deep)" }} />
        {STRATA.map((s) => (
          <div
            key={s.id}
            className="border-b-2 border-ink last:border-b-0 relative"
            style={{ flexGrow: (s.toM - s.fromM) / BEDROCK_BOTTOM_M, background: `var(${s.colorVar})` }}
          >
            <span className="tag absolute left-1 top-1 hidden md:block" style={{ color: s.colorVar === "--coal" ? "#f3eee3" : undefined }}>
              {s.label.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
      <div
        className="absolute right-2 md:right-[calc(12%-12px)] w-[calc(4rem+16px)] md:w-[calc(10rem+24px)] h-1 bg-flag"
        style={{ top: `calc(6rem + (100% - 8.5rem) * ${markerPct / 100})` }}
      />
    </div>
  );
}
