import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COPY, FIELD_NOTES, STOP_OBJECTS } from "../config/copy";
import { BEDROCK_BOTTOM_M, LOADER_BUILD_MS, STOPS, STRATA, type StopId } from "../config/world";
import { store, useWorld } from "../state/store";
import { play, setSoundEnabled } from "../lib/sound";
import { prefersReducedMotion } from "../lib/device";
import { scrollToStop } from "../lib/useSmoothScroll";
import { Icon } from "./Doodles";

gsap.registerPlugin(ScrollTrigger);

const LOADER_GRACE_MS = 2500;

export function setTheme(theme: "day" | "night") {
  document.documentElement.dataset.theme = theme;
  store.set({ theme });
}

function ToggleButton({ on, onClick, label, icon }: { on: boolean; onClick: () => void; label: string; icon: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`chip !min-h-[40px] !px-3 pointer-events-auto ${on ? "!bg-hivis !text-[#17140f]" : ""}`}
      title={label}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

/** Top bar: brand, depth gauge, day/night, sound, flat mode. */
export function Header() {
  const stopIndex = useWorld((s) => s.stopIndex);
  const theme = useWorld((s) => s.theme);
  const sound = useWorld((s) => s.sound);
  const flat = useWorld((s) => s.flat);
  const stop = STOPS[Math.min(stopIndex, STOPS.length - 1)];

  return (
    <header className="fixed top-0 inset-x-0 z-40 pointer-events-none">
      <div className="flex items-center justify-between gap-2 px-4 md:px-8 pt-4">
        <a
          href="#collar"
          className="pointer-events-auto sticker !shadow-sticker-sm flex items-center gap-2 px-3 py-2 -rotate-1"
          onClick={(e) => {
            e.preventDefault();
            scrollToStop(0);
          }}
        >
          <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
            <rect x="4" y="1.5" width="14" height="23" rx="2" fill="var(--hivis)" stroke="var(--ink)" strokeWidth="3" />
            <rect x="4" y="13" width="14" height="5" fill="var(--ink)" />
          </svg>
          <span className="display text-2xl leading-none">{COPY.brand}</span>
          <span className="tag hidden lg:inline text-ink-soft ml-1">{COPY.brandTag}</span>
        </a>

        <div className="flex items-center gap-2">
          <ToggleButton
            on={theme === "night"}
            onClick={() => {
              play("click");
              setTheme(theme === "night" ? "day" : "night");
            }}
            label={COPY.header.night}
            icon={<Icon name={theme === "night" ? "sun" : "moon"} />}
          />
          <ToggleButton
            on={sound}
            onClick={() => {
              setSoundEnabled(!sound);
              store.set({ sound: !sound });
              if (!sound) play("pop");
            }}
            label={COPY.header.sound}
            icon={<Icon name={sound ? "sound" : "mute"} />}
          />
          <ToggleButton
            on={flat}
            onClick={() => store.set({ flat: !flat })}
            label={COPY.header.flat}
            icon={<Icon name={flat ? "cube" : "flat"} />}
          />
        </div>
      </div>

      {/* depth gauge */}
      <nav aria-label="Depth gauge" className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col items-end gap-2 pointer-events-auto">
        <span className="tag text-ink-soft">{COPY.header.depth}</span>
        <ol className="flex flex-col gap-1.5 items-end">
          {STOPS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollToStop(i)}
                className={`gauge-tick ${i === stopIndex ? "is-active" : ""}`}
                aria-current={i === stopIndex ? "step" : undefined}
                aria-label={`Go to ${s.id.replace("-", " ")}, ${s.depthLabel}`}
              >
                <span className="gauge-tick__label tag">{s.depthLabel}</span>
                <span className="gauge-tick__bar" />
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <p className="sr-only" aria-live="polite">
        {stop.depthLabel}
      </p>
    </header>
  );
}

/** "Spudding in": the scene builds itself behind this; a depth counter runs 0 → 312 m. */
export function Loader() {
  const ready = useWorld((s) => s.ready);
  const [depth, setDepth] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / LOADER_BUILD_MS);
      setDepth(Math.round(k * BEDROCK_BOTTOM_M));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Safety net: never trap the page behind the loader if the scene stalls.
    const fallback = setTimeout(() => store.set({ ready: true }), LOADER_BUILD_MS + LOADER_GRACE_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setGone(true), 600);
    return () => clearTimeout(t);
  }, [ready]);

  if (gone) return null;
  return (
    <div className={`loader ${ready ? "is-done" : ""}`} role="status" aria-live="polite">
      <div className="sticker px-6 py-5 rotate-[-2deg] min-w-[260px]">
        <p className="display text-4xl">{COPY.loader.title}…</p>
        <p className="tag text-ink-soft mt-1">{COPY.loader.sub}</p>
        <div className="loader__core mt-4" aria-hidden="true">
          {STRATA.map((s) => (
            <span
              key={s.id}
              style={{
                flexGrow: s.toM - s.fromM,
                background: `var(${s.colorVar})`,
                opacity: depth >= s.fromM ? 1 : 0.15,
              }}
            />
          ))}
        </div>
        <p className="font-mono text-2xl mt-3 tabular-nums">{depth.toString().padStart(3, "0")} m</p>
      </div>
    </div>
  );
}

/** Field note dialog opened from 3D objects or HTML chips. */
export function FieldNote() {
  const id = useWorld((s) => s.openNote);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!id) return;
    opener.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && store.set({ openNote: null });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [id]);

  if (!id) return null;
  const note = FIELD_NOTES[id];
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" onClick={() => store.set({ openNote: null })}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-title"
        className="sticker max-w-md w-full p-6 rotate-[1.5deg] note-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="tag text-ink-soft">
            {COPY.fieldNote.label} · {note.name}
          </p>
          <button ref={closeRef} type="button" className="chip !min-h-[36px] !px-2" onClick={() => store.set({ openNote: null })} aria-label={COPY.fieldNote.close}>
            <Icon name="x" />
          </button>
        </div>
        <h3 id="note-title" className="display text-3xl mt-2">
          {note.title}
        </h3>
        <p className="mt-3 text-ink-soft">{note.body}</p>
        <p className="mt-4 font-display font-bold">“{note.bubble}”</p>
      </div>
    </div>
  );
}

/** Keyboard/screen-reader route to the same objects you can poke in 3D. */
export function PokeChips({ stop }: { stop: StopId }) {
  const ids = STOP_OBJECTS[stop];
  if (!ids.length) return null;
  return (
    <div className="mt-6 pointer-events-auto">
      <p className="tag text-ink-soft mb-2">{COPY.poke}</p>
      <ul className="flex flex-wrap gap-2">
        {ids.map((id) => (
          <li key={id}>
            <button
              type="button"
              className="chip"
              onMouseEnter={() => store.set({ hovered: id })}
              onMouseLeave={() => store.get().hovered === id && store.set({ hovered: null })}
              onFocus={() => store.set({ hovered: id })}
              onBlur={() => store.get().hovered === id && store.set({ hovered: null })}
              onClick={() => {
                play("pop");
                store.poke(id);
                store.set({ openNote: id });
              }}
            >
              {FIELD_NOTES[id].name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One stop of the journey. Full-viewport section; its `[data-reveal]` children
 * slide in when the camera arrives and out when it leaves.
 */
export function Stop({ id, side, children, className = "" }: { id: StopId; side: "left" | "right" | "center"; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      gsap.fromTo(
        items,
        { y: 70, opacity: 0, rotate: side === "left" ? -4 : 4 },
        {
          y: 0,
          opacity: 1,
          rotate: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: ref.current, start: "top 70%", end: "bottom 25%", toggleActions: "play reverse play reverse" },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [side]);

  const align = side === "left" ? "md:justify-start" : side === "right" ? "md:justify-end" : "md:justify-center";
  return (
    <section
      id={id}
      ref={ref}
      data-stop={id}
      aria-labelledby={`${id}-title`}
      className={`stop relative z-10 min-h-[100svh] flex items-center justify-center ${align} px-4 md:px-16 lg:px-24 py-24 pointer-events-none ${className}`}
    >
      {children}
    </section>
  );
}
