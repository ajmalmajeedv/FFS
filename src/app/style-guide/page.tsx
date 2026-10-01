import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function Swatch({
  name,
  varName,
  hex,
  dark,
}: {
  name: string;
  varName: string;
  hex: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-24 w-full border border-border"
        style={{ background: `var(${varName})` }}
      />
      <div className={dark ? "" : ""}>
        <p className="text-sm font-medium">{name}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {varName} · {hex}
        </p>
      </div>
    </div>
  );
}

export default function StyleGuidePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-24 md:px-10">
      <p className="label-eyebrow mb-4">Fluid Forms Studio</p>
      <h1 className="mb-2">Design system</h1>
      <p className="max-w-2xl text-muted-foreground">
        Reference page — not a public route. Colors, type, and core
        components, built on the exact green already used on the live
        site, kept minimal, bold, and architectural.
      </p>

      <Separator className="my-16" />

      <section>
        <h2 className="mb-8">Color</h2>
        <p className="mb-8 max-w-2xl text-muted-foreground">
          Mix by screen coverage, not by token count: 70% white/off-white,
          20% green (structure — nav, dividers, headings, primary
          actions), 8% black (body text, occasional dark section), 3%
          terracotta (one spark per view — a single CTA or tag, never a
          fill, never next to green in the same element).
        </p>
        <p className="label-eyebrow mb-4">Brand ramp</p>
        <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          <Swatch name="Green 900" varName="--brand-green-900" hex="#1F3D18" />
          <Swatch name="Green 700" varName="--brand-green-700" hex="#3C6E28" />
          <Swatch name="Green 500 (primary)" varName="--brand-green-500" hex="#3C7832" />
          <Swatch name="Green 300" varName="--brand-green-300" hex="#5A9E3C" />
          <Swatch name="Green 100" varName="--brand-green-100" hex="#CFE3B8" />
          <Swatch name="Terracotta 700" varName="--brand-terracotta-700" hex="#8B4A2A" />
          <Swatch name="Terracotta 500 (~3% use)" varName="--brand-terracotta-500" hex="#B5643A" />
          <Swatch name="Terracotta 100" varName="--brand-terracotta-100" hex="#ECD9C9" />
          <Swatch name="Black" varName="--brand-black" hex="#141310" />
          <Swatch name="White" varName="--brand-white" hex="#FFFFFF" />
        </div>
        <p className="label-eyebrow mb-4">Semantic (light mode)</p>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <Swatch name="Background" varName="--background" hex="#FFFFFF" />
          <Swatch name="Foreground" varName="--foreground" hex="#141310" />
          <Swatch name="Muted" varName="--muted" hex="#F5F3EE" />
          <Swatch name="Muted foreground" varName="--muted-foreground" hex="#6B6860" />
          <Swatch name="Border" varName="--border" hex="#E4E1D9" />
          <Swatch name="Primary" varName="--primary" hex="#3C7832" />
          <Swatch name="Secondary" varName="--secondary" hex="#141310" />
          <Swatch name="Accent" varName="--accent" hex="#EFF5EC" />
        </div>
      </section>

      <Separator className="my-16" />

      <section>
        <h2 className="mb-8">Type</h2>
        <p className="label-eyebrow mb-2">
          Display / headings — Fraunces (serif)
        </p>
        <div className="mb-12 flex flex-col gap-6">
          <h1>Landscape, considered.</h1>
          <h2>Residential Podium</h2>
          <h3>Master Planning</h3>
          <h4>Streetscape and Public Realm</h4>
        </div>
        <p className="label-eyebrow mb-2">Body / UI — Inter (sans)</p>
        <p className="max-w-2xl">
          Fluid Forms Studio designs landscapes across the Gulf — from
          residential podiums to master plans — with a restrained,
          material-led approach. One idea per section, one clear image,
          no clutter.
        </p>
        <p className="label-eyebrow mt-6 mb-2">
          Eyebrow / label — the only small text allowed
        </p>
        <p className="label-eyebrow">Selected Projects — 2026</p>
      </section>

      <Separator className="my-16" />

      <section>
        <h2 className="mb-8">Components</h2>
        <div className="mb-10 flex flex-wrap items-center gap-4">
          <Button variant="default">Primary action</Button>
          <Button variant="secondary">Secondary action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button className="bg-highlight text-highlight-foreground hover:bg-highlight/85">
            Highlight (use rarely)
          </Button>
          <Badge>New</Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Al Fahid Terra Garden</CardTitle>
              <CardDescription>Residential Podium — Abu Dhabi</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A minimal project card: image, title, one line of context.
                Nothing nested underneath.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-brand-black text-brand-white">
            <CardHeader>
              <CardTitle className="text-brand-white">
                Dark surface
              </CardTitle>
              <CardDescription className="text-white/60">
                For full-bleed hero and video sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/80">
                Brand black background with white text and the green
                accent for interactive states.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
