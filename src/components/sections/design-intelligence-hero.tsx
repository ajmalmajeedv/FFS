"use client";

import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { ParticleTextEffect } from "@/components/ui/interactive-text-particle";

const BACKGROUNDS = [
  "/images/di-hero-bg-1.webp",
  "/images/di-hero-bg-2.webp",
  "/images/di-hero-bg-3.webp",
];

/**
 * The same pinned hero treatment as the main site's ScrollVideo hero
 * (particle title over a crossfading background, fading out as the page
 * scrolls past it) but standalone — Design Intelligence has no frame
 * sequence to scrub into afterward, so this only handles the fade. The
 * backgrounds are photo-negative versions of the main hero's own photos
 * (tools/make_di_hero_backgrounds.mjs) for a futuristic variant of the
 * same look.
 */
export function DesignIntelligenceHero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const update = () => {
      rafRef.current = null;
      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      content.style.opacity = String(1 - progress);
    };

    const onScroll = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section ref={wrapperRef} className="relative w-full" style={{ height: "180vh" }}>
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-brand-black">
        <div ref={contentRef} className="absolute inset-0">
          <div className="absolute inset-0 overflow-hidden">
            {BACKGROUNDS.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                className="hero-bg-layer absolute inset-0 h-full w-full object-cover"
              />
            ))}
            <div className="absolute inset-0 bg-brand-black/45" />
          </div>

          <ParticleTextEffect
            text="FFS DESIGN INTELLIGENCE"
            fontFamily="var(--font-fraunces)"
            fontWeight="600"
            className="hero-logo-fade-in absolute inset-0"
            colors={["ffffff", "ffffff"]}
          />

          <button
            type="button"
            aria-label="Scroll to continue"
            onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })}
            className="scroll-cue absolute inset-x-0 bottom-8 z-10 flex justify-center text-white/70 transition-colors hover:text-white"
          >
            <ChevronDown className="size-7" strokeWidth={1.25} />
          </button>
        </div>
      </div>
    </section>
  );
}
