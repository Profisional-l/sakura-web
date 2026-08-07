"use client";

import { useEffect, useRef } from "react";

type FieldMode = "ambient" | "hero" | "services";

interface SakuraFieldProps {
  density?: number;
  mode?: FieldMode;
  /** 0–1 intensity boost (services section reactivity). */
  intensity?: number;
  className?: string;
}

interface Petal {
  x: number;
  y: number;
  z: number;
  size: number;
  speedY: number;
  speedX: number;
  sway: number;
  swaySpeed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  hue: number;
  spin: number;
}

interface Orb {
  x: number;
  y: number;
  cx: number;
  cy: number;
  ampX: number;
  ampY: number;
  r: number;
  hue: number;
  phase: number;
  speed: number;
  alpha: number;
}

const HUES = [335, 328, 345, 318, 350];

function createPetal(w: number, h: number, seeded: boolean, mode: FieldMode): Petal {
  const z = Math.random();
  const near = z > 0.55;
  const sizeBase = mode === "hero" ? 7 : mode === "services" ? 6 : 5;
  const size = sizeBase + z * (near ? 16 : 9);
  return {
    x: Math.random() * w,
    y: seeded ? Math.random() * h : -size * 2 - Math.random() * h * 0.25,
    z,
    size,
    speedY: 0.18 + z * 0.7,
    speedX: -0.2 + Math.random() * 0.4,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.004 + Math.random() * 0.014,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (-0.01 + Math.random() * 0.02) * (near ? 1.4 : 0.7),
    opacity: (near ? 0.35 : 0.12) + Math.random() * 0.35,
    hue: HUES[Math.floor(Math.random() * HUES.length)],
    spin: Math.random() * Math.PI,
  };
}

function createOrb(w: number, h: number, mode: FieldMode): Orb {
  const heroBias = mode === "hero" || mode === "services";
  const cx = heroBias ? w * (0.55 + Math.random() * 0.35) : w * (0.2 + Math.random() * 0.6);
  const cy = h * (0.2 + Math.random() * 0.5);
  return {
    x: cx,
    y: cy,
    cx,
    cy,
    ampX: w * (0.08 + Math.random() * 0.12),
    ampY: h * (0.06 + Math.random() * 0.1),
    r: (heroBias ? 160 : 90) + Math.random() * (heroBias ? 220 : 140),
    hue: HUES[Math.floor(Math.random() * HUES.length)],
    phase: Math.random() * Math.PI * 2,
    speed: 0.00035 + Math.random() * 0.00045,
    alpha: heroBias ? 0.14 + Math.random() * 0.1 : 0.06 + Math.random() * 0.06,
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal, windX: number, windY: number) {
  ctx.save();
  ctx.translate(p.x + windX * p.z * 18, p.y + windY * p.z * 8);
  ctx.rotate(p.rotation);
  ctx.scale(1, 0.62 + Math.sin(p.spin) * 0.18);
  ctx.globalAlpha = p.opacity;

  const g = ctx.createLinearGradient(0, -p.size, 0, p.size);
  g.addColorStop(0, `hsla(${p.hue}, 100%, 94%, 1)`);
  g.addColorStop(0.55, `hsla(${p.hue}, 92%, 78%, 0.95)`);
  g.addColorStop(1, `hsla(${p.hue}, 80%, 62%, 0.55)`);
  ctx.fillStyle = g;

  if (p.z > 0.6) {
    ctx.shadowColor = `hsla(${p.hue}, 100%, 78%, 0.55)`;
    ctx.shadowBlur = p.size * 0.9;
  }

  ctx.beginPath();
  ctx.moveTo(0, -p.size);
  ctx.bezierCurveTo(p.size * 0.72, -p.size * 0.5, p.size * 0.55, p.size * 0.55, 0, p.size);
  ctx.bezierCurveTo(-p.size * 0.55, p.size * 0.55, -p.size * 0.72, -p.size * 0.5, 0, -p.size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawOrb(ctx: CanvasRenderingContext2D, o: Orb) {
  const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
  g.addColorStop(0, `hsla(${o.hue}, 100%, 78%, ${o.alpha})`);
  g.addColorStop(0.45, `hsla(${o.hue}, 90%, 55%, ${o.alpha * 0.35})`);
  g.addColorStop(1, `hsla(${o.hue}, 80%, 40%, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Procedural sakura atmosphere — depth petals + soft bloom orbs + cursor wind.
 * Replaces heavy looping 3D videos as the brand ambient language.
 */
export function SakuraField({
  density = 28,
  mode = "ambient",
  intensity = 0,
  className = "sakura-field",
}: SakuraFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const orbCount = mode === "ambient" ? 2 : mode === "hero" ? 4 : 5;
    const count = Math.max(
      8,
      Math.round(density * (coarse ? 0.45 : 1) * (mode === "hero" ? 1.15 : 1))
    );

    let w = 0;
    let h = 0;
    let petals: Petal[] = [];
    let orbs: Orb[] = [];
    let frame = 0;
    let running = true;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let windX = 0;
    let windY = 0;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      petals = Array.from({ length: count }, () => createPetal(w, h, true, mode));
      orbs = Array.from({ length: orbCount }, () => createOrb(w, h, mode));
    };

    resize();
    seed();

    const onPointer = (e: PointerEvent) => {
      pointerX = e.clientX / w;
      pointerY = e.clientY / h;
    };

    const render = () => {
      if (!running) return;
      t += 1;
      const boost = intensityRef.current;

      const targetWindX = (pointerX - 0.5) * (0.55 + boost * 0.35);
      const targetWindY = (pointerY - 0.5) * (0.25 + boost * 0.2);
      windX += (targetWindX - windX) * 0.045;
      windY += (targetWindY - windY) * 0.045;

      ctx.clearRect(0, 0, w, h);

      // Far bloom first — continuous Lissajous drift, no edge bounce / size jump
      const now = performance.now();
      for (const orb of orbs) {
        orb.x = orb.cx + Math.sin(now * orb.speed + orb.phase) * orb.ampX;
        orb.y = orb.cy + Math.cos(now * orb.speed * 0.85 + orb.phase * 1.3) * orb.ampY;
        drawOrb(ctx, orb);
      }

      // Sort occasionally for depth feel without per-frame cost
      if (t % 30 === 0) petals.sort((a, b) => a.z - b.z);

      for (const p of petals) {
        p.sway += p.swaySpeed;
        p.spin += 0.02 + p.z * 0.02;
        p.y += p.speedY * (1 + boost * 0.35);
        p.x += p.speedX + Math.sin(p.sway) * (0.45 + p.z * 0.5) + windX * (0.6 + p.z);
        p.rotation += p.rotationSpeed;

        if (p.y > h + p.size * 3) Object.assign(p, createPetal(w, h, false, mode));
        if (p.x < -p.size * 4) p.x = w + p.size;
        if (p.x > w + p.size * 4) p.x = -p.size;

        drawPetal(ctx, p, windX, windY);
      }

      frame = requestAnimationFrame(render);
    };

    render();

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        render();
      }
    };

    const onResize = () => {
      resize();
      seed();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, mode]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
