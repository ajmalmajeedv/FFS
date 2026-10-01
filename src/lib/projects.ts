import projectsData from "@/data/projects.generated.json";

export interface Project {
  slug: string;
  title: string;
  cover: string;
  images: string[];
  category: string | null;
  description: string;
}

export const projects = projectsData as Project[];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
