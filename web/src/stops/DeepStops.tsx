import { useEffect, useRef, useState } from "react";
import { COPY, WORKSPACE_URL } from "../config/copy";
import { askCore, formatDuration, listDiscrepancies, shortHash, type Discrepancy, type QueryResponse } from "../lib/api";
import { play } from "../lib/sound";
import { scrollToStop } from "../lib/useSmoothScroll";
import { Star, Underlined } from "../ui/Doodles";
import { MagneticButton, Sticker } from "../ui/Interactive";
import { PokeChips, Stop } from "../ui/Chrome";

type QueryState =
  | { kind: "idle" }
  | { kind: "loading"; startedAt: number }
  | { kind: "done"; result: QueryResponse; seconds: number }
  | { kind: "error"; message: string };

const MAX_CITATIONS_SHOWN = 3;

/** Stop 4 · Seam IX · live query against /api/v1/query/ */
export function SeamIX() {
  const c = COPY.seamIx;
  const [q, setQ] = useState("");
  const [state, setState] = useState<QueryState>({ kind: "idle" });
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (state.kind !== "loading") return;
    const t = setInterval(() => setElapsed((performance.now() - state.startedAt) / 1000), 100);
    return () => clearInterval(t);
  }, [state]);

  const submit = async (question: string) => {
    const query = question.trim() || c.placeholder;
    setQ(query);
    const startedAt = performance.now();
    setElapsed(0);
    setState({ kind: "loading", startedAt });
    try {
      const result = await askCore(query);
      const seconds = (performance.now() - startedAt) / 1000;
      setElapsed(seconds);
      play("pop");
      setState({ kind: "done", result, seconds });
    } catch {
      play("thud");
      setState({ kind: "error", message: c.error });
    }
  };

  const loading = state.kind === "loading";
  const aiTime = state.kind === "done" ? formatDuration(state.seconds) : loading ? formatDuration(elapsed) : "–";

  return (
    <Stop id="seam-ix" side="right">
      <div className="w-full md:w-[560px]">
        <p data-reveal className="tag text-ink-soft"><span className="label-bg">{c.kicker}</span></p>
        <h2 id="seam-ix-title" data-reveal className="display text-[clamp(2.6rem,6vw,5.5rem)] mt-2">
          <span className="label-bg">
            {c.titleA} <Underlined>{c.titleKey}</Underlined>
          </span>
        </h2>
        <p data-reveal className="mt-3 max-w-[460px]"><span className="label-bg label-bg--body">{c.lede}</span></p>

        <div data-reveal className="mt-6">
          <Sticker rotate={-1} tilt={false} className="p-4 md:p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(q);
              }}
            >
              <label htmlFor="ask" className="tag text-ink-soft">
                {c.label}
              </label>
              <textarea
                id="ask"
                rows={2}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(q);
                  }
                }}
                placeholder={c.placeholder}
                className="mt-1 w-full resize-none bg-transparent border-2 border-ink rounded p-3 text-lg placeholder:text-ink-soft focus:outline-none focus:bg-hivis/20"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {c.suggestions.map((s) => (
                  <button key={s} type="button" className="chip !text-[14px]" onClick={() => submit(s)} disabled={loading}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <MagneticButton type="submit" disabled={loading} aria-busy={loading}>
                  {loading ? (
                    <>
                      <span className="drill-spin" aria-hidden="true" />
                      {c.loading}
                    </>
                  ) : (
                    c.submit
                  )}
                </MagneticButton>
              </div>
            </form>

            <div aria-live="polite" className="mt-4">
              {state.kind === "error" && (
                <p className="border-2 border-flag rounded p-3 font-bold text-flag">{state.message}</p>
              )}
              {state.kind === "done" && !state.result.answer.trim() && <p className="border-2 border-ink rounded p-3">{c.empty}</p>}
              {state.kind === "done" && state.result.answer.trim() && <Answer r={state.result} />}
            </div>
          </Sticker>
        </div>

        <div data-reveal className="mt-6 md:ml-20 relative">
          <Sticker rotate={2} className="p-4 inline-block">
            <p className="tag text-ink-soft">{c.benchTitle}</p>
            <dl className="grid grid-cols-2 gap-x-6 mt-2">
              <dt className="text-ink-soft text-sm">{c.benchManual}</dt>
              <dt className="text-ink-soft text-sm">{c.benchAi}</dt>
              <dd className="display text-4xl line-through decoration-flag decoration-4">{c.benchManualValue}</dd>
              <dd className="display text-4xl tabular-nums">{aiTime}</dd>
            </dl>
            <p className="text-xs text-ink-soft mt-2 max-w-[320px]">{c.benchNote}</p>
          </Sticker>
          <Star className="absolute -top-4 -left-5 -rotate-12" />
        </div>
        <div data-reveal>
          <PokeChips stop="seam-ix" />
        </div>
      </div>
    </Stop>
  );
}

function Answer({ r }: { r: QueryResponse }) {
  const c = COPY.seamIx;
  return (
    <div className="border-t-2 border-dashed border-ink pt-3">
      <p className="whitespace-pre-line max-h-[220px] overflow-y-auto pr-2" data-lenis-prevent>
        {r.answer}
      </p>
      <dl className="flex flex-wrap gap-x-5 gap-y-1 mt-3 tag">
        <div>
          <dt className="inline text-ink-soft">{c.routing}: </dt>
          <dd className="inline">{r.routingPath}</dd>
        </div>
        <div>
          <dt className="inline text-ink-soft">{c.confidence}: </dt>
          <dd className="inline">{Math.round(r.confidenceScore * 100)}%</dd>
        </div>
        <div>
          <dd className={`inline px-1 border-2 ${r.validated ? "border-ink bg-hivis text-[#17140f]" : "border-flag text-flag"}`}>
            {r.validated ? c.verified : c.unverified}
          </dd>
        </div>
      </dl>
      {r.citations.length > 0 && (
        <div className="mt-3">
          <p className="tag text-ink-soft">{c.citations}</p>
          <ul className="mt-1 space-y-1">
            {r.citations.slice(0, MAX_CITATIONS_SHOWN).map((cit, i) => (
              <li key={`${cit.sha256Hash}-${i}`} className="text-sm">
                <span className="font-bold">[{i + 1}]</span> {cit.documentTitle} · {cit.agency} {cit.year}
                {cit.boundingBox && ` · p.${cit.boundingBox.pageNumber}`}{" "}
                <code className="font-mono text-xs text-ink-soft" title={cit.sha256Hash}>
                  {shortHash(cit.sha256Hash)}
                </code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Design-spec example, shown only when the backend can't be reached, and labelled as such. */
const SPEC_EXAMPLE: Discrepancy = {
  discrepancyId: "example",
  boreholeId: "NK-094",
  coalfield: "North Karanpura",
  block: "NK-IV",
  seam: "Seam IX",
  agencyA: "MECL",
  surveyYearA: 1998,
  reportedThicknessA: 6.8,
  methodA: "Rotary core survey",
  agencyB: "CMPDI",
  surveyYearB: 2021,
  reportedThicknessB: 8.42,
  methodB: "Digital sonic caliper log",
  thicknessDeltaMeters: 1.62,
  status: "UNDER_REVIEW",
  auditDocketNo: "CMPDI/RI-II/NK-IV/DISC-094",
};

/** Stop 5 · Interburden · discrepancy */
export function Interburden() {
  const c = COPY.interburden;
  const [item, setItem] = useState<{ d: Discrepancy; live: boolean } | null>(null);
  const asked = useRef(false);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    listDiscrepancies()
      .then((list) => setItem(list.length ? { d: list[0], live: true } : { d: SPEC_EXAMPLE, live: false }))
      .catch(() => setItem({ d: SPEC_EXAMPLE, live: false }));
  }, []);

  const d = item?.d ?? SPEC_EXAMPLE;
  const max = Math.max(d.reportedThicknessA, d.reportedThicknessB);
  const bar = (v: number) => `${(v / max) * 100}%`;

  return (
    <Stop id="interburden" side="left">
      <div className="w-full md:w-[560px]">
        <p data-reveal className="tag text-ink-soft"><span className="label-bg">{c.kicker}</span></p>
        <h2 id="interburden-title" data-reveal className="display text-[clamp(2.6rem,6vw,5.5rem)] mt-2">
          <span className="label-bg">
            {c.titleA} <Underlined color="var(--flag)">{c.titleKey}</Underlined> {c.titleB}
          </span>
        </h2>
        <p data-reveal className="mt-3 max-w-[460px]"><span className="label-bg label-bg--body">{c.lede}</span></p>
        <div data-reveal className="mt-6">
          <Sticker rotate={1.5} className="p-5">
            <p className={`tag inline-block px-2 py-0.5 border-2 ${item?.live ? "border-ink bg-hivis text-[#17140f]" : "border-ink-soft text-ink-soft"}`}>
              {item === null ? "…" : item.live ? c.live : c.example}
            </p>
            <h3 className="display text-3xl mt-3">
              {d.seam} · {d.boreholeId}
            </h3>
            <p className="text-ink-soft">
              {d.coalfield} · {d.block}
            </p>
            <div className="mt-4 space-y-3">
              {[
                { agency: d.agencyA, year: d.surveyYearA, v: d.reportedThicknessA, method: d.methodA, hot: false },
                { agency: d.agencyB, year: d.surveyYearB, v: d.reportedThicknessB, method: d.methodB, hot: true },
              ].map((row) => (
                <div key={row.agency + row.year}>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">
                      {row.agency} {row.year}
                    </span>
                    <span className="font-mono">{row.v.toFixed(2)} m</span>
                  </div>
                  <div className="h-5 border-2 border-ink rounded-sm mt-1 overflow-hidden">
                    <div className="h-full" style={{ width: bar(row.v), background: row.hot ? "var(--hivis)" : "var(--stratum)" }} />
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">{row.method}</p>
                </div>
              ))}
            </div>
            <dl className="grid grid-cols-3 gap-2 mt-4 text-sm">
              <div>
                <dt className="tag text-ink-soft">{c.delta}</dt>
                <dd className="font-mono font-bold text-flag">+{d.thicknessDeltaMeters.toFixed(2)} m</dd>
              </div>
              <div>
                <dt className="tag text-ink-soft">{c.status}</dt>
                <dd className="font-mono">{d.status.replace(/_/g, " ")}</dd>
              </div>
              <div>
                <dt className="tag text-ink-soft">{c.docket}</dt>
                <dd className="font-mono text-xs break-all">{d.auditDocketNo}</dd>
              </div>
            </dl>
          </Sticker>
        </div>
        <div data-reveal>
          <PokeChips stop="interburden" />
        </div>
      </div>
    </Stop>
  );
}

/** Stop 6 · Seam X · roles → workspace */
export function SeamX() {
  const c = COPY.seamX;
  const hatColors = ["var(--hivis)", "var(--paper)", "var(--flag)", "var(--hivis-deep)"];
  const rot = [-2, 1.5, 1, -1.5];
  return (
    <Stop id="seam-x" side="right">
      <div className="w-full md:w-[600px]">
        <p data-reveal className="tag text-ink-soft"><span className="label-bg">{c.kicker}</span></p>
        <h2 id="seam-x-title" data-reveal className="display text-[clamp(2.6rem,6vw,5.5rem)] mt-2">
          <span className="label-bg">
            {c.titleA} <Underlined>{c.titleKey}</Underlined>
          </span>
        </h2>
        <p data-reveal className="mt-3 max-w-[460px]"><span className="label-bg label-bg--body">{c.lede}</span></p>
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {c.roles.map((r, i) => (
            <li key={r.id} data-reveal className={i % 2 ? "sm:mt-6" : ""}>
              <Sticker rotate={rot[i]} className="p-4 h-full flex flex-col">
                <svg width="56" height="34" viewBox="0 0 56 34" aria-hidden="true">
                  <path d="M6 28 C 6 8, 50 8, 50 28 Z" fill={hatColors[i]} stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
                  <path d="M2 29 H54" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
                  <path d="M28 10 V 27" stroke="var(--ink)" strokeWidth="2.5" />
                </svg>
                <h3 className="display text-2xl mt-2">{r.hat}</h3>
                <p className="text-ink-soft text-[16px] flex-1">{r.does}</p>
                <a
                  href={`${WORKSPACE_URL}/?role=${r.id}`}
                  className="btn btn-ghost !min-h-[40px] !py-1.5 !px-4 mt-3 self-start text-[15px]"
                  onClick={() => play("click")}
                >
                  {c.cta} <span className="sr-only">as {r.hat}</span>
                </a>
              </Sticker>
            </li>
          ))}
        </ul>
        <p data-reveal className="text-sm text-ink-soft mt-5"><span className="label-bg label-bg--body">{c.note}</span></p>
        <div data-reveal>
          <PokeChips stop="seam-x" />
        </div>
      </div>
    </Stop>
  );
}

/** Stop 7 · Bedrock · FAQ */
export function Bedrock() {
  const c = COPY.bedrock;
  return (
    <Stop id="bedrock" side="left">
      <div className="w-full md:w-[600px]">
        <p data-reveal className="tag text-ink-soft"><span className="label-bg">{c.kicker}</span></p>
        <h2 id="bedrock-title" data-reveal className="display text-[clamp(2.6rem,6vw,5.5rem)] mt-2">
          <span className="label-bg">
            {c.titleA} <Underlined>{c.titleKey}</Underlined>
          </span>
        </h2>
        <div className="mt-6 space-y-3">
          {c.faqs.map((f, i) => (
            <div key={f.q} data-reveal>
              <Sticker rotate={i % 2 ? 1 : -1} tilt={false} className="faq">
                <details>
                  <summary className="p-4 font-bold text-lg flex justify-between items-center gap-4">
                    {f.q}
                    <span className="faq__plus" aria-hidden="true" />
                  </summary>
                  <p className="px-4 pb-4 text-ink-soft">{f.a}</p>
                </details>
              </Sticker>
            </div>
          ))}
        </div>
        <div data-reveal>
          <PokeChips stop="bedrock" />
        </div>
      </div>
    </Stop>
  );
}

/** Stop 8 · Core shed · footer */
export function CoreShed() {
  const c = COPY.coreShed;
  return (
    <Stop id="core-shed" side="center">
      <footer className="w-full max-w-[980px] text-center">
        <p data-reveal className="tag text-ink-soft"><span className="label-bg">{c.kicker}</span></p>
        <h2 id="core-shed-title" data-reveal className="display text-[clamp(2.6rem,7vw,6.5rem)] mt-3">
          <span className="label-bg">
            {c.titleA} <Underlined>{c.titleKey}</Underlined>
          {c.titleB}
          </span>
        </h2>
        <div data-reveal className="mt-8 flex flex-wrap justify-center gap-3 pointer-events-auto">
          {c.links.map((l) => (
            <a key={l.label} href={l.href} className="chip" target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
          <MagneticButton onClick={() => scrollToStop(0)}>{c.top}</MagneticButton>
        </div>
        <div data-reveal className="mt-10 inline-block">
          <Sticker rotate={-1} tilt={false} className="px-4 py-3 text-sm text-ink-soft max-w-[560px]">
            {c.credits}
          </Sticker>
        </div>
      </footer>
    </Stop>
  );
}
