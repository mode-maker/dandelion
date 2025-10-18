// components/BackgroundSeedsAnimated.jsx
"use client";

import { useEffect, useState } from "react";

/**
 * Минималистичный фон:
 * - 12 маленьких "семян" одуванчика (SVG 14–22px)
 * - каждое медленно дрейфует (X/Y/вращение) с разными скоростями
 * - слой фиксированный, под контентом, клики не перехватывает
 * - учитываем prefers-reduced-motion
 */
export default function BackgroundSeedsAnimated({
  count = 12,       // сколько семян
  minSize = 14,     // мин. размер, px
  maxSize = 22,     // макс. размер, px
  opacity = 0.10,   // общая заметность
} = {}) {
  const [seeds, setSeeds] = useState([]);

  useEffect(() => {
    const vw = typeof window !== "undefined" ? window.innerWidth  : 1440;
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;

    // случай между [a, b]
    const rnd = (a, b) => a + Math.random() * (b - a);

    // создаём набор параметров после монтирования (чтобы не было гидрации с SSR)
    const items = Array.from({ length: count }).map((_, i) => {
      const size = Math.round(rnd(minSize, maxSize));
      return {
        id: i,
        size,
        // стартовые координаты по экрану
        left: Math.round(rnd(0, vw)),
        top:  Math.round(rnd(0, vh)),
        // направление дрейфа и амплитуды (px)
        driftX: Math.round(rnd(20, 60)) * (Math.random() < 0.5 ? -1 : 1),
        driftY: Math.round(rnd(30, 80)) * (Math.random() < 0.5 ? -1 : 1),
        // длительность и задержка (сек)
        dur: rnd(16, 28),         // медленно и плавно
        delay: rnd(-8, 8),        // чтобы не стартовали синхронно
        // вращение (градусы)
        rot: Math.round(rnd(8, 22)) * (Math.random() < 0.5 ? -1 : 1),
      };
    });

    setSeeds(items);
  }, [count, minSize, maxSize]);

  if (!seeds.length) return null;

  return (
    <div
      aria-hidden
      className="bg-seeds-anim"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        opacity,
      }}
    >
      {/* семена */}
      {seeds.map((s) => (
        <div
          key={s.id}
          className="seed"
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size * 1.4, // ножка + "парашют"
            // три независимые анимации одновременно:
            // 1) дрейф по X/Y, 2) качание, 3) медленное вращение
            animation: `
              seed-drift ${s.dur}s ${s.delay}s linear infinite alternate,
              seed-sway  ${s.dur * 0.8}s ${s.delay / 2}s ease-in-out infinite alternate,
              seed-rot   ${s.dur * 2}s ${s.delay}s linear infinite
            `,
            transformOrigin: "50% 40%",
          }}
        >
          {/* маленькое семечко (SVG) */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 20 28"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`g${s.id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"  stopColor="#F4F6F1" />
                <stop offset="100%" stopColor="#E7E8E0" />
              </linearGradient>
            </defs>
            {/* "парашют" — две короткие дуги */}
            <path d="M10 6 q-6 -5 -12 -1"  fill="none" stroke={`url(#g${s.id})`} strokeWidth="1" strokeLinecap="round" />
            <path d="M10 6 q6 -5 12 -1"    fill="none" stroke={`url(#g${s.id})`} strokeWidth="1" strokeLinecap="round" />
            {/* ножка */}
            <line x1="10" y1="6" x2="10" y2="22" stroke={`url(#g${s.id})`} strokeWidth="1" strokeLinecap="round" />
            {/* зерно */}
            <circle cx="10" cy="24.5" r="1.3" fill="#E7E8E0" />
          </svg>
        </div>
      ))}

      {/* локальные keyframes */}
      <style jsx global>{`
        /* плавный дрейф: у каждого элемента свои dx/dy подставим через CSS var */
        .bg-seeds-anim .seed {
          --dx: 40px;
          --dy: 60px;
        }
        /* переопределим dx/dy на лету через inline transform? Нельзя.
           Используем trick: подсунем смещение через box-shadow-набор?
           Проще — используем @property с custom properties не нужно.
           Лучше применим translate в keyframes и зададим индивидуальные через style transform? 
           Делать инлайн нельзя, так как keyframes фиксированные. 
           Решение: выставим CSS vars на каждом элементе: */
      `}</style>

      {/* CSS vars на каждом элементе через style prop */}
      {seeds.map((s) => (
        <style
          // уникальный стиль для конкретного seed: задаём --dx/--dy/--rot
          key={`vars-${s.id}`}
          dangerouslySetInnerHTML={{
            __html: `
              .bg-seeds-anim .seed:nth-of-type(${s.id + 1}) {
                --dx: ${s.driftX}px;
                --dy: ${s.driftY}px;
                --rot: ${s.rot}deg;
              }
            `,
          }}
        />
      ))}

      {/* общие keyframes */}
      <style jsx global>{`
        @keyframes seed-drift {
          0%   { transform: translate(0, 0); }
          100% { transform: translate(var(--dx), var(--dy)); }
        }
        @keyframes seed-sway {
          0%   { filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
          100% { filter: drop-shadow(0 0 2px rgba(0,0,0,0.06)); }
        }
        @keyframes seed-rot {
          0%   { rotate: 0deg; }
          100% { rotate: var(--rot); }
        }

        /* Уважать системную настройку «уменьшить анимацию» */
        @media (prefers-reduced-motion: reduce) {
          .bg-seeds-anim .seed {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
