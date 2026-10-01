import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StrategizeCta() {
  return (
    <section className="flex min-h-[70svh] flex-col items-center justify-center gap-14 bg-brand-black px-6 py-24 text-center text-brand-white">
      <h2 className="max-w-4xl text-brand-white">
        We don&apos;t just design,
        <br />
        we strategize.
      </h2>

      <Link
        href="/design-intelligence"
        className="group flex flex-col items-center gap-3"
      >
        <span className="label-eyebrow text-white/60 group-hover:text-brand-green-300">
          Go to Design Intelligence
        </span>
        <span className="flex size-16 items-center justify-center rounded-full border border-white/25 transition-colors group-hover:border-brand-green-300 group-hover:bg-brand-green-300/10">
          <ArrowRight
            className="size-6 -rotate-45 transition-transform group-hover:rotate-0"
            strokeWidth={1.5}
          />
        </span>
      </Link>
    </section>
  );
}
