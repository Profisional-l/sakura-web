"use client";

import { useEffect, useRef } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  sway: number;
  swaySpeed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  hue: number;
}

const PALETTE = [335, 320, 345, 310];

function createPetal(width: number, height: number, seeded: boolean): Petal {
  const size = 6 + Math.random() * 12;
  return {
    x: Math.random() * width,
    y: seeded ? Math.random() * height : -size * 2 - Math.random() * height * 0.3,
    size,
    speedY: 0.25 + Math.random() * 0.55,
    speedX: -0.25 + Math.random() * 0.5,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.005 + Math.random() * 0.015,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: -0.012 + Math.random() * 0.024,
    opacity: 0.25 + Math.random() * 0.5,
    hue: PALETTE[Math.floor(Math.random() * PALETTE.length)],
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, petal: Petal) {
  const { x, y, size, rotation, opacity, hue } = petal;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;

  const gradient = ctx.createLinearGradient(0, -size, 0, size);
  gradient.addColorStop(0, `hsla(${hue}, 100%, 93%, 1)`);
  gradient.addColorStop(1, `hsla(${hue}, 90%, 78%, 0.7)`);
  ctx.fillStyle = gradient;

  ctx.shadowColor = `hsla(${hue}, 100%, 80%, 0.6)`;
  ctx.shadowBlur = size * 0.8;

  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.7, -size * 0.55, size * 0.55, size * 0.6, 0, size);
  ctx.bezierCurveTo(-size * 0.55, size * 0.6, -size * 0.7, -size * 0.55, 0, -size);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export function SakuraPetals({ density = 26 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const count = isCoarse ? Math.round(density * 0.5) : density;

    let width = 0;
    let height = 0;
    let petals: Petal[] = [];
    let frameId = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    petals = Array.from({ length: count }, () => createPetal(width, height, true));

    const render = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (const petal of petals) {
        petal.sway += petal.swaySpeed;
        petal.y += petal.speedY;
        petal.x += petal.speedX + Math.sin(petal.sway) * 0.6;
        petal.rotation += petal.rotationSpeed;

        if (petal.y > height + petal.size * 2) {
          Object.assign(petal, createPetal(width, height, false));
        }
        if (petal.x < -petal.size * 3) petal.x = width + petal.size;
        if (petal.x > width + petal.size * 3) petal.x = -petal.size;

        drawPetal(ctx, petal);
      }

      frameId = requestAnimationFrame(render);
    };

    render();

    const handleVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frameId);
      } else if (!running) {
        running = true;
        render();
      }
    };

    const handleResize = () => {
      resize();
      petals = Array.from({ length: count }, () => createPetal(width, height, true));
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", handleResize);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="sakura-petals" aria-hidden />;
}
