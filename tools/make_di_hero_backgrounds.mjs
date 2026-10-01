#!/usr/bin/env node
// Builds the Design Intelligence hero backgrounds: photo-negative versions
// of the same 3 main-site hero images (hero-bg-1/2/3.webp), for a
// futuristic/sci-fi variant of the same hero treatment.
//
// Re-run whenever public/images/hero-bg-*.webp are replaced:
//   node tools/make_di_hero_backgrounds.mjs

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const SRC_DIR = path.join(process.cwd(), "public", "images");
const SOURCES = ["hero-bg-1.webp", "hero-bg-2.webp", "hero-bg-3.webp"];

async function main() {
  for (const name of SOURCES) {
    const inputPath = path.join(SRC_DIR, name);
    if (!fs.existsSync(inputPath)) {
      console.error(`Missing: ${inputPath}`);
      continue;
    }
    const outName = name.replace("hero-bg", "di-hero-bg");
    const outputPath = path.join(SRC_DIR, outName);
    await sharp(inputPath).negate({ alpha: false }).webp({ quality: 90 }).toFile(outputPath);
    console.log(`${name} -> ${outName} (negated)`);
  }
}

main();
