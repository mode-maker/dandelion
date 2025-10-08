import { Caveat } from "next/font/google";
const caveat = Caveat({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#5F6F65]">
      {/* Одуванчики — уменьшены примерно в 2 раза и чуть ближе к углам */}
      <img
        src="/hero/dandelion-left.png"
        alt=""
        className="pointer-events-none select-none absolute left-[-20px] top-[-10px] w-[210px] opacity-90"
      />
      <img
        src="/hero/dandelion-right.png"
        alt=""
        className="pointer-events-none select-none absolute right-[-10px] top-[-10px] w-[150px] opacity-90"
      />

      <div className="relative max-w-[1200px] mx-auto px-6 py-28 text-center">
        {/* Логотип */}
        <img
          src="/hero/logo.png"
          alt="Dandelion"
          className="mx-auto mb-2 w-[640px] max-w-[80%]"
        />

        {/* Подпись под логотипом — Caveat */}
        <div className={`${caveat.className} text-[28px] uppercase tracking-[0.14em] text-[#ECEDE8]/95`}>
          Цветочная мастерская
        </div>

        {/* Слоган */}
        <p className="mt-10 text-[22px] leading-relaxed text-[#ECEDE8]">
          Флорариум — природа в твоих руках
          <br />
          Создай свой маленький мир
        </p>
      </div>
    </section>
  );
}
