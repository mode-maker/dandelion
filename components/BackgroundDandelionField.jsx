// components/BackgroundDandelionField.jsx
"use client";

import { useEffect, useRef } from "react";

/**
 * Лёгкий анимированный фон на canvas:
 * - десятки «шапочек» одуванчика, каждая состоит из радиальных «лучиков» + лёгкой дужки на концах
 * - хаотичное движение с отскоками от краёв, небольшой «ветер» и случайные микроподстроения
 * - поддержка devicePixelRatio (чётко на ретине)
 * - уважает prefers-reduced-motion — в этом случае рисуется статичная сцена
 */
export default function BackgroundDandelionField({
  count = 22,         // сколько шапочек
  minR = 14,          // минимальный радиус «кроны» (px)
  maxR = 26,          // максимальный радиус (px)
  minSpeed = 0.06,    // мин. скорость (px / кадр)
  maxSpeed = 0.22,    // макс. скорость
  baseOpacity = 0.11, // общая заметность фона
} = {}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d", { alpha: true, desynchronized: true });

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const state = {
      w: 0,
      h: 0,
      puff: [],
      t: 0,
      reduced: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    };

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      state.w = innerWidth;
      state.h = innerHeight;
      c.width = Math.floor(innerWidth * dpr);
      c.height = Math.floor(innerHeight * dpr);
      c.style.width = innerWidth + "px";
      c.style.height = innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const rnd = (a, b) => a + Math.random() * (b - a);
    const rndi = (a, b) => Math.floor(rnd(a, b + 1));

    const createPuff = () => {
      const r = rnd(minR, maxR);
      const speed = rnd(minSpeed, maxSpeed) * (0.8 + Math.random() * 0.4);
      const dir = rnd(0, Math.PI * 2);
      return {
        x: rnd(r, state.w - r),
        y: rnd(r, state.h - r),
        vx: Math.cos(dir) * speed,
        vy: Math.sin(dir) * speed,
        r,                                // радиус «кроны»
        stems: rndi(14, 26),              // количество лучиков
        rot: rnd(0, Math.PI * 2),         // текущий угол
        rotSpeed: rnd(-0.002, 0.002),     // скорость вращения
        // индивидуальный цвет (мягкий тёплый белый с лёгким разбросом)
        stroke: `rgba(238, 240, 234, ${0.75 + Math.random() * 0.15})`,
        // каждая шапка — разная прозрачность, чтобы создать глубину
        alpha: baseOpacity * (0.75 + Math.random() * 0.6),
      };
    };

    const init = () => {
      resize();
      state.puff = Array.from({ length: count }).map(createPuff);
      draw(0);
    };

    const wind = { x: 0, y: 0, phase: Math.random() * 1000 };
    const updateWind = (dt) => {
      // мягкий «ветер» через синус — медленно меняем смещение
      wind.phase += dt * 0.0002;
      wind.x = Math.sin(wind.phase) * 0.06;  // ~0.06 px/кадр
      wind.y = Math.cos(wind.phase * 0.6) * 0.04;
    };

    const step = (p, dt) => {
      // хаотическое дрожание: микроподноска вектора раз в кадр
      p.vx += (Math.random() - 0.5) * 0.002;
      p.vy += (Math.random() - 0.5) * 0.002;

      // ветер
      p.vx += wind.x;
      p.vy += wind.y;

      // движение
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.rotSpeed * dt;

      // отскоки от краёв
      const pad = p.r + 2;
      if (p.x < pad) {
        p.x = pad;
        p.vx = Math.abs(p.vx) * (0.85 + Math.random() * 0.2); // потеря энергии + немного случайности
      } else if (p.x > state.w - pad) {
        p.x = state.w - pad;
        p.vx = -Math.abs(p.vx) * (0.85 + Math.random() * 0.2);
      }
      if (p.y < pad) {
        p.y = pad;
        p.vy = Math.abs(p.vy) * (0.85 + Math.random() * 0.2);
      } else if (p.y > state.h - pad) {
        p.y = state.h - pad;
        p.vy = -Math.abs(p.vy) * (0.85 + Math.random() * 0.2);
      }
    };

    const drawPuff = (p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      ctx.strokeStyle = p.stroke;
      ctx.lineWidth = 1;

      const stems = p.stems;
      for (let i = 0; i < stems; i++) {
        const a = (i / stems) * Math.PI * 2;
        const len = p.r * (0.88 + (i % 3) * 0.03); // лёгкая неровность длины
        const ex = Math.cos(a) * len;
        const ey = Math.sin(a) * len;

        // стержень
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // «парашют» — короткая дужка на конце
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
      ctx.arc(0, 0, Math.max(1.2, p.r * 0.15), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    let last = performance.now();
    const draw = (now) => {
      const dt = Math.min(40, now - last); // капируем дельту (мс)
      last = now;
      state.t += dt;

      ctx.clearRect(0, 0, state.w, state.h);

      if (!state.reduced) {
        updateWind(dt);
        for (const p of state.puff) step(p, dt);
      }

      for (const p of state.puff) drawPuff(p);

      if (!state.reduced) rafRef.current = requestAnimationFrame(draw);
    };

    init();
    window.addEventListener("resize", resize);
    if (!state.reduced) rafRef.current = requestAnimationFrame(draw);
    else draw(performance.now()); // одно статичное рисование

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count, minR, maxR, minSpeed, maxSpeed, baseOpacity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,         // под всем контентом
        pointerEvents: "none",
      }}
    />
  );
}
