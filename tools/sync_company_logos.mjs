#!/usr/bin/env node
// Normalizes the "Collaborative Companies Logos" folder into a consistent
// set of transparent-background marks for the logo marquee: keys out
// near-white backgrounds on flattened logos, trims, and caps every mark
// to the same height so they read at "the same scale" in a row.
//
// Re-run whenever you add/replace a company logo file.

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const SRC_DIR = path.join(process.cwd(), "Collaborative Companies Logos");
const OUT_DIR = path.join(process.cwd(), "public", "logos");
const MANIFEST_OUT = path.join(process.cwd(), "src", "data", "logos.generated.json");
const TARGET_HEIGHT = 160;
const WHITE_ALPHA_FLOOR = 14;

async function keyOutWhite(inputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const whiteness = Math.min(data[i], data[i + 1], data[i + 2]);
    const alpha = 255 - whiteness;
    data[i + 3] = Math.min(data[i + 3], alpha < WHITE_ALPHA_FLOOR ? 0 : alpha);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = fs.readdirSync(SRC_DIR).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();
  const manifest = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(SRC_DIR, file);
    const meta = await sharp(inputPath).metadata();

    const image = meta.hasAlpha ? sharp(inputPath) : await keyOutWhite(inputPath);
    const outName = `logo-${i + 1}.webp`;
    await image.trim().resize({ height: TARGET_HEIGHT }).webp({ quality: 90 }).toFile(path.join(OUT_DIR, outName));

    manifest.push({ src: `/logos/${outName}`, alt: `Collaborator ${i + 1}` });
    console.log(`${file} -> ${outName}`);
  }

  fs.mkdirSync(path.dirname(MANIFEST_OUT), { recursive: true });
  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${manifest.length} logos to ${MANIFEST_OUT}`);
}

main();
