#!/usr/bin/env node
// Generates the 4 hyperrealistic cover photos for the "typologies" split
// section (Residential Podium / Master Planning / Streetscape & Public
// Realm / Campus & Institutional) via the Gemini image model, using the
// key in .env. Costs API credits — re-run deliberately, not on a loop.
//
// Usage: node tools/generate_typology_covers.mjs

import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import fs from "node:fs";
import "dotenv/config";

const OUT_DIR = path.join(process.cwd(), "public", "images", "typologies");
const MODEL = "gemini-2.5-flash-image";

const TYPOLOGIES = [
  {
    slug: "residential-podium",
    title: "Residential Podium",
    prompt:
      "Hyperrealistic architectural photograph, portrait orientation, of a luxury residential podium garden atop a mid-rise tower base in the Gulf (UAE/Saudi style). Lush mature palm and shade trees, an infinity-edge pool, timber deck seating areas, warm golden-hour sunlight, soft shadows, editorial real-estate photography, shot on a full-frame camera, extremely detailed, no people, no text, no watermark, no logo.",
  },
  {
    slug: "master-planning",
    title: "Master Planning",
    prompt:
      "Hyperrealistic aerial drone photograph, portrait orientation, of a large-scale master-planned community in the Gulf desert: green boulevards, tree-lined streets, mixed-use low-rise blocks, roundabout parks, clear daylight, crisp architectural detail, editorial urban-planning photography, no people close-up, no text, no watermark, no logo.",
  },
  {
    slug: "streetscape-public-realm",
    title: "Streetscape & Public Realm",
    prompt:
      "Hyperrealistic street-level architectural photograph, portrait orientation, of a shaded landscaped urban streetscape and public plaza in a Middle Eastern city: mature trees providing dappled shade, patterned stone paving, minimal street furniture, a few pedestrians walking at a distance, warm afternoon light, editorial landscape-architecture photography, no text, no watermark, no logo.",
  },
  {
    slug: "campus-institutional",
    title: "Campus & Institutional",
    prompt:
      "Hyperrealistic architectural photograph, portrait orientation, of a university or civic campus courtyard landscape: green lawns, shaded colonnade walkways, modern institutional architecture in the background, a few students walking at a distance, bright clear daylight, editorial campus photography, no text, no watermark, no logo.",
  },
];

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not set in .env");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const ai = new GoogleGenAI({ apiKey });

  for (const t of TYPOLOGIES) {
    console.log(`Generating: ${t.title}...`);
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: t.prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData);
    if (!imagePart?.inlineData?.data) {
      console.error(`  No image returned for ${t.title}. Full response:`, JSON.stringify(response, null, 2));
      continue;
    }

    const buffer = Buffer.from(imagePart.inlineData.data, "base64");
    const outPath = path.join(OUT_DIR, `${t.slug}.png`);
    fs.writeFileSync(outPath, buffer);
    console.log(`  -> ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
