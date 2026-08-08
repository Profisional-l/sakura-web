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
  /** Extra lateral velocity from cursor gusts. */
  vx: number;
  vy: number;
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
    vx: 0,
    vy: 0,
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

function drawPetal(
  ctx: CanvasRenderingContext2D,
  p: Petal,
  leanX: number,
  leanY: number
) {
  ctx.save();
  ctx.translate(p.x + leanX, p.y + leanY);
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
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const windEnabled = finePointer && !coarse;

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
    let t = 0;

    // Cursor wind state (desktop only)
    let pointerX = w * 0.5;
    let pointerY = h * 0.5;
    let prevPointerX = pointerX;
    let prevPointerY = pointerY;
    let velX = 0;
    let velY = 0;
    let gustX = 0;
    let gustY = 0;
    let lastPointerTs = performance.now();

    const applyCanvasSize = (nextW: number, nextH: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      w = nextW;
      h = nextH;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      petals = Array.from({ length: count }, () => createPetal(w, h, true, mode));
      orbs = Array.from({ length: orbCount }, () => createOrb(w, h, mode));
    };

    const rescale = (prevW: number, prevH: number) => {
      if (!prevW || !prevH) {
        seed();
        return;
      }
      const sx = w / prevW;
      const sy = h / prevH;
      for (const p of petals) {
        p.x *= sx;
        p.y *= sy;
      }
      for (const o of orbs) {
        o.cx *= sx;
        o.cy *= sy;
        o.x *= sx;
        o.y *= sy;
        o.ampX *= sx;
        o.ampY *= sy;
        o.r *= Math.min(sx, sy);
      }
      pointerX *= sx;
      pointerY *= sy;
      prevPointerX = pointerX;
      prevPointerY = pointerY;
    };

    applyCanvasSize(window.innerWidth, window.innerHeight);
    pointerX = w * 0.5;
    pointerY = h * 0.5;
    prevPointerX = pointerX;
    prevPointerY = pointerY;
    seed();

    const onPointer = (e: PointerEvent) => {
      if (!windEnabled || e.pointerType === "touch") return;

      const now = performance.now();
      const dt = Math.max(8, Math.min(48, now - lastPointerTs));
      lastPointerTs = now;

      const nx = e.clientX;
      const ny = e.clientY;
      // px-per-tick velocity — a bit hotter so slow mouse moves still register
      const rawVx = ((nx - prevPointerX) / dt) * 22;
      const rawVy = ((ny - prevPointerY) / dt) * 22;
      prevPointerX = nx;
      prevPointerY = ny;
      pointerX = nx;
      pointerY = ny;

      velX = velX * 0.45 + rawVx * 0.55;
      velY = velY * 0.45 + rawVy * 0.55;
    };

    const render = () => {
      if (!running) return;
      t += 1;
      const boost = intensityRef.current;

      if (windEnabled) {
        // Gust from cursor velocity — moderate, local only.
        gustX += (velX * 0.4 - gustX) * 0.14;
        gustY += (velY * 0.28 - gustY) * 0.14;
        gustX *= 0.93;
        gustY *= 0.93;
        velX *= 0.86;
        velY *= 0.86;
      } else {
        gustX *= 0.9;
        gustY *= 0.9;
      }

      ctx.clearRect(0, 0, w, h);

      const now = performance.now();
      for (const orb of orbs) {
        orb.x = orb.cx + Math.sin(now * orb.speed + orb.phase) * orb.ampX;
        orb.y = orb.cy + Math.cos(now * orb.speed * 0.85 + orb.phase * 1.3) * orb.ampY;
        drawOrb(ctx, orb);
      }

      if (t % 30 === 0) petals.sort((a, b) => a.z - b.z);

      // Foreground petals only, near the cursor (~22% of viewport).
      const influenceR = Math.min(w, h) * 0.22;
      const influenceR2 = influenceR * influenceR;

      for (const p of petals) {
        p.sway += p.swaySpeed;
        p.spin += 0.02 + p.z * 0.02;

        // z > 0.5 ≈ closer / larger petals
        if (windEnabled && p.z > 0.5) {
          const dx = p.x - pointerX;
          const dy = p.y - pointerY;
          const dist2 = dx * dx + dy * dy;

          if (dist2 < influenceR2) {
            const dist = Math.sqrt(dist2) || 1;
            const falloff = 1 - dist / influenceR;
            const strength = falloff * falloff * (0.55 + p.z * 0.45);

            // Follow cursor motion (main “wind”)
            p.vx += gustX * strength * 0.14;
            p.vy += gustY * strength * 0.09;

            // Light part around the cursor
            const nx = dx / dist;
            const ny = dy / dist;
            p.vx += nx * strength * 0.2;
            p.vy += ny * strength * 0.1;

            p.rotation += (gustX - gustY) * strength * 0.002;
          }

          p.vx *= 0.91;
          p.vy *= 0.91;
          const vMax = 2.4;
          const v = Math.hypot(p.vx, p.vy);
          if (v > vMax) {
            p.vx = (p.vx / v) * vMax;
            p.vy = (p.vy / v) * vMax;
          }
        } else {
          p.vx *= 0.8;
          p.vy *= 0.8;
        }

        p.y += p.speedY * (1 + boost * 0.35) + p.vy;
        p.x += p.speedX + Math.sin(p.sway) * (0.45 + p.z * 0.5) + p.vx;
        p.rotation += p.rotationSpeed + p.vx * 0.008;

        if (p.y > h + p.size * 3) Object.assign(p, createPetal(w, h, false, mode));
        if (p.x < -p.size * 4) p.x = w + p.size;
        if (p.x > w + p.size * 4) p.x = -p.size;

        drawPetal(ctx, p, p.vx * 2.4, p.vy * 1.6);
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
      const nextW = window.innerWidth;
      const nextH = window.innerHeight;
      const widthChanged = Math.abs(nextW - w) > 1;
      const heightDelta = Math.abs(nextH - h);

      if (!widthChanged && heightDelta < 140) {
        return;
      }

      const prevW = w;
      const prevH = h;
      applyCanvasSize(nextW, nextH);
      rescale(prevW, prevH);
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
