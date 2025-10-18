// components/BackgroundDandelions.jsx
"use client";

/**
 * Лёгкий фиксированный SVG-фон:
 * - две большие "шапки" одуванчиков по диагонали
 * - несколько улетающих семян
 * Ничего не перехватывает (pointer-events: none), живёт под контентом.
 */
export default function BackgroundDandelions() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        opacity: 0.12, // общая интенсивность фона (0.08–0.18)
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Цвет линий — мягкий тёплый белый; при желании поменяй */}
        <defs>
          <linearGradient id="seedStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4F6F1" />
            <stop offset="100%" stopColor="#E7E8E0" />
          </linearGradient>
        </defs>

        {/* --- Левая нижняя шапка --- */}
        <g transform="translate(220, 740)">
          {/* Стебель */}
          <path d="M0,0 C60,-40 120,-120 160,-260" fill="none" stroke="url(#seedStroke)" strokeWidth="1.6" strokeLinecap="round"/>
          {/* Сердцевина */}
          <circle cx="0" cy="0" r="3.5" fill="#E7E8E0" opacity="0.9"/>

          {/* Радиальные усики (парашютики) */}
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i * 10) * Math.PI/180;
            const L = 160 + (i % 2 ? 8 : -8); // лёгкая неровность
            const x = Math.cos(a) * L;
            const y = Math.sin(a) * L;
            return (
              <g key={i}>
                {/* стержень семени */}
                <line x1="0" y1="0" x2={x} y2={y} stroke="url(#seedStroke)" strokeWidth="0.9" strokeLinecap="round" />
                {/* парашют (короткая дужка) на конце */}
                <path
                  d={`M ${x} ${y} q ${-Math.sin(a)*10} ${Math.cos(a)*10} ${-Math.cos(a)*18} ${-Math.sin(a)*18}`}
                  fill="none"
                  stroke="url(#seedStroke)"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </g>

        {/* --- Правая верхняя шапка --- */}
        <g transform="translate(1230, 160) rotate(8)">
          <path d="M0,0 C-50,60 -130,120 -240,160" fill="none" stroke="url(#seedStroke)" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="0" cy="0" r="3.5" fill="#E7E8E0" opacity="0.9"/>
          {Array.from({ length: 30 }).map((_, i) => {
            const a = (i * 12) * Math.PI/180;
            const L = 130 + ((i%3)-1)*6;
            const x = Math.cos(a) * L;
            const y = Math.sin(a) * L;
            return (
              <g key={i}>
                <line x1="0" y1="0" x2={x} y2={y} stroke="url(#seedStroke)" strokeWidth="0.9" strokeLinecap="round" />
                <path
                  d={`M ${x} ${y} q ${-Math.sin(a)*9} ${Math.cos(a)*9} ${-Math.cos(a)*16} ${-Math.sin(a)*16}`}
                  fill="none"
                  stroke="url(#seedStroke)"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </g>

        {/* --- Пара отдельно летящих семян (минимализм) --- */}
        <g stroke="url(#seedStroke)" strokeWidth="1" strokeLinecap="round" fill="none">
          {/* семя 1 */}
          <g transform="translate(820, 380) rotate(-12)">
            <path d="M0,0 q-12,-10 -26,-2" />
            <path d="M0,0 q12,-10 26,-2" />
            <line x1="0" y1="0" x2="0" y2="28" />
            <circle cx="0" cy="32" r="1.2" fill="#E7E8E0" />
          </g>
          {/* семя 2 */}
          <g transform="translate(420, 200) rotate(18)">
            <path d="M0,0 q-10,-9 -22,-2" />
            <path d="M0,0 q10,-9 22,-2" />
            <line x1="0" y1="0" x2="0" y2="24" />
            <circle cx="0" cy="28" r="1.2" fill="#E7E8E0" />
          </g>
          {/* семя 3 */}
          <g transform="translate(1080, 620) rotate(6)">
            <path d="M0,0 q-11,-8 -20,-1" />
            <path d="M0,0 q11,-8 20,-1" />
            <line x1="0" y1="0" x2="0" y2="22" />
            <circle cx="0" cy="26" r="1.2" fill="#E7E8E0" />
          </g>
        </g>
      </svg>
    </div>
  );
}
