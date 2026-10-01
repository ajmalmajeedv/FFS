"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Pointer {
  x?: number;
  y?: number;
}

interface Particle {
  ox: number;
  oy: number;
  cx: number;
  cy: number;
  or: number;
  cr: number;
  pv: number;
  ov: number;
  f: number;
  rgb: number[];
}

interface TextBox {
  str: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export interface ParticleTextEffectProps {
  text?: string;
  /** CSS font-family value (may reference a CSS variable, e.g. next/font's). */
  fontFamily?: string;
  fontWeight?: string;
  /** When set, dottifies this image instead of rendering `text`. */
  imageSrc?: string;
  /** Image mode only: image width as a fraction of canvas width. */
  imageWidthRatio?: number;
  colors?: string[];
  className?: string;
  animationForce?: number;
  particleDensity?: number;
}

const ParticleTextEffect: React.FC<ParticleTextEffectProps> = ({
  text = 'HOVER!',
  fontFamily = 'Verdana, sans-serif',
  fontWeight = '900',
  imageSrc,
  imageWidthRatio = 0.7,
  colors = [
    'ffad70', 'f7d297', 'edb9a1', 'e697ac', 'b38dca',
    '9c76db', '705cb5', '43428e', '2c2142'
  ],
  className = '',
  animationForce = 80,
  particleDensity = 3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const particlesRef = useRef<ParticleClass[]>([]);
  const pointerRef = useRef<Pointer>({});
  const hasPointerRef = useRef<boolean>(false);
  const interactionRadiusRef = useRef<number>(100);
  const imageElRef = useRef<HTMLImageElement | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [fontReady, setFontReady] = useState(false);

  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [textBox] = useState<TextBox>({ str: text });

  const rand = (max = 1, min = 0, dec = 0): number => {
    return +(min + Math.random() * (max - min)).toFixed(dec);
  };

  class ParticleClass implements Particle {
    ox: number;
    oy: number;
    cx: number;
    cy: number;
    or: number;
    cr: number;
    pv: number;
    ov: number;
    f: number;
    rgb: number[];

    constructor(x: number, y: number, rgb: number[] = [rand(128), rand(128), rand(128)]) {
      this.ox = x;
      this.oy = y;
      this.cx = x;
      this.cy = y;
      // Radius scales with the sampling grid spacing so neighboring dots
      // overlap and blend into a solid-looking fill at rest — the gaps
      // (and the fact it's made of dots at all) only show once hover
      // physics pushes them apart.
      this.or = rand(particleDensity * 0.9, particleDensity * 0.6);
      this.cr = this.or;
      this.pv = 0;
      this.ov = 0;
      this.f = rand(animationForce + 15, animationForce - 15);
      this.rgb = rgb.map(c => Math.max(0, c + rand(13, -13)));
    }

    draw() {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.fillStyle = `rgb(${this.rgb.join(',')})`;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.cr, 0, 2 * Math.PI);
      ctx.fill();
    }

    move(interactionRadius: number, hasPointer: boolean) {
      let moved = false;

      if (hasPointer && pointerRef.current.x !== undefined && pointerRef.current.y !== undefined) {
        const dx = this.cx - pointerRef.current.x;
        const dy = this.cy - pointerRef.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < interactionRadius && dist > 0) {
          const force = Math.min(this.f, (interactionRadius - dist) / dist * 2);
          this.cx += (dx / dist) * force;
          this.cy += (dy / dist) * force;
          moved = true;
        }
      }

      const odx = this.ox - this.cx;
      const ody = this.oy - this.cy;
      const od = Math.hypot(odx, ody);

      if (od > 1) {
        const restore = Math.min(od * 0.1, 3);
        this.cx += (odx / od) * restore;
        this.cy += (ody / od) * restore;
        moved = true;
      }

      this.draw();
      return moved;
    }
  }

  const dottify = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || !textBox.x || !textBox.y || !textBox.w || !textBox.h) return;

    const data = ctx.getImageData(textBox.x, textBox.y, textBox.w, textBox.h).data;
    const pixels = data.reduce((arr: { x: number; y: number; rgb: Uint8ClampedArray }[], _, i, d) => {
      if (i % 4 === 0) {
        arr.push({
          x: (i / 4) % textBox.w!,
          y: Math.floor((i / 4) / textBox.w!),
          rgb: d.slice(i, i + 4),
        });
      }
      return arr;
    }, []).filter(p => p.rgb[3] && !(p.x % particleDensity) && !(p.y % particleDensity));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pixels.forEach((p, i) => {
      particlesRef.current[i] = new ParticleClass(
        textBox.x! + p.x,
        textBox.y! + p.y,
        Array.from(p.rgb.slice(0, 3))
      );
      particlesRef.current[i].draw();
    });

    particlesRef.current.splice(pixels.length, particlesRef.current.length);
  };

  const writeImage = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const img = imageElRef.current;
    if (!canvas || !ctx || !img) return;

    const w = Math.round(canvas.width * imageWidthRatio);
    const h = Math.round(w * (img.naturalHeight / img.naturalWidth));
    const x = 0.5 * (canvas.width - w);
    const y = 0.5 * (canvas.height - h);
    textBox.w = w;
    textBox.h = h;
    textBox.x = x;
    textBox.y = y;

    interactionRadiusRef.current = Math.max(50, h * 0.9);

    // Paint a gradient rect, then use the logo's own alpha as a stencil
    // over it — same visual result as gradient-filled text, but for an
    // arbitrary raster mark.
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    const N = colors.length - 1;
    colors.forEach((c, i) => gradient.addColorStop(i / N, `#${c}`));
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);

    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(img, x, y, w, h);
    ctx.globalCompositeOperation = 'source-over';

    dottify();
  };

  const write = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    if (imageSrc) {
      if (imageReady) writeImage();
      return;
    }

    if (!fontReady) return;

    textBox.str = text;

    // Canvas font strings need the fully-resolved family name — CSS
    // variables (e.g. next/font's) don't resolve inside ctx.font itself,
    // so read it back via computed style on the canvas element.
    const resolvedFamily = getComputedStyle(canvas).fontFamily || fontFamily;
    ctx.textAlign = 'center';
    // 'alphabetic' (not 'middle') so actualBoundingBox* metrics below are
    // measured from a known baseline — 'middle' assumes glyph height ~=
    // font size, which is wrong for fonts whose ascenders/descenders run
    // past that, clipping the top/bottom of the letters.
    ctx.textBaseline = 'alphabetic';

    let fontSize = Math.floor(canvas.width / textBox.str.length) * 1.15;
    ctx.font = `${fontWeight} ${fontSize}px ${resolvedFamily}`;
    let metrics = ctx.measureText(textBox.str);

    // Shrink to fit width if the larger size would overflow the canvas.
    const maxWidth = canvas.width * 0.94;
    if (metrics.width > maxWidth) {
      fontSize *= maxWidth / metrics.width;
      ctx.font = `${fontWeight} ${fontSize}px ${resolvedFamily}`;
      metrics = ctx.measureText(textBox.str);
    }

    const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
    const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
    // Generous headroom — actualBoundingBox* has shown to run a little
    // tight for some variable-font weights, so err on the side of extra
    // margin rather than risk clipping the glyphs top/bottom again.
    const padding = Math.ceil(fontSize * 0.25);

    textBox.w = Math.ceil(metrics.width) + padding * 2;
    textBox.h = Math.ceil(ascent + descent) + padding * 2;
    textBox.x = 0.5 * (canvas.width - textBox.w);
    // Solve for the baseline that puts the glyphs' true vertical center
    // (not the font-size-implied center) at the canvas's center.
    const baselineY = 0.5 * canvas.height + 0.5 * (ascent - descent);
    textBox.y = baselineY - ascent - padding;

    interactionRadiusRef.current = Math.max(50, textBox.h * 1.5);

    const gradient = ctx.createLinearGradient(textBox.x, textBox.y, textBox.x + textBox.w, textBox.y + textBox.h);
    const N = colors.length - 1;
    colors.forEach((c, i) => gradient.addColorStop(i / N, `#${c}`));
    ctx.fillStyle = gradient;

    ctx.fillText(textBox.str, 0.5 * canvas.width, baselineY);
    dottify();
  };

  const animate = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesRef.current.forEach(p => p.move(interactionRadiusRef.current, hasPointerRef.current));
    animationIdRef.current = requestAnimationFrame(animate);
  };

  const initialize = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    write();
  };

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!imageSrc) {
      imageElRef.current = null;
      setImageReady(false);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      imageElRef.current = img;
      setImageReady(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (imageSrc) return;
    let cancelled = false;
    const canvas = canvasRef.current;
    // Resolve any CSS variable in fontFamily via computed style before
    // asking the Font Loading API to load it.
    const familyToLoad = canvas ? getComputedStyle(canvas).fontFamily || fontFamily : fontFamily;
    document.fonts
      .load(`${fontWeight} 100px ${familyToLoad}`)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFontReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [fontFamily, fontWeight, imageSrc]);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fontReady, imageSrc, imageReady, imageWidthRatio, colors, animationForce, particleDensity, canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;
    initialize();

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    pointerRef.current.x = (e.clientX - rect.left) * scaleX;
    pointerRef.current.y = (e.clientY - rect.top) * scaleY;
    hasPointerRef.current = true;

    if (!animationIdRef.current) animate();
  };

  const handlePointerLeave = () => {
    hasPointerRef.current = false;
    pointerRef.current.x = undefined;
    pointerRef.current.y = undefined;

    if (!animationIdRef.current) animate();
  };

  const handlePointerEnter = () => {
    hasPointerRef.current = true;
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className} cursor-none`}
      style={{ fontFamily }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
    />
  );
};

export { ParticleTextEffect };
