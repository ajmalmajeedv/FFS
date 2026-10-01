"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import isometrics from "@/data/typologies_isometric.generated.json";
import { projects } from "@/lib/projects";

// Placeholder — replace with the real per-typology description copy from
// the current site once it's provided; see chat notes.
const DESCRIPTIONS: Record<string, string> = {
  "residential-podium":
    "Placeholder — swap in the real description of this typology from the current site.",
  "master-planning":
    "Placeholder — swap in the real description of this typology from the current site.",
  "streetscape-public-realm":
    "Placeholder — swap in the real description of this typology from the current site.",
  "campus-institutional":
    "Placeholder — swap in the real description of this typology from the current site.",
};

export function Typologies() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1600px] px-6 pt-24 pb-12 md:px-10 md:pt-36">
        <p className="label-eyebrow mb-4">Fluid Forms Studio</p>
        <h2>Fields of Work</h2>
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-px bg-border md:grid-cols-2">
        {isometrics.map((t) => {
          const related = projects.filter((p) => p.category === t.slug);
          const active = activeSlug === t.slug;

          return (
            <div
              key={t.slug}
              className="group relative aspect-square cursor-pointer overflow-hidden bg-background"
              onClick={() => setActiveSlug(active ? null : t.slug)}
            >
              {/* Title: behind the image, sitting in the transparent
                  headspace each render was composed with. Nudged right
                  so it lines up under the section heading above. */}
              <div className="absolute inset-x-0 top-0 z-0 p-6 pl-10 md:p-10 md:pl-16">
                <h3>{t.title}</h3>
              </div>

              {/* Image: in front, filling the card — no scale/zoom on
                  interaction, only a small lift. */}
              <div
                className={`absolute inset-0 z-10 transition-transform duration-700 ease-out ${
                  active ? "-translate-y-1.5" : "group-hover:-translate-y-1.5"
                }`}
              >
                <Image
                  src={t.image}
                  alt={t.title}
                  fill
                  quality={92}
                  sizes="(min-width: 768px) 45vw, 92vw"
                  className="object-contain"
                />
              </div>

              {/* Reveal: bottom scrim with the extra explanation. */}
              <div
                className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/65 to-transparent px-6 pt-24 pb-6 transition-opacity duration-500 ease-out md:px-10 md:pb-10 ${
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <p className="mb-5 max-w-md text-white/85">{DESCRIPTIONS[t.slug]}</p>

                {related.length > 0 && (
                  <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                    {related.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/projects/${p.slug}`}
                        className="group/chip relative h-16 w-24 shrink-0 overflow-hidden rounded-[6px] bg-muted md:h-20 md:w-28"
                      >
                        <Image
                          src={p.cover}
                          alt={p.title}
                          fill
                          sizes="120px"
                          className="object-cover transition-transform duration-500 group-hover/chip:scale-110"
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
