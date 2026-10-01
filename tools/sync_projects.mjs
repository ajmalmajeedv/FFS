#!/usr/bin/env node
// Reads the raw "Projects/<Project Name>/*.jpg|png|webp" folders you drop
// photos into, optimizes them, and writes:
//   - public/projects/<slug>/cover.webp + 01.webp, 02.webp, ...
//   - src/data/projects.generated.json (the manifest the site reads)
//
// A folder with a file whose name contains "header" uses that as the
// cover; otherwise the alphabetically first image is the cover.
//
// FEATURED_ORDER below pins specific projects to the front of Selected
// Works (in the order listed); everything else follows alphabetically.
//
// Re-run any time you add, remove, or replace project photos:
//   node tools/sync_projects.mjs

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const PROJECTS_DIR = path.join(process.cwd(), "Projects");
const PUBLIC_OUT = path.join(process.cwd(), "public", "projects");
const MANIFEST_OUT = path.join(process.cwd(), "src", "data", "projects.generated.json");
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
const MAX_WIDTH = 3200;
const FEATURED_ORDER = ["Rise By Athlon"];

// Tentative — inferred from project names/types, not confirmed by the
// client. Slugs must match src/data/typologies_isometric.generated.json
// (built by sync_fields_of_work_isometrics.mjs). Correct/extend this as
// real categorization comes in; unmapped projects just get category:null.
const CATEGORY_MAP = {
  "rise-by-athlon": "residential-podium",
  "al-fahid-terra-garden": "residential-podium",
  "ata-master-plan": "master-planning",
  nyuad: "campus-institutional",
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function optimizeTo(inputPath, outputPath) {
  const image = sharp(inputPath).rotate();
  const meta = await image.metadata();
  await image
    .resize({ width: Math.min(MAX_WIDTH, meta.width ?? MAX_WIDTH) })
    .webp({ quality: 92 })
    .toFile(outputPath);
}

async function main() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error(`Not found: ${PROJECTS_DIR}`);
    process.exit(1);
  }

  const alphabetical = fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const featured = FEATURED_ORDER.filter((name) => alphabetical.includes(name));
  const rest = alphabetical.filter((name) => !FEATURED_ORDER.includes(name));
  const projectDirs = [...featured, ...rest];

  const manifest = [];

  for (const name of projectDirs) {
    const dir = path.join(PROJECTS_DIR, name);
    const files = fs
      .readdirSync(dir)
      .filter((f) => IMAGE_EXT.test(f))
      .sort();

    if (files.length === 0) {
      console.log(`skip "${name}" — no images yet`);
      continue;
    }

    const slug = slugify(name);
    const outDir = path.join(PUBLIC_OUT, slug);
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });

    const headerFile = files.find((f) => /header/i.test(f));
    const coverFile = headerFile ?? files[0];
    const restFiles = files.filter((f) => f !== coverFile);

    await optimizeTo(path.join(dir, coverFile), path.join(outDir, "cover.webp"));

    const images = [];
    for (let i = 0; i < restFiles.length; i++) {
      const outName = `${String(i + 1).padStart(2, "0")}.webp`;
      await optimizeTo(path.join(dir, restFiles[i]), path.join(outDir, outName));
      images.push(`/projects/${slug}/${outName}`);
    }

    manifest.push({
      slug,
      title: name,
      cover: `/projects/${slug}/cover.webp`,
      images,
      category: CATEGORY_MAP[slug] ?? null,
      description: "",
    });

    console.log(`"${name}" -> ${images.length + 1} images`);
  }

  fs.mkdirSync(path.dirname(MANIFEST_OUT), { recursive: true });
  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${manifest.length} projects to ${MANIFEST_OUT}`);
}

main();
