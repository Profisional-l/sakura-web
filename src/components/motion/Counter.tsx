"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

interface CounterProps {
  value: string;
  className?: string;
  duration?: number;
}

function parseValue(value: string) {
  const match = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return null;
  const digits = match[2];
  const hasLeadingZero =
    digits.length > 1 && digits.startsWith("0") && !/[.,]/.test(digits);
  return {
    prefix: match[1],
    target: Number(digits.replace(",", ".")),
    suffix: match[3],
    pad: hasLeadingZero ? digits.length : 0,
  };
}

function formatNumber(n: number, pad: number) {
  if (!pad) return String(n);
  return String(n).padStart(pad, "0");
}

export function Counter({ value, className, duration = 1600 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduced = useReducedMotion();
  const parsed = useMemo(() => parseValue(value), [value]);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!parsed || !inView || reduced) return;

    let frame = 0;
    let cancelled = false;
    const start = performance.now();
    const { target } = parsed;

    const tick = (now: number) => {
      if (cancelled) return;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [inView, reduced, duration, parsed]);

  if (!parsed) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  if (reduced) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {parsed.prefix}
      {inView ? formatNumber(display, parsed.pad) : formatNumber(0, parsed.pad)}
      {parsed.suffix}
    </span>
  );
}
