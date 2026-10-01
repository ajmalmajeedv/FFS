#!/usr/bin/env node
// Optimizes the "Fields of work Isometrics Zoomin" source renders
// (transparent-background isometric cutouts, zoomed in, each with
// deliberate blank space reserved at the top of the square canvas) into
// public/images/typologies-isometric/, and writes
// src/data/typologies_isometric.generated.json (the manifest the site
// reads). Alpha is preserved (webp supports it).
//
// IMPORTANT: do not .trim() — the transparent headspace at the top of
// each square source is intentional; the card title sits there, behind
// the image, showing through.
//
// Like sync_fields_of_work.mjs, output filenames are hashed from the
// source bytes + processing settings, so a replaced photo always gets a
// brand-new URL (no stale cache).
//
// Filenames in the source folder must match the typology titles (case-
// insensitive substring match).
//
// Re-run whenever those source renders are replaced:
//   node tools/sync_fields_of_work_isometrics.mjs

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const SRC_DIR = path.join(process.cwd(), "Fields of work Isometrics Zoomin");
const OUT_DIR = path.join(process.cwd(), "public", "images", "typologies-isometric");
const MANIFEST_OUT = path.join(process.cwd(), "src", "data", "typologies_isometric.generated.json");
const MAX_WIDTH = 2000;

const SLUGS = [
  { match: "residential podium", slug: "residential-podium", title: "Residential Podium" },
  { match: "master planning", slug: "master-planning", title: "Master Planning" },
  { match: "campus", slug: "campus-institutional", title: "Campus and Institutional" },
  { match: "streetscape", slug: "streetscape-public-realm", title: "Streetscape and Public Realm" },
];

function hashFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha1").update(buf).update(`w${MAX_WIDTH}`).digest("hex").slice(0, 8);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = fs.readdirSync(SRC_DIR);
  const manifest = [];

  for (const { match, slug, title } of SLUGS) {
    const file = files.find((f) => f.toLowerCase().includes(match));
    if (!file) {
      console.log(`No source file found for "${match}" — skipping.`);
      continue;
    }
    const inputPath = path.join(SRC_DIR, file);
    const hash = hashFile(inputPath);
    const outName = `${slug}.${hash}.webp`;

    for (const existing of fs.readdirSync(OUT_DIR)) {
      if (existing.startsWith(`${slug}.`) && existing !== outName) {
        fs.unlinkSync(path.join(OUT_DIR, existing));
      }
    }

    if (!fs.existsSync(path.join(OUT_DIR, outName))) {
      const image = sharp(inputPath, { limitInputPixels: false });
      const meta = await image.metadata();
      await image
        .resize({ width: Math.min(MAX_WIDTH, meta.width ?? MAX_WIDTH) })
        .webp({ quality: 92, alphaQuality: 100 })
        .toFile(path.join(OUT_DIR, outName));
      console.log(`${file} -> ${outName} (new)`);
    } else {
      console.log(`${file} -> ${outName} (unchanged)`);
    }

    const finalMeta = await sharp(path.join(OUT_DIR, outName)).metadata();
    manifest.push({
      slug,
      title,
      image: `/images/typologies-isometric/${outName}`,
      width: finalMeta.width,
      height: finalMeta.height,
    });
  }

  fs.mkdirSync(path.dirname(MANIFEST_OUT), { recursive: true });
  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${manifest.length} isometric typologies to ${MANIFEST_OUT}`);
}

main();
