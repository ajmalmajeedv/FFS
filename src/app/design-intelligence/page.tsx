import type { Metadata } from "next";
import { DesignIntelligenceClient } from "./DesignIntelligenceClient";

export const metadata: Metadata = {
  title: "Design Intelligence — Fluid Forms Studio",
  description:
    "How Fluid Forms Studio reads landscape decisions through cost, market, and data.",
};

export default function DesignIntelligencePage() {
  return <DesignIntelligenceClient />;
}
