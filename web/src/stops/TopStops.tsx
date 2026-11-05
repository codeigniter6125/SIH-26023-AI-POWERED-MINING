import { COPY } from "../config/copy";
import { scrollToStop } from "../lib/useSmoothScroll";
import { Arrow, Icon, Scribble, Star, Underlined } from "../ui/Doodles";
import { MagneticButton, Sticker } from "../ui/Interactive";
import { PokeChips, Stop } from "../ui/Chrome";

const SEAM_IX_INDEX = 3;

/** Stop 1 · Collar · Hero */
export function Collar() {
  const c = COPY.collar;
  return (
    <Stop id="collar" side="left" className="!items-end md:!items-center">
      <div className="max-w-[920px] w-full">
        <div data-reveal>
          <p className="tag inline-block bg-hivis text-[#17140f] border-2 border-ink px-2 py-1 -rotate-2">{c.kicker}</p>
        </div>
        <h1 id="collar-title" data-reveal className="display text-[clamp(3rem,8.4vw,8rem)] mt-5 text-ink">
          {c.titleA} <Underlined>{c.titleKey}</Underlined> {c.titleB}
        </h1>
        <div data-reveal className="mt-6 max-w-[560px] relative">
          <Sticker rotate={1.2} className="p-5 md:p-6" tilt={false}>
            <p className="text-lg md:text-xl">{c.lede}</p>
          </Sticker>
          <Star className="absolute -top-5 -right-4 rotate-12" size={40} />
        </div>
        <div data-reveal className="mt-8 flex flex-wrap items-center gap-4 pointer-events-auto">
          <MagneticButton onClick={() => scrollToStop(1)}>
            <Icon name="arrow-down" />
            {c.cta}
          </MagneticButton>
          <MagneticButton variant="ghost" onClick={() => scrollToStop(SEAM_IX_INDEX)}>
            {c.ctaAlt}
          </MagneticButton>
        </div>
        <div data-reveal>
          <PokeChips stop="collar" />
        </div>
        <div data-reveal className="hidden md:flex items-center gap-2 mt-10 text-ink-soft">
          <Arrow className="rotate-[60deg]" />
          <span className="tag">{c.scrollHint}</span>
          <Scribble className="ml-2" />
        </div>
      </div>
    </Stop>
  );
}

/** Stop 2 · Alluvium · How it works */
export function Alluvium() {
  const c = COPY.alluvium;
  const rotations = [-2, 1.5, -1, 2];
  const offsets = ["md:ml-0", "md:ml-16", "md:ml-6", "md:ml-24"];
  return (
    <Stop id="alluvium" side="right">
      <div className="w-full md:w-[520px]">
        <p data-reveal className="tag text-ink-soft"><span className="label-bg">{c.kicker}</span></p>
        <h2 id="alluvium-title" data-reveal className="display text-[clamp(2.6rem,6vw,5.5rem)] mt-2">
          <span className="label-bg">
            {c.titleA} <Underlined>{c.titleKey}</Underlined> {c.titleB}
          </span>
        </h2>
        <ol className="mt-8 flex flex-col gap-4">
          {c.steps.map((s, i) => (
            <li key={s.n} data-reveal className={offsets[i]}>
              <Sticker rotate={rotations[i]} className="p-4 md:p-5 flex gap-4 items-start max-w-[440px]">
                <span className="display text-4xl text-hivis [-webkit-text-stroke:2px_var(--ink)]">{s.n}</span>
                <div>
                  <h3 className="display text-2xl">{s.title}</h3>
                  <p className="text-ink-soft mt-1">{s.body}</p>
                </div>
              </Sticker>
            </li>
          ))}
        </ol>
        <div data-reveal>
          <PokeChips stop="alluvium" />
        </div>
      </div>
    </Stop>
  );
}

/** Stop 3 · Sandstone · Features */
export function Sandstone() {
  const c = COPY.sandstone;
  const layout = [
    { span: "md:col-span-4", rot: -1.5 },
    { span: "md:col-span-2", rot: 2 },
    { span: "md:col-span-3", rot: 1 },
    { span: "md:col-span-3", rot: -2 },
    { span: "md:col-span-5 md:col-start-2", rot: 0.8 },
  ];
  return (
    <Stop id="sandstone" side="left">
      <div className="w-full md:w-[640px]">
        <p data-reveal className="tag text-ink-soft"><span className="label-bg">{c.kicker}</span></p>
        <h2 id="sandstone-title" data-reveal className="display text-[clamp(2.6rem,6vw,5.5rem)] mt-2">
          <span className="label-bg">
            {c.titleA} <Underlined>{c.titleKey}</Underlined>
          </span>
        </h2>
        <ul className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-4">
          {c.features.map((f, i) => (
            <li key={f.title} data-reveal className={layout[i].span}>
              <Sticker rotate={layout[i].rot} className="p-4 h-full">
                <p className="tag text-ink-soft">{f.tag}</p>
                <h3 className="display text-2xl mt-1">{f.title}</h3>
                <p className="mt-1 text-[16px] text-ink-soft">{f.body}</p>
              </Sticker>
            </li>
          ))}
        </ul>
        <div data-reveal>
          <PokeChips stop="sandstone" />
        </div>
      </div>
    </Stop>
  );
}
