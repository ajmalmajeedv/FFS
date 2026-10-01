#!/usr/bin/env node
// Optimizes the "Design Intelligence/assets" source images into
// public/design-intelligence and copies the background video across
// as-is. Re-run whenever those source assets change.

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const SRC_DIR = path.join(process.cwd(), "Design Intelligence", "assets");
const OUT_DIR = path.join(process.cwd(), "public", "design-intelligence");

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(SRC_DIR);
  for (const file of files) {
    const inputPath = path.join(SRC_DIR, file);
    const ext = path.extname(file).toLowerCase();

    if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
      const outName = path.basename(file, ext) + ".webp";
      await sharp(inputPath).webp({ quality: 85 }).toFile(path.join(OUT_DIR, outName));
      console.log(`${file} -> ${outName}`);
    } else if (ext === ".mp4") {
      fs.copyFileSync(inputPath, path.join(OUT_DIR, file));
      console.log(`${file} -> copied as-is`);
    }
  }
}

main();
