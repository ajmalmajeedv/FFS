#!/usr/bin/env node
// Optimizes the "Fields of work" source photos into the 4 typology cover
// images under public/images/typologies/, and writes
// src/data/typologies.generated.json (the manifest the site reads).
//
// Every run names its output after a hash of the source file's bytes
// (e.g. residential-podium.a1b2c3d4.webp) and deletes any other version
// for that slug. A changed photo therefore always gets a brand-new URL —
// no stale browser/CDN cache can ever show an old photo under it.
//
// Filenames in "Fields of work/" must match the typology titles (case-
// insensitive substring match), e.g. "Residential Podium.jpeg",
// "Master Planning.jpg", "Streetscape & Public Realm.jpg",
// "Campus & Institutional 2.png".
//
// Re-run whenever those source photos are replaced:
//   node tools/sync_fields_of_work.mjs

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const SRC_DIR = path.join(process.cwd(), "Fields of work");
const OUT_DIR = path.join(process.cwd(), "public", "images", "typologies");
const MANIFEST_OUT = path.join(process.cwd(), "src", "data", "typologies.generated.json");
const MAX_WIDTH = 2400;

const SLUGS = [
  { match: "residential podium", slug: "residential-podium", title: "Residential Podium" },
  { match: "master planning", slug: "master-planning", title: "Master Planning" },
  { match: "streetscape", slug: "streetscape-public-realm", title: "Streetscape & Public Realm" },
  { match: "campus", slug: "campus-institutional", title: "Campus & Institutional" },
];

// Hash covers the source bytes AND the processing settings, so bumping
// MAX_WIDTH/quality here busts the cache too, not just a new photo.
function hashFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto
    .createHash("sha1")
    .update(buf)
    .update(`w${MAX_WIDTH}`)
    .digest("hex")
    .slice(0, 8);
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

    // Remove any previously generated version(s) for this slug first.
    for (const existing of fs.readdirSync(OUT_DIR)) {
      if (existing.startsWith(`${slug}.`) && existing !== outName) {
        fs.unlinkSync(path.join(OUT_DIR, existing));
      }
    }

    if (!fs.existsSync(path.join(OUT_DIR, outName))) {
      // Some of these source photos are huge (400+ MP) — disable sharp's
      // default pixel-count safety limit for reading them.
      await sharp(inputPath, { limitInputPixels: false })
        .resize({ width: MAX_WIDTH })
        .webp({ quality: 92 })
        .toFile(path.join(OUT_DIR, outName));
      console.log(`${file} -> ${outName} (new)`);
    } else {
      console.log(`${file} -> ${outName} (unchanged)`);
    }

    manifest.push({ slug, title, image: `/images/typologies/${outName}` });
  }

  fs.mkdirSync(path.dirname(MANIFEST_OUT), { recursive: true });
  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${manifest.length} typologies to ${MANIFEST_OUT}`);
}

main();
