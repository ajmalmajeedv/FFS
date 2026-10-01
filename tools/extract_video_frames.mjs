#!/usr/bin/env node
// Samples a source clip into a numbered sequence of still frames for the
// scroll-scrubbed video section (scroll position -> frame index, instead
// of the clip actually playing). Re-run whenever the source clip changes.
//
// Usage:
//   node tools/extract_video_frames.mjs [inputPath] [outDirName] [frameCount] [width]
// Defaults:
//   "Landing Page Hook/Untitled video (4).mp4" -> public/video-frames/hero-clip
//   frameCount=120, width=1600
//
// Frame count is a size/smoothness trade-off: more frames = smoother
// scrub but a bigger download. 120 frames at 1600px wide/WebP q72 lands
// around 10-15MB total for a ~20s source clip — acceptable for a single
// hero feature section, but re-tune down if it feels heavy on load.

import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const inputPath = process.argv[2] ?? "Landing Page Hook/Untitled video (4).mp4";
const outDirName = process.argv[3] ?? "hero-clip";
const frameCount = Number(process.argv[4] ?? 120);
const width = Number(process.argv[5] ?? 1600);

const outDir = path.join(process.cwd(), "public", "video-frames", outDirName);
const reviewDir = path.join(process.cwd(), "Landing Page Hook", "scroll-frames-review");

// The source clip has a small AI-generator watermark burned into the
// bottom-right corner of every frame, at a fixed pixel position (given
// here for the default 1600-wide output; rescales with `width`).
// It sits on a near-flat gradient background, so a local heavy blur
// erases it cleanly without needing a clone-stamp patch.
const WATERMARK_REGION_AT_1600W = { left: 1390, top: 680, width: 140, height: 140 };

async function removeWatermark(filePath, outputWidth) {
  const scale = outputWidth / 1600;
  const region = {
    left: Math.round(WATERMARK_REGION_AT_1600W.left * scale),
    top: Math.round(WATERMARK_REGION_AT_1600W.top * scale),
    width: Math.round(WATERMARK_REGION_AT_1600W.width * scale),
    height: Math.round(WATERMARK_REGION_AT_1600W.height * scale),
  };
  // Read fully into memory first — sharp(path) mmaps the file on Windows
  // and keeps it locked, which breaks writing back to the same path.
  const original = fs.readFileSync(filePath);
  const patch = await sharp(original).extract(region).blur(Math.max(8, 25 * scale)).toBuffer();
  const fixed = await sharp(original)
    .composite([{ input: patch, left: region.left, top: region.top }])
    .webp({ quality: 72 })
    .toBuffer();
  fs.writeFileSync(filePath, fixed);
}

async function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }

  // ffmpeg writes probe info to stderr and always exits non-zero with no
  // output file given, so we capture stderr from a child process directly.
  let stderr = "";
  try {
    execFileSync(ffmpegPath, ["-i", inputPath], { stdio: ["ignore", "ignore", "pipe"] });
  } catch (err) {
    stderr = err.stderr?.toString() ?? "";
  }
  const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (!match) {
    console.error("Could not read duration from ffmpeg output.");
    process.exit(1);
  }
  const [, hh, mm, ss] = match;
  const duration = Number(hh) * 3600 + Number(mm) * 60 + Number(ss);
  const fps = frameCount / duration;

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const pattern = path.join(outDir, "frame-%04d.webp");
  execFileSync(ffmpegPath, [
    "-i", inputPath,
    "-vf", `fps=${fps},scale=${width}:-2`,
    "-vsync", "vfr",
    "-c:v", "libwebp",
    "-q:v", "72",
    pattern,
  ]);

  const written = fs.readdirSync(outDir).filter((f) => f.endsWith(".webp")).sort();

  for (const f of written) {
    await removeWatermark(path.join(outDir, f), width);
  }

  // A human-browsable copy, numbered plainly (1.webp, 2.webp, ...) for
  // reviewing exactly what the site will scrub through.
  fs.rmSync(reviewDir, { recursive: true, force: true });
  fs.mkdirSync(reviewDir, { recursive: true });
  written.forEach((f, i) => {
    fs.copyFileSync(path.join(outDir, f), path.join(reviewDir, `${i + 1}.webp`));
  });

  const totalBytes = written.reduce(
    (sum, f) => sum + fs.statSync(path.join(outDir, f)).size,
    0
  );
  console.log(
    `${inputPath} (${duration.toFixed(1)}s) -> ${written.length} frames in ${outDir} ` +
      `(${(totalBytes / 1e6).toFixed(1)}MB total), watermark removed, review copy in ${reviewDir}`
  );
}

main();
