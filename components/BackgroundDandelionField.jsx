// components/BackgroundDandelionField.jsx
"use client";

import { useEffect, useRef } from "react";

/**
 * Реалистичное поле одуванчиков на canvas:
 * - каждая "шапочка" независима
 * - движение медленное, плавное, с индивидуальным "ветром"
 * - летает по всей высоте страницы (world), рисуем с учётом прокрутки
 * - отскакивают от мировых границ (0..pageHeight)
 * - уважает prefers-reduced-motion
 */
export default function BackgroundDandelionField({
  count = 200,            // кол-во шапочек
  minR = 7,             // радиус кроны min
  maxR = 30,             // радиус кроны max
  minSpeed = 50,          // px/сек (было ~скорее) — медленнее => 6..18
  maxSpeed = 100,
  baseOpacity = 0.10,    // общая заметность
} = {}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d", { alpha: true, desynchronized: true });
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const state = {
      vw: 0, vh: 0,           // размер вьюпорта
      worldH: 0,              // высота мира = высота страницы
      seeds: [],
      reduced: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
      last: performance.now(),
      t0: performance.now(),
      scrollY: window.scrollY || window.pageYOffset || 0,
    };

    const rnd  = (a, b) => a + Math.random() * (b - a);
    const rndi = (a, b) => Math.floor(rnd(a, b + 1));
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // простая "шумовая" функция (сумма синусов с разными фазами)
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

    const createSeed = () => {
      const r = rnd(minR, maxR);
      const speed = rnd(minSpeed, maxSpeed);     // px/sec
      const dir = rnd(0, Math.PI * 2);
      const phase = Math.random() * 1000;

      return {
        // мировые координаты (по всей странице)
        x: rnd(r + 8, state.vw - r - 8),
        y: rnd(r + 8, state.worldH - r - 8),

        // скорость как вектор + индивидуальный "шумовой ветер"
        speed,               // модуль скорости
        heading: dir,        // текущий курс (рад)
        r,

        // "строение" шапочки
        stems: rndi(16, 26),
        rot: rnd(0, Math.PI * 2),         // поворот шапки (рад)
        rotVel: rnd(-0.15, 0.15),         // °/сек → ~рад/сек (ниже пересчитаем)
        stroke: `rgba(238,240,234,${0.75 + Math.random() * 0.15})`,
        alpha: baseOpacity * (0.75 + Math.random() * 0.6),

        // индивидуальные параметры шума (частоты/фазы)
        n1: 0.25 + Math.random() * 0.35,  // Гц-эквивалент для noise по heading
        n2: 0.12 + Math.random() * 0.20,
        p1: Math.random() * 10,
        p2: Math.random() * 10,
        wx: 0.05 + Math.random() * 0.20,  // индивидуальная «ветренность» по X
        wy: 0.04 + Math.random() * 0.16,  // по Y
        phase,
      };
    };

    const init = () => {
      measure();
      state.seeds = Array.from({ length: count }).map(createSeed);
      state.last = performance.now();
      draw(state.last);
    };

    const onScroll = () => {
      state.scrollY = window.scrollY || window.pageYOffset || 0;
    };

    const onResize = () => {
      measure();
      // убедимся, что мир не «съел» шапочки: подрежем Y в пределах мира
      for (const s of state.seeds) {
        s.y = clamp(s.y, s.r + 8, state.worldH - s.r - 8);
      }
    };

    const step = (s, dtSec, now) => {
      // dtSec — секунды
      // шум для курса (делает движение плавно "живым", без дрожи)
      const t = (now - state.t0) / 1000; // сек
      const turn = noise1(t, s.n1, s.n2, s.p1, s.p2) * 0.25; // радиан/сек * вес
      s.heading += turn * dtSec;

      // «ветер» — независим у каждой шапочки, очень слабый, медленный
      const wX = Math.sin((t + s.phase) * s.wx) * 6;  // px/сек
      const wY = Math.cos((t + s.phase) * s.wy) * 4;  // px/сек

      // скорость = базовый курс + ветер
      const vx = Math.cos(s.heading) * s.speed + wX;
      const vy = Math.sin(s.heading) * s.speed + wY;

      // движение в мировых координатах
      s.x += vx * dtSec;
      s.y += vy * dtSec;

      // собственная плавная ротация (градусы/сек → рад/сек)
      s.rot += (s.rotVel * Math.PI / 180) * dtSec;

      // отскок от мировых границ (0..vw) x (0..worldH)
      const pad = s.r + 6;
      if (s.x < pad) {
        s.x = pad;
        s.heading = Math.PI - s.heading; // отражение
      } else if (s.x > state.vw - pad) {
        s.x = state.vw - pad;
        s.heading = Math.PI - s.heading;
      }
      if (s.y < pad) {
        s.y = pad;
        s.heading = -s.heading;
      } else if (s.y > state.worldH - pad) {
        s.y = state.worldH - pad;
        s.heading = -s.heading;
      }
    };

    const drawSeed = (s) => {
      // проецируем мировые координаты в экранные с учётом прокрутки
      const sx = s.x;
      const sy = s.y - state.scrollY;

      // если не видимая область — можно не рисовать для экономии
      if (sy < -s.r * 1.8 || sy > state.vh + s.r * 1.8) return;

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

        // стержень
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // «парашют» — короткая дуга на конце
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

      // сердцевина
      ctx.fillStyle = "rgba(231,232,224,0.9)";
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.2, s.r * 0.15), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const draw = (now) => {
      const dtMs = Math.min(48, now - state.last); // ограничим скачки
      state.last = now;
      const dtSec = dtMs / 1000;

      ctx.clearRect(0, 0, state.vw, state.vh);

      if (!state.reduced) {
        for (const s of state.seeds) step(s, dtSec, now);
      }

      for (const s of state.seeds) drawSeed(s);

      if (!state.reduced) rafRef.current = requestAnimationFrame(draw);
    };

    init();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [count, minR, maxR, minSpeed, maxSpeed, baseOpacity]);

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
