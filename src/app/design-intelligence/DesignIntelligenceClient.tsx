"use client";

import { useEffect, useRef, type RefObject } from "react";
import { DesignIntelligenceHero } from "@/components/sections/design-intelligence-hero";
import "./design-intelligence.css";

const SPECIES_CHIP_CLASS = "inline-flex items-center border border-border px-3 py-1 label-eyebrow text-foreground";

interface StepData {
  n: string;
  tag: string;
  title: string;
  desc: string;
  planting: string;
  flooring: string;
  furniture: string;
  irrigation: string;
  waterDemand: string;
  hardType: string;
  hardArea: number;
  softArea: number;
  shrub: number;
  xeris: boolean;
  xerisArea: number;
  trees: number;
  species: string[];
  cost: number;
}

function aed(n: number) {
  return "AED " + n.toLocaleString("en-US");
}

const DATA: StepData[] = [
  {
    n: "01 / 04",
    tag: "Luxury",
    title: "Maximum quality.",
    desc: "Mature planting, premium multi-tone paving and movable outdoor furniture create the most complete landscape experience.",
    planting: "Mature + premium",
    flooring: "Premium / multi-tone",
    furniture: "Movable",
    irrigation: "Smart drip, full coverage",
    waterDemand: "High",
    hardType: "In-situ concrete + banding",
    hardArea: 205,
    softArea: 145.5,
    shrub: 140,
    xeris: false,
    xerisArea: 0,
    trees: 7,
    species: ["Olea Europaea", "Delonix Regia", "Prosopis Cineraria", "Cassia Surattensis"],
    cost: 75120,
  },
  {
    n: "02 / 04",
    tag: "Premium value",
    title: "Premium value.",
    desc: "Younger trees and fixed furniture reduce investment while retaining a rich planting and material palette.",
    planting: "Younger + quality",
    flooring: "Premium / multi-tone",
    furniture: "Fixed",
    irrigation: "Zoned drip",
    waterDemand: "Medium-high",
    hardType: "In-situ concrete",
    hardArea: 205,
    softArea: 145.5,
    shrub: 120,
    xeris: false,
    xerisArea: 0,
    trees: 6,
    species: ["Delonix Regia", "Prosopis Cineraria", "Acacia Arabica", "Senna Landheimeriana"],
    cost: 48625,
  },
  {
    n: "03 / 04",
    tag: "Smart specification",
    title: "Smart specification.",
    desc: "A more economical tree palette and quality paving tiles provide a considered balance between character and cost.",
    planting: "Selected palette",
    flooring: "Quality tiles",
    furniture: "Fixed",
    irrigation: "Basic drip + xeriscape zone",
    waterDemand: "Medium",
    hardType: "Paving tiles, 60×60 + 30×30",
    hardArea: 210,
    softArea: 145.5,
    shrub: 100,
    xeris: true,
    xerisArea: 70,
    trees: 6,
    species: ["Albizia Lebbeck", "Acacia Arabica", "Prosopis Cineraria", "Ziziphus Spina-Christi"],
    cost: 23420,
  },
  {
    n: "04 / 04",
    tag: "Essential",
    title: "Essential specification.",
    desc: "Younger trees, simplified planting and a single paving finish deliver the core landscape experience with the lowest investment level.",
    planting: "Younger + simplified",
    flooring: "Single colour",
    furniture: "Fixed",
    irrigation: "Manual, xeriscape-led",
    waterDemand: "Low",
    hardType: "Paving tiles, 10×20",
    hardArea: 210,
    softArea: 145.5,
    shrub: 80,
    xeris: true,
    xerisArea: 74,
    trees: 5,
    species: ["Morus Alba", "Ziziphus Spina-Christi", "Prosopis Cineraria", "Acacia Arabica"],
    cost: 12850,
  },
];

const ASSET = (name: string) => `/design-intelligence/${name}`;

const CARDS = [
  { step: 0, index: "01 — Luxury", img: "option-01.webp", alt: "Luxury landscape specification" },
  { step: 1, index: "02 — Premium value", img: "option-02.webp", alt: "Premium value landscape specification" },
  { step: 2, index: "03 — Smart specification", img: "option-03.webp", alt: "Smart specification landscape" },
  { step: 3, index: "04 — Essential", img: "option-04.webp", alt: "Essential landscape specification" },
];

export function DesignIntelligenceClient() {
  const storyRef = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const imgRefs = [
    useRef<HTMLImageElement>(null),
    useRef<HTMLImageElement>(null),
    useRef<HTMLImageElement>(null),
    useRef<HTMLImageElement>(null),
  ];

  const dpCostRef = useRef<HTMLSpanElement>(null);
  const dpHardBarRef = useRef<HTMLDivElement>(null);
  const dpSoftBarRef = useRef<HTMLDivElement>(null);
  const dpHardAreaRef = useRef<HTMLSpanElement>(null);
  const dpSoftAreaRef = useRef<HTMLSpanElement>(null);
  const dpPlantingRef = useRef<HTMLSpanElement>(null);
  const dpFlooringRef = useRef<HTMLSpanElement>(null);
  const dpFurnitureRef = useRef<HTMLSpanElement>(null);
  const dpIrrigationRef = useRef<HTMLSpanElement>(null);
  const dpWaterRef = useRef<HTMLSpanElement>(null);
  const dpHardTypeRef = useRef<HTMLSpanElement>(null);
  const dpShrubRef = useRef<HTMLSpanElement>(null);
  const dpXerisRef = useRef<HTMLSpanElement>(null);
  const dpTreesRef = useRef<HTMLSpanElement>(null);
  const dpSpeciesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;

    function update() {
      if (!story) return;
      const rect = story.getBoundingClientRect();
      const max = story.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / max));
      let step = Math.floor(p * 4);
      if (step > 3) step = 3;
      const d = DATA[step];

      if (numRef.current) numRef.current.textContent = d.n;
      if (titleRef.current) titleRef.current.textContent = d.title;
      if (descRef.current) descRef.current.textContent = d.desc;
      if (dotRef.current) dotRef.current.style.top = `calc(${p * 100}% - 20px)`;
      imgRefs.forEach((ref, i) => ref.current?.classList.toggle("di-model-img--active", i === step));

      const hardPct = ((d.hardArea / (d.hardArea + d.softArea)) * 100).toFixed(1);
      if (dpCostRef.current) dpCostRef.current.textContent = aed(d.cost);
      if (dpHardBarRef.current) dpHardBarRef.current.style.width = hardPct + "%";
      if (dpSoftBarRef.current) dpSoftBarRef.current.style.width = 100 - Number(hardPct) + "%";
      if (dpHardAreaRef.current) dpHardAreaRef.current.textContent = d.hardArea + " m²";
      if (dpSoftAreaRef.current) dpSoftAreaRef.current.textContent = d.softArea + " m²";
      if (dpPlantingRef.current) dpPlantingRef.current.textContent = d.planting;
      if (dpFlooringRef.current) dpFlooringRef.current.textContent = d.flooring;
      if (dpFurnitureRef.current) dpFurnitureRef.current.textContent = d.furniture;
      if (dpIrrigationRef.current) dpIrrigationRef.current.textContent = d.irrigation;
      if (dpWaterRef.current) dpWaterRef.current.textContent = d.waterDemand;
      if (dpHardTypeRef.current) dpHardTypeRef.current.textContent = d.hardType;
      if (dpShrubRef.current) dpShrubRef.current.textContent = d.shrub + " m²";
      if (dpXerisRef.current)
        dpXerisRef.current.textContent = d.xeris ? d.xerisArea + " m² applied" : "Not applied";
      if (dpTreesRef.current) dpTreesRef.current.textContent = d.trees + " trees";
      if (dpSpeciesRef.current) {
        dpSpeciesRef.current.innerHTML = d.species
          .map((s) => `<span class="${SPECIES_CHIP_CLASS}">${s}</span>`)
          .join("");
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scrollToStep(n: number) {
    const story = storyRef.current;
    if (!story) return;
    const max = story.offsetHeight - window.innerHeight;
    const p = (n + 0.5) / 4;
    const target = story.offsetTop + p * max;
    window.scrollTo({ top: target, behavior: "smooth" });
  }

  return (
    <main>
      <DesignIntelligenceHero />

      {/* Four specifications, one framework — the entry grid. */}
      <section className="bg-background px-6 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1600px]">
          <p className="label-eyebrow mb-4">Fluid Forms Studio — Design Intelligence</p>
          <h2 className="mb-8 max-w-3xl">The same design. A managed cost curve.</h2>
          <p className="max-w-2xl text-muted-foreground">
            Every landscape can be delivered across a range of investment levels without changing
            the idea behind it. Planting maturity, paving grade and furniture specification move
            stage by stage, so a project&apos;s budget is met without cutting the design that
            gives it value. Select a specification to jump to its full walkthrough below.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-[1600px] grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => {
            const d = DATA[c.step];
            return (
              <button
                key={c.step}
                type="button"
                onClick={() => scrollToStep(c.step)}
                className="group flex flex-col bg-background p-8 text-left transition-colors hover:bg-muted"
              >
                <div className="relative mb-6 aspect-square w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ASSET(c.img)} alt={c.alt} className="h-full w-full object-contain" />
                </div>
                <p className="label-eyebrow mb-3 text-primary">{c.index}</p>
                <h3 className="mb-3">{d.title.replace(".", "")}</h3>
                <p className="mb-6 text-muted-foreground">{d.desc}</p>
                <dl className="mt-auto border-t border-border text-foreground">
                  {[
                    ["Planting", d.planting],
                    ["Furniture", d.furniture],
                    ["Total cost", aed(d.cost)],
                  ].map(([dt, dd]) => (
                    <div key={dt} className="flex justify-between gap-4 border-b border-border py-2.5">
                      <dt className="label-eyebrow">{dt}</dt>
                      <dd className="label-eyebrow text-foreground">{dd}</dd>
                    </div>
                  ))}
                </dl>
              </button>
            );
          })}
        </div>
      </section>

      {/* Scrollytelling walkthrough: left = looping clip + copy,
          middle = the specification render, right = a static data panel. */}
      <section ref={storyRef} className="relative bg-brand-black" style={{ height: "400vh" }}>
        <div className="sticky top-0 flex h-svh w-full flex-col md:grid md:grid-cols-4">
          {/* Left: the clip, extended to fill the whole column, with the
              step's number/title/description overlaid on top of it. */}
          <div className="relative h-1/2 overflow-hidden md:col-span-1 md:h-full">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              src={ASSET("copy-video.mp4")}
            />
            {/* Patch over the generator watermark baked into the source
                clip's corner. */}
            <div className="absolute right-0 bottom-0 h-10 w-28 bg-brand-black" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/10 to-brand-black/70" />

            <div className="absolute inset-0 flex flex-col justify-between p-8 text-brand-white md:p-10">
              <p ref={numRef} className="label-eyebrow text-white/60">
                01 / 04
              </p>
              <div>
                <h1 ref={titleRef} className="mb-5 text-brand-white">
                  Maximum quality.
                </h1>
                <p ref={descRef} className="max-w-sm text-white/80">
                  Mature planting, premium multi-tone paving and movable outdoor furniture create
                  the most complete landscape experience.
                </p>
              </div>
            </div>
          </div>

          {/* Middle: the specification render, centered. */}
          <div className="relative h-1/2 md:col-span-2 md:h-full">
            <div className="absolute inset-0 flex items-center justify-center p-10 md:p-16">
              <div className="relative h-full w-full max-w-3xl">
                {CARDS.map((c, i) => (
                  <img
                    key={c.step}
                    ref={imgRefs[i]}
                    src={ASSET(c.img)}
                    alt={c.alt}
                    className={`di-model-img absolute inset-0 h-full w-full object-contain drop-shadow-2xl ${
                      i === 0 ? "di-model-img--active" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: a static, full-height data panel. */}
          <div className="hidden flex-col justify-center gap-7 overflow-y-auto border-l border-white/10 bg-background p-8 md:col-span-1 md:flex md:h-full md:p-10">
            <p className="label-eyebrow">Specification data — 20 × 20 m</p>

            <div className="border-b border-border pb-6">
              <span ref={dpCostRef} className="block text-4xl font-serif text-primary">
                AED 75,120
              </span>
              <p className="label-eyebrow mt-2">Total build cost</p>
            </div>

            <div>
              <div className="flex h-2 w-full overflow-hidden bg-border">
                <div ref={dpHardBarRef} className="h-full bg-foreground" style={{ width: "58.5%" }} />
                <div ref={dpSoftBarRef} className="h-full bg-primary" style={{ width: "41.5%" }} />
              </div>
              <div className="label-eyebrow mt-3 flex justify-between">
                <span>
                  Hardscape <b ref={dpHardAreaRef} className="text-foreground">205 m²</b>
                </span>
                <span>
                  Softscape <b ref={dpSoftAreaRef} className="text-foreground">145.5 m²</b>
                </span>
              </div>
            </div>

            <dl className="border-t border-border">
              {(
                [
                  ["Planting", dpPlantingRef],
                  ["Flooring", dpFlooringRef],
                  ["Furniture", dpFurnitureRef],
                  ["Irrigation", dpIrrigationRef],
                  ["Water demand", dpWaterRef],
                  ["Hardscape type", dpHardTypeRef],
                  ["Shrub bed", dpShrubRef],
                  ["Xeriscape", dpXerisRef],
                ] as [string, RefObject<HTMLSpanElement | null>][]
              ).map(([label, ref]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b border-border py-3">
                  <dt className="label-eyebrow shrink-0">{label}</dt>
                  <dd ref={ref} className="text-right text-sm text-foreground">
                    —
                  </dd>
                </div>
              ))}
            </dl>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="label-eyebrow">Tree species</p>
                <span ref={dpTreesRef} className="label-eyebrow text-foreground">
                  7 trees
                </span>
              </div>
              <div ref={dpSpeciesRef} className="flex flex-wrap gap-2">
                {["Olea Europaea", "Delonix Regia", "Prosopis Cineraria", "Cassia Surattensis"].map((s) => (
                  <span key={s} className={SPECIES_CHIP_CLASS}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll progress line (desktop only — mirrors the data panel). */}
          <div className="pointer-events-none absolute top-[8%] right-[26%] hidden h-[84%] w-px bg-white/15 md:block">
            <div ref={dotRef} className="absolute -left-[3px] h-10 w-[7px] bg-primary" style={{ top: "0%" }} />
          </div>
        </div>
      </section>

      <section className="flex min-h-[70svh] flex-col items-center justify-center gap-8 bg-brand-black px-6 py-24 text-center text-brand-white">
        <h2 className="max-w-4xl text-brand-white">
          Specify with intention.
        </h2>
        <p className="max-w-md text-white/70">
          A landscape does not need to become a different design to become more economical. The
          specification can evolve while the spatial idea remains intact.
        </p>
      </section>
    </main>
  );
}
