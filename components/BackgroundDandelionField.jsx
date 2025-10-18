// components/BackgroundDandelionField.jsx
"use client";

import { useEffect, useRef } from "react";

export default function BackgroundDandelionField({
  count = 26,
  minR = 13,
  maxR = 24,
  minSpeed = 6,   // px/сек
  maxSpeed = 18,  // px/сек
  baseOpacity = 0.10,
  stemsMin = 16,
  stemsMax = 26,
  // хотим, чтобы часть семян точно была видна сразу:
  viewportSpawnRatio = 0.6, // 0..1 — доля семян, создаваемых в текущем вьюпорте
} = {}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d", { alpha: true, desynchronized: true });
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const state = {
      vw: 0,
      vh: 0,
      worldH: 0,
      scrollY: window.scrollY || 0,
      seeds: [],
      last: performance.now(),
      t0: performance.now(),
      reduced: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    };

    const rnd  = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const invLerp = (a, b, v) => (v - a) / (b - a);

    // мягкий шум для курса (сумма синусов)
    const noise1 = (t, s1, s2, p1, p2) =>
      Math.sin(t * s1 + p1) * 0.6 + Math.sin(t * s2 + p2) * 0.4;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const worldH = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        vh
      );

      state.vw = vw;
      state.vh = vh;
      state.worldH = worldH;

      c.width = Math.floor(vw * dpr);
      c.height = Math.floor(vh * dpr);
      c.style.width = vw + "px";
      c.style.height = vh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // создать одно "семя"
    const makeSeed = ({ inViewport = false }) => {
      const r = rnd(minR, maxR);
      const t = invLerp(minR, maxR, r);
      const stems = Math.round(lerp(stemsMin, stemsMax, clamp(t, 0, 1)));

      const x = rnd(r + 8, state.vw - r - 8);
      const y = inViewport
        ? rnd(state.scrollY + r + 8, state.scrollY + state.vh - r - 8)
        : rnd(r + 8, state.worldH - r - 8);

      const speed = rnd(minSpeed, maxSpeed);
      const dir = rnd(0, Math.PI * 2);
      const phase = Math.random() * 1000;

      return {
        x, y, r, stems,
        speed,
        heading: dir,
        rot: rnd(0, Math.PI * 2),
        rotVel: rnd(-0.15, 0.15),
        stroke: `rgba(238,240,234,${0.75 + Math.random() * 0.15})`,
        alpha: baseOpacity * (0.75 + Math.random() * 0.6),
        n1: 0.25 + Math.random() * 0.35,
        n2: 0.12 + Math.random() * 0.20,
        p1: Math.random() * 10,
        p2: Math.random() * 10,
        wx: 0.05 + Math.random() * 0.20,
        wy: 0.04 + Math.random() * 0.16,
        phase,
      };
    };

    const init = () => {
      measure();

      // генерим часть в видимой зоне, часть — по всей странице
      const nInView = Math.max(0, Math.floor(count * clamp(viewportSpawnRatio, 0, 1)));
      const nWorld  = Math.max(0, count - nInView);

      const seeds = [];
      for (let i = 0; i < nInView; i++) seeds.push(makeSeed({ inViewport: true }));
      for (let i = 0; i < nWorld;  i++) seeds.push(makeSeed({ inViewport: false }));

      state.seeds = seeds;
      state.last = performance.now();
      draw(state.last);
    };

    // единственный onScroll — просто обновляет координату прокрутки
    const onScroll = () => {
      state.scrollY = window.scrollY || 0;
    };

    const onResize = () => {
      measure();
      // НИКОГО НЕ ПЕРЕСОЗДАЁМ и НЕ ПЕРЕСЕЛЯЕМ — только держим в границах мира
      for (const s of state.seeds) {
        s.x = clamp(s.x, s.r + 8, state.vw - s.r - 8);
        s.y = clamp(s.y, s.r + 8, state.worldH - s.r - 8);
      }
    };

    const step = (s, dtSec, now) => {
      const t = (now - state.t0) / 1000;

      // мягкий поворот курса + индивидуальный "ветер"
      const turn = noise1(t, s.n1, s.n2, s.p1, s.p2) * 0.25;
      s.heading += turn * dtSec;

      const wX = Math.sin((t + s.phase) * s.wx) * 6;
      const wY = Math.cos((t + s.phase) * s.wy) * 4;

      const vx = Math.cos(s.heading) * s.speed + wX;
      const vy = Math.sin(s.heading) * s.speed + wY;

      s.x += vx * dtSec;
      s.y += vy * dtSec;

      s.rot += (s.rotVel * Math.PI / 180) * dtSec;

      // отскок от границ мира (без телепортаций)
      const pad = s.r + 6;
      if (s.x < pad) { s.x = pad; s.heading = Math.PI - s.heading; }
      else if (s.x > state.vw - pad) { s.x = state.vw - pad; s.heading = Math.PI - s.heading; }
      if (s.y < pad) { s.y = pad; s.heading = -s.heading; }
      else if (s.y > state.worldH - pad) { s.y = state.worldH - pad; s.heading = -s.heading; }
    };

    const drawSeed = (s) => {
      // смещаем на текущий скролл; ничего не "подгружаем"
      const sx = s.x;
      const sy = s.y - state.scrollY;

      // можно не рисовать далеко за экраном ради производительности:
      if (sy < -s.r * 2 || sy > state.vh + s.r * 2) return;

      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.translate(sx, sy);
      ctx.rotate(s.rot);
      ctx.strokeStyle = s.stroke;
      ctx.lineWidth = 1;

      for (let i = 0; i < s.stems; i++) {
        const a = (i / s.stems) * Math.PI * 2;
        const len = s.r * (0.9 + (i % 3) * 0.03);
        const ex = Math.cos(a) * len;
        const ey = Math.sin(a) * len;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        const nx = -Math.sin(a);
        const ny = Math.cos(a);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.quadraticCurveTo(
          ex + nx * 4.5,
          ey + ny * 4.5,
          ex - Math.cos(a) * 8,
          ey - Math.sin(a) * 8
        );
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(231,232,224,0.9)";
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.2, s.r * 0.15), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const draw = (now) => {
      const dt = Math.min(48, now - state.last);
      state.last = now;
      const dtSec = dt / 1000;

      ctx.clearRect(0, 0, state.vw, state.vh);

      if (!state.reduced) {
        for (const s of state.seeds) step(s, dtSec, now);
      }
      for (const s of state.seeds) drawSeed(s);

      if (!state.reduced) rafRef.current = requestAnimationFrame(draw);
    };

    // события
    const onResizeThrottled = () => {
      cancelAnimationFrame(rafRef.current);
      onResize();
      rafRef.current = requestAnimationFrame(draw);
    };

    measure();
    init();
    window.addEventListener("resize", onResizeThrottled);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResizeThrottled);
      window.removeEventListener("scroll", onScroll);
    };
  }, [count, minR, maxR, minSpeed, maxSpeed, baseOpacity, stemsMin, stemsMax, viewportSpawnRatio]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
