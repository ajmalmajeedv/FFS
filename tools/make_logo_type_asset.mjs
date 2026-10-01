#!/usr/bin/env node
// Turns a scanned black-ink-on-white logotype into a white-on-transparent
// PNG for use on dark hero backgrounds (and by the particle-hover effect,
// which needs real alpha to know the letterform shape).
//
// Usage: node tools/make_logo_type_asset.mjs [inputPath] [outputName]

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const inputPath = process.argv[2] ?? "Logo/Logo Type.jpeg";
const outputName = process.argv[3] ?? "logo-type-white.png";
const outDir = path.join(process.cwd(), "public", "images");
const outputPath = path.join(outDir, outputName);

// Below this inverted-luminance value, treat as fully transparent — kills
// faint JPEG compression haze on the "white" background.
const ALPHA_FLOOR = 14;

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const { data, info } = await sharp(inputPath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const inverted = 255 - data[i];
    const alpha = inverted < ALPHA_FLOOR ? 0 : inverted;
    rgba[i * 4] = 255;
    rgba[i * 4 + 1] = 255;
    rgba[i * 4 + 2] = 255;
    rgba[i * 4 + 3] = alpha;
  }

  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile(outputPath);

  console.log(`${inputPath} -> ${outputPath}`);
}

main();
