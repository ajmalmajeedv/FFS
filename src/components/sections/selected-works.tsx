import Link from "next/link";
import Image from "next/image";
import { projects } from "@/lib/projects";

export function SelectedWorks() {
  return (
    <section className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-36">
      <p className="label-eyebrow mb-4">Fluid Forms Studio</p>
      <h2 className="mb-16 md:mb-24">Selected Works</h2>

      <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 md:gap-y-24">
        {projects.map((project, i) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group block"
            style={i % 2 === 1 ? { marginTop: "clamp(0px, 8vw, 96px)" } : undefined}
          >
            <div className="mx-auto w-[88%]">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[10px] bg-muted">
                <Image
                  src={project.cover}
                  alt={project.title}
                  fill
                  quality={92}
                  sizes="(min-width: 768px) 46vw, 92vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              </div>
              <h3 className="mt-5 text-xl md:text-2xl">{project.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
