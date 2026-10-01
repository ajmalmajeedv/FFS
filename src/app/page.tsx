import { ScrollVideo } from "@/components/sections/scroll-video";
import { LogosMarquee } from "@/components/sections/logos-marquee";
import { Typologies } from "@/components/sections/typologies";
import { SelectedWorks } from "@/components/sections/selected-works";
import { StrategizeCta } from "@/components/sections/strategize-cta";

const SCROLL_VIDEO_SECTIONS = [
  {
    eyebrow: "Data-Driven Landscape Design",
    heading: "Design that performs — by intelligence",
    body: "We build the design from site data — solar, wind, shade, movement, soil — so every decision has a reason behind it.",
  },
  {
    eyebrow: "User Behaviour",
    heading: "How people move shapes the plan",
    body: "Desire lines, dwell points, shade-seeking, peak hours. We design around observed behaviour, not assumed behaviour.",
  },
  {
    eyebrow: "Commercial Justification",
    heading: "Every move, commercially defensible",
    body: "Usable hours gained, maintenance reduced, amenity value proven — landscape you can put in front of a board.",
  },
];

const HERO_BACKGROUNDS = [
  "/images/hero-bg-1.webp",
  "/images/hero-bg-2.webp",
  "/images/hero-bg-3.webp",
];

export default function Home() {
  return (
    <main>
      <ScrollVideo
        id="scroll-video"
        clip="hero-clip"
        frameCount={112}
        introVh={60}
        scrollLengthVh={400}
        heroText="FLUID FORM STUDIO"
        heroBackgrounds={HERO_BACKGROUNDS}
        sections={SCROLL_VIDEO_SECTIONS}
        finalImage="/images/scroll-final-render.webp"
      />
      <LogosMarquee />
      <Typologies />
      <SelectedWorks />
      <StrategizeCta />
    </main>
  );
}
