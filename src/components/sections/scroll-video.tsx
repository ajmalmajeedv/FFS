"use client";

import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { ParticleTextEffect } from "@/components/ui/interactive-text-particle";

export interface ScrollVideoTextSection {
  eyebrow?: string;
  heading: string;
  body: string;
}

export interface ScrollVideoProps {
  /** Folder under /public/video-frames/, e.g. "hero-clip" */
  clip: string;
  frameCount: number;
  /** Zero-padded digit count in the filenames, e.g. frame-0001.webp -> 4 */
  padding?: number;
  /**
   * How tall the frame-scrub + hold portion of the track is, in
   * viewport-heights. Bigger = slower, more deliberate scroll through
   * the clip. Tune per clip length/pace.
   */
  scrollLengthVh?: number;
  /** One text block per equal slice of the frame-scrub, cross-fading in/out. */
  sections?: ScrollVideoTextSection[];
  /**
   * A still image that fades in once the frame sequence finishes and
   * holds (full opacity) for the rest of the scroll track, before the
   * next section takes over. Omit to end on the last frame instead.
   */
  finalImage?: string;
  /** Fraction of the frame-scrub track reserved for the final-image hold. */
  finalImageHoldFraction?: number;
  /**
   * The hero: shown pinned at full opacity at the very top of the page,
   * fading out over `introVh` of scroll to reveal the clip's first frame
   * (already drawn on the same canvas underneath — frame advancement is
   * held at 0 until the fade completes, then proceeds normally). This
   * replaces a separate hero section + a duplicate "first frame" image
   * with one continuous pinned view.
   */
  heroText: string;
  heroBackgrounds: string[];
  /** Scroll distance (vh) dedicated to the hero fade-out. */
  introVh?: number;
  className?: string;
  id?: string;
}

function framePath(clip: string, index: number, padding: number) {
  const n = String(index + 1).padStart(padding, "0");
  return `/video-frames/${clip}/frame-${n}.webp`;
}

/** 1 for most of the slice, cross-fading to 0 only near its edges. */
function sectionOpacity(progress: number, index: number, count: number, fade = 0.35) {
  const span = 1 / count;
  const start = index * span;
  const end = start + span;
  const fadeWidth = span * fade;
  const fadeIn = (progress - start) / fadeWidth;
  const fadeOut = (end - progress) / fadeWidth;
  return Math.max(0, Math.min(1, fadeIn, fadeOut));
}

export function ScrollVideo({
  clip,
  frameCount,
  padding = 4,
  scrollLengthVh = 400,
  sections,
  finalImage,
  finalImageHoldFraction = 0.18,
  heroText,
  heroBackgrounds,
  introVh = 60,
  className = "",
  id,
}: ScrollVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedCountRef = useRef(0);
  const currentIndexRef = useRef(-1);
  const rafRef = useRef<number | null>(null);
  const textRefs = useRef<Array<HTMLDivElement | null>>([]);
  const finalImageRef = useRef<HTMLImageElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const bgLayerRefs = useRef<Array<HTMLImageElement | null>>([]);
  const isScrollingAwayRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (index: number) => {
      const img = imagesRef.current[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (canvas.width - drawW) / 2;
      const dy = (canvas.height - drawH) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, dx, dy, drawW, drawH);
      currentIndexRef.current = index;
    };

    const highestLoadedIndex = () => {
      let last = 0;
      for (let i = 0; i < imagesRef.current.length; i++) {
        if (imagesRef.current[i]?.complete && imagesRef.current[i].naturalWidth > 0) last = i;
        else break;
      }
      return last;
    };

    const holdStart = finalImage ? 1 - finalImageHoldFraction : 1;
    const totalVh = introVh + scrollLengthVh;
    const introFraction = introVh / totalVh;

    const updateFrame = () => {
      rafRef.current = null;
      const rect = wrapper.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const scrollable = rect.height - viewportH;
      const rawProgress = scrollable > 0 ? -rect.top / scrollable : 0;
      const rawClamped = Math.min(1, Math.max(0, rawProgress));

      // Hero fades out over [0, introFraction] of the whole track.
      const heroOpacity = introFraction > 0 ? 1 - Math.min(1, rawClamped / introFraction) : 0;
      if (heroContentRef.current) heroContentRef.current.style.opacity = String(heroOpacity);

      // Freeze on a single clean background the moment scrolling starts,
      // so the handoff to the clip is one plain fade — not also blending
      // through whatever mid-crossfade moment the background cycle
      // happened to be in when the user scrolled.
      const scrollingAway = rawClamped > 0;
      if (scrollingAway !== isScrollingAwayRef.current) {
        isScrollingAwayRef.current = scrollingAway;
        if (scrollingAway) {
          let maxOpacity = -1;
          let maxIndex = 0;
          bgLayerRefs.current.forEach((el, i) => {
            if (!el) return;
            const opacity = parseFloat(getComputedStyle(el).opacity);
            if (opacity > maxOpacity) {
              maxOpacity = opacity;
              maxIndex = i;
            }
          });
          bgLayerRefs.current.forEach((el, i) => {
            if (!el) return;
            el.style.animationPlayState = "paused";
            el.style.opacity = i === maxIndex ? "1" : "0";
          });
        } else {
          bgLayerRefs.current.forEach((el) => {
            if (!el) return;
            el.style.animationPlayState = "running";
            el.style.opacity = "";
          });
        }
      }

      // Remap [introFraction, 1] -> [0, 1] for everything below: the
      // frame sequence is held at frame 0 for the entire intro fade,
      // then plays out normally once the hero is gone.
      const scrubClamped =
        introFraction < 1 ? Math.min(1, Math.max(0, (rawClamped - introFraction) / (1 - introFraction))) : rawClamped;

      const frameProgress = holdStart > 0 ? Math.min(1, scrubClamped / holdStart) : 1;

      const target = Math.round(frameProgress * (frameCount - 1));
      const cappedTarget = Math.min(target, highestLoadedIndex());

      if (cappedTarget !== currentIndexRef.current) {
        draw(cappedTarget);
      }

      if (sections) {
        textRefs.current.forEach((el, i) => {
          if (!el) return;
          el.style.opacity = String(sectionOpacity(frameProgress, i, sections.length));
        });
      }

      if (finalImage && finalImageRef.current) {
        const fadeSpan = 0.05;
        const fadeProgress = (scrubClamped - holdStart) / fadeSpan;
        finalImageRef.current.style.opacity = String(Math.max(0, Math.min(1, fadeProgress)));
      }
    };

    const onScroll = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(updateFrame);
      }
    };

    // Preload every frame; first frame drawn as soon as it lands so the
    // section never shows a blank canvas.
    imagesRef.current = Array.from({ length: frameCount }, (_, i) => {
      const img = new window.Image();
      img.src = framePath(clip, i, padding);
      img.onload = () => {
        loadedCountRef.current += 1;
        if (i === 0) draw(0);
      };
      return img;
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateFrame();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [clip, frameCount, padding, sections, finalImage, finalImageHoldFraction, introVh, scrollLengthVh]);

  return (
    <section
      id={id}
      ref={wrapperRef}
      className={`relative w-full ${className}`}
      style={{ height: `calc(${introVh}vh + ${scrollLengthVh}vh)` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-brand-black">
        <canvas ref={canvasRef} className="h-full w-full" />

        {finalImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={finalImageRef}
            src={finalImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {sections?.map((s, i) => (
          <div
            key={s.heading}
            ref={(el) => {
              textRefs.current[i] = el;
            }}
            className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-16 opacity-0 md:px-16 md:pb-24"
          >
            <div className="max-w-xl">
              {s.eyebrow && <p className="label-eyebrow mb-4 text-white/60">{s.eyebrow}</p>}
              <h3 className="text-brand-white">{s.heading}</h3>
              <p className="mt-4 text-white/75">{s.body}</p>
            </div>
          </div>
        ))}

        {/* Hero: pinned on top, fading out to reveal the clip beneath. */}
        <div ref={heroContentRef} className="absolute inset-0 z-30">
          <div className="absolute inset-0 overflow-hidden">
            {heroBackgrounds.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                ref={(el) => {
                  bgLayerRefs.current[i] = el;
                }}
                src={src}
                alt=""
                className="hero-bg-layer absolute inset-0 h-full w-full object-cover"
              />
            ))}
            <div className="absolute inset-0 bg-brand-black/40" />
          </div>

          <ParticleTextEffect
            text={heroText}
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
