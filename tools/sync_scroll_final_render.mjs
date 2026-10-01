#!/usr/bin/env node
// Optimizes the single project-render photo that fades in once the
// scroll-scrubbed clip finishes (the "hold" beat before the next
// section). Re-run whenever that source photo is replaced.
//
// Usage: node tools/sync_scroll_final_render.mjs [inputPath]

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const inputPath = process.argv[2] ?? "Landing Page Hook/Lobby 01.jpg";
const outputPath = path.join(process.cwd(), "public", "images", "scroll-final-render.webp");

async function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(inputPath).resize({ width: 2400 }).webp({ quality: 84 }).toFile(outputPath);
  console.log(`${inputPath} -> ${outputPath}`);
}

main();
