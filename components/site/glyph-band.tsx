"use client";

import { useEffect, useRef } from "react";

const CHARSET = "01/\\:.+=*#%@";
const CELL_W = 9;
const CELL_H = 15;
const FRAME_MS_DESKTOP = 70;
const FRAME_MS_MOBILE = 120;
const POINTER_RADIUS = 140;

/**
 * Full-width field of slowly changing monospaced glyphs.
 * Pure canvas: no React state per frame, pauses when hidden or off-screen,
 * renders a single static frame under prefers-reduced-motion.
 */
export default function GlyphBand({ className }: { className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reducedQuery.matches;

    let cols = 0;
    let rows = 0;
    let chars = new Uint8Array(0);
    let energy = new Float32Array(0);
    let base = new Float32Array(0);
    let raf = 0;
    let inView = true;
    let docHidden = document.hidden;
    let lastFrame = 0;
    let pointerX = -1000;
    let pointerY = -1000;
    let fontFamily = "monospace";

    const readFontFamily = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-geist-mono")
        .trim();
      fontFamily = value ? `${value}, monospace` : "monospace";
    };
    readFontFamily();

    const initGrid = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / CELL_W);
      rows = Math.ceil(height / CELL_H);
      const total = cols * rows;
      chars = new Uint8Array(total);
      energy = new Float32Array(total);
      base = new Float32Array(total);

      for (let i = 0; i < total; i += 1) {
        base[i] = Math.random();
        chars[i] = Math.floor(Math.random() * CHARSET.length);
      }
      // One smoothing pass gives the field soft density clusters.
      const smoothed = new Float32Array(total);
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x;
          let sum = base[i];
          let count = 1;
          if (x > 0) {
            sum += base[i - 1];
            count += 1;
          }
          if (x < cols - 1) {
            sum += base[i + 1];
            count += 1;
          }
          if (y > 0) {
            sum += base[i - cols];
            count += 1;
          }
          if (y < rows - 1) {
            sum += base[i + cols];
            count += 1;
          }
          smoothed[i] = sum / count;
        }
      }
      base = smoothed;
      energy.set(base);
    };

    const draw = () => {
      ctx.fillStyle = "#0a0a09";
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.font = `13px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f1ede3";

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x;
          const cx = x * CELL_W + CELL_W / 2;
          const cy = y * CELL_H + CELL_H / 2;
          let alpha = 0.05 + energy[i] * 0.24;

          if (pointerX > -500) {
            const dx = cx - pointerX;
            const dy = cy - pointerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < POINTER_RADIUS) {
              alpha += (1 - distance / POINTER_RADIUS) * 0.22;
            }
          }

          ctx.globalAlpha = Math.min(alpha, 0.6);
          ctx.fillText(CHARSET[chars[i]], cx, cy);
        }
      }
      ctx.globalAlpha = 1;
    };

    const mutate = () => {
      const total = cols * rows;
      const changes = Math.max(1, Math.floor(total * 0.05));
      for (let c = 0; c < changes; c += 1) {
        const i = Math.floor(Math.random() * total);
        chars[i] = Math.floor(Math.random() * CHARSET.length);
        energy[i] = Math.min(1, Math.max(0, base[i] + Math.random() * 0.7));
      }
      // Gentle decay so highlights fade instead of flickering.
      for (let i = 0; i < total; i += 1) {
        energy[i] = base[i] + (energy[i] - base[i]) * 0.9;
      }
    };

    const shouldRun = () =>
      !reduced && inView && !docHidden && document.visibilityState !== "hidden";

    const loop = (now: number) => {
      if (!shouldRun()) {
        raf = 0;
        return;
      }
      const interval =
        window.innerWidth < 640 ? FRAME_MS_MOBILE : FRAME_MS_DESKTOP;
      if (now - lastFrame >= interval) {
        lastFrame = now;
        mutate();
        draw();
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf !== 0 || !shouldRun()) return;
      lastFrame = 0;
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const restart = () => {
      stop();
      if (reduced) {
        draw();
        return;
      }
      start();
    };

    const resizeObserver = new ResizeObserver(() => {
      initGrid();
      draw();
      if (reduced) return;
      restart();
    });
    resizeObserver.observe(wrapper);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(wrapper);

    const onVisibility = () => {
      docHidden = document.hidden;
      if (shouldRun()) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onPointerMove = (event: PointerEvent) => {
      if (reduced || event.pointerType === "touch") return;
      const rect = wrapper.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    };
    const onPointerLeave = () => {
      pointerX = -1000;
      pointerY = -1000;
    };
    wrapper.addEventListener("pointermove", onPointerMove);
    wrapper.addEventListener("pointerleave", onPointerLeave);

    const onMotionChange = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      restart();
    };
    reducedQuery.addEventListener("change", onMotionChange);

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (cancelled) return;
      readFontFamily();
      draw();
    });

    initGrid();
    draw();
    start();

    return () => {
      cancelled = true;
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerleave", onPointerLeave);
      reducedQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className={`relative h-[17vh] max-h-[240px] min-h-[110px] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)] ${className ?? ""}`}
    >
      <canvas ref={canvasRef} className="pointer-events-none block h-full w-full" />
    </div>
  );
}
