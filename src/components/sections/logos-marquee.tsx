import Image from "next/image";
import logos from "@/data/logos.generated.json";

export function LogosMarquee() {
  // Doubled so the track can loop seamlessly at translateX(-50%).
  const track = [...logos, ...logos];

  return (
    <section className="overflow-hidden border-y border-border bg-background py-14">
      <div className="marquee-track flex w-max items-center gap-16 md:gap-24">
        {track.map((logo, i) => (
          <div
            key={`${logo.src}-${i}`}
            className="flex h-10 w-32 shrink-0 items-center justify-center opacity-55 grayscale transition-opacity duration-300 hover:opacity-100 hover:grayscale-0 md:h-12 md:w-40"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={48}
              className="max-h-full w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
