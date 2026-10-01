import Image from "next/image";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/lib/projects";
import { ProjectGallery } from "@/components/ui/project-gallery";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main>
      <section className="relative flex h-svh w-full items-end overflow-hidden bg-brand-black">
        <Image
          src={project.cover}
          alt={project.title}
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <h1 className="relative z-10 px-6 pb-16 text-brand-white md:px-10">
          {project.title}
        </h1>
      </section>

      {project.description && (
        <section className="mx-auto max-w-2xl px-6 py-20 md:px-0">
          <p>{project.description}</p>
        </section>
      )}

      {project.images.length > 0 && (
        <section className="py-20">
          <ProjectGallery
            images={project.images.map((src) => ({ src, alt: project.title }))}
            className="px-6 md:px-10"
          />
        </section>
      )}
    </main>
  );
}
