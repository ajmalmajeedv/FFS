"use client";

import { ParticleTextEffect } from "@/components/ui/interactive-text-particle";

const DemoOne = () => {
  return (
    <ParticleTextEffect
      text="FLUID FORMS STUDIO"
      className="absolute top-0 left-0"
      colors={["1a3d2e", "2d5f45", "4a8f6b", "7ec9a3", "c4e8d4", "ffffff"]}
    />
  );
};

export { DemoOne };
