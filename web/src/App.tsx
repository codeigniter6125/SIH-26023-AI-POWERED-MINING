import { Suspense, lazy, useEffect, useState } from "react";
import { COPY } from "./config/copy";
import { STOPS } from "./config/world";
import { isMobileWidth, queryFlag, shouldStartFlat } from "./lib/device";
import { useSmoothScroll } from "./lib/useSmoothScroll";
import { live, store, useWorld } from "./state/store";
import { Cursor } from "./ui/Interactive";
import { FieldNote, Header, Loader } from "./ui/Chrome";
import { FlatWorld } from "./fallback/FlatWorld";
import { Alluvium, Collar, Sandstone } from "./stops/TopStops";
import { Bedrock, CoreShed, Interburden, SeamIX, SeamX } from "./stops/DeepStops";

// The 3D scene is the heavy part; load it on demand so text paints first.
const WorldCanvas = lazy(() => import("./scene/WorldCanvas"));

function DebugReadout() {
  const stopIndex = useWorld((s) => s.stopIndex);
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setP(live.progress), 100);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed bottom-2 left-2 z-50 sticker !shadow-sticker-sm px-2 py-1 font-mono text-xs">
      stop {stopIndex} · {STOPS[stopIndex]?.id} · p={p.toFixed(3)}
    </div>
  );
}

export default function App() {
  const flat = useWorld((s) => s.flat);
  const [mobile, setMobile] = useState(() => isMobileWidth());

  useEffect(() => {
    store.set({ flat: shouldStartFlat() });
    const onResize = () => setMobile(isMobileWidth());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (flat) store.set({ ready: true });
  }, [flat]);

  useSmoothScroll(!flat);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] btn btn-primary">
        {COPY.skip}
      </a>
      {flat ? (
        <FlatWorld />
      ) : (
        <Suspense fallback={null}>
          <WorldCanvas mobile={mobile} />
        </Suspense>
      )}
      {!flat && <Loader />}
      <Header />
      <main id="main" className="relative">
        <Collar />
        <Alluvium />
        <Sandstone />
        <SeamIX />
        <Interburden />
        <SeamX />
        <Bedrock />
        <CoreShed />
      </main>
      <FieldNote />
      {!flat && <Cursor />}
      <div className="grain" aria-hidden="true" />
      {queryFlag("debug") && <DebugReadout />}
    </>
  );
}
