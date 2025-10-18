// components/BackgroundSeeds.jsx
"use client";

/**
 * Минималистичный фон — только улетающие семена одуванчика.
 * Лёгкий SVG, фиксированный под контентом.
 */
export default function BackgroundSeeds() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        opacity: 0.10, // общая заметность (0.06–0.16)
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Цвет линий — мягкий «тёплый белый». Можно сменить на мятный. */}
        <defs>
          <linearGradient id="seedStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4F6F1" />
            <stop offset="100%" stopColor="#E7E8E0" />
          </linearGradient>
        </defs>

        {/* Каждое семя: два коротких пера (дуги), ножка (линия), маленькое зерно (кружок).
           scale(0.85) — семена немного меньше базовых. Можно 0.75…0.95. */}
        <g stroke="url(#seedStroke)" strokeWidth="1" strokeLinecap="round" fill="none">
          {/* 1 */}
          <g transform="translate(230,180) rotate(-8) scale(0.85)">
            <path d="M0,0 q-12,-9 -24,-2" />
            <path d="M0,0 q12,-9 24,-2" />
            <line x1="0" y1="0" x2="0" y2="24" />
            <circle cx="0" cy="28" r="1.3" fill="#E7E8E0" />
          </g>

          {/* 2 */}
          <g transform="translate(520,120) rotate(14) scale(0.85)">
            <path d="M0,0 q-10,-8 -21,-2" />
            <path d="M0,0 q10,-8 21,-2" />
            <line x1="0" y1="0" x2="0" y2="22" />
            <circle cx="0" cy="26" r="1.2" fill="#E7E8E0" />
          </g>

          {/* 3 */}
          <g transform="translate(860,220) rotate(6) scale(0.85)">
            <path d="M0,0 q-11,-9 -22,-3" />
            <path d="M0,0 q11,-9 22,-3" />
            <line x1="0" y1="0" x2="0" y2="24" />
            <circle cx="0" cy="28" r="1.2" fill="#E7E8E0" />
          </g>

          {/* 4 */}
          <g transform="translate(1180,180) rotate(-16) scale(0.85)">
            <path d="M0,0 q-9,-7 -18,-2" />
            <path d="M0,0 q9,-7 18,-2" />
            <line x1="0" y1="0" x2="0" y2="20" />
            <circle cx="0" cy="23.5" r="1.1" fill="#E7E8E0" />
          </g>

          {/* 5 */}
          <g transform="translate(300,520) rotate(10) scale(0.85)">
            <path d="M0,0 q-12,-10 -24,-3" />
            <path d="M0,0 q12,-10 24,-3" />
            <line x1="0" y1="0" x2="0" y2="26" />
            <circle cx="0" cy="30" r="1.3" fill="#E7E8E0" />
          </g>

          {/* 6 */}
          <g transform="translate(780,600) rotate(-6) scale(0.85)">
            <path d="M0,0 q-10,-8 -20,-2" />
            <path d="M0,0 q10,-8 20,-2" />
            <line x1="0" y1="0" x2="0" y2="22" />
            <circle cx="0" cy="26" r="1.2" fill="#E7E8E0" />
          </g>

          {/* 7 */}
          <g transform="translate(1120,720) rotate(12) scale(0.85)">
            <path d="M0,0 q-11,-9 -22,-3" />
            <path d="M0,0 q11,-9 22,-3" />
            <line x1="0" y1="0" x2="0" y2="24" />
            <circle cx="0" cy="28" r="1.2" fill="#E7E8E0" />
          </g>
        </g>
      </svg>
    </div>
  );
}
