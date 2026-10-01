#!/usr/bin/env node
// Downsizes a raw hero photo (the "Landing Page Hook" folder holds the
// full-resolution originals you upload) into a web-weight asset in
// public/images. Re-run whenever you swap the hero photo.
//
// The hero now cycles 3 backgrounds (Header 1/2/3) — run this once per
// file: node tools/optimize_hero_image.mjs "Landing Page Hook/Header 1.jpeg" hero-bg-1.webp

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const inputPath = process.argv[2] ?? "Landing Page Hook/Header 1.jpeg";
const outputName = process.argv[3] ?? "hero-bg-1.webp";
const outDir = path.join(process.cwd(), "public", "images");
const outputPath = path.join(outDir, outputName);

const MAX_WIDTH = 3840; // 4K — plenty of headroom for the zoomed pan effect

async function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const before = fs.statSync(inputPath).size;
  const image = sharp(inputPath).rotate();
  const meta = await image.metadata();

  await image
    .resize({ width: Math.min(MAX_WIDTH, meta.width ?? MAX_WIDTH) })
    .webp({ quality: 90 })
    .toFile(outputPath);

  const after = fs.statSync(outputPath).size;
  console.log(
    `${inputPath} (${meta.width}x${meta.height}, ${(before / 1e6).toFixed(1)}MB) -> ` +
      `${outputPath} (${(after / 1e6).toFixed(1)}MB)`
  );
}

main();
