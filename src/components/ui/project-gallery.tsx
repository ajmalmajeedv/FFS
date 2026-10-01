"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface ProjectGalleryProps {
  images: { src: string; alt: string }[];
  className?: string;
}

/**
 * A compact, native-scroll-snap filmstrip (smooth momentum on touch,
 * click-drag on desktop) that opens into a fullscreen lightbox on click —
 * modeled on Apple's horizontal media carousels rather than a slideshow
 * that auto-jumps and fights the user's swipe.
 */
export function ProjectGallery({ images, className = "" }: ProjectGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={trackRef}
        className={`flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="group relative aspect-[4/3] w-[58vw] shrink-0 snap-start overflow-hidden rounded-xl bg-muted sm:w-[38vw] md:w-[26vw] lg:w-[19vw]"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              draggable={false}
              quality={92}
              sizes="(min-width: 1024px) 19vw, (min-width: 768px) 26vw, (min-width: 640px) 38vw, 58vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: { src: string; alt: string }[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const go = (delta: number) => onIndexChange((index + delta + images.length) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-5 right-5 z-10 flex size-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="size-6" strokeWidth={1.5} />
      </button>

      <p className="absolute top-6 left-6 z-10 text-sm tracking-wide text-white/50">
        {index + 1} / {images.length}
      </p>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-2 z-10 flex size-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white md:left-6"
          >
            <ChevronLeft className="size-7" strokeWidth={1.25} />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-2 z-10 flex size-11 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white md:right-6"
          >
            <ChevronRight className="size-7" strokeWidth={1.25} />
          </button>
        </>
      )}

      <div
        className="relative h-[78svh] w-[92vw] md:w-[82vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={images[index].src}
          src={images[index].src}
          alt={images[index].alt}
          fill
          draggable={false}
          quality={92}
          sizes="92vw"
          className="object-contain duration-300 ease-out animate-in fade-in"
          priority
        />
      </div>
    </div>
  );
}
