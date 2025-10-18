import { Caveat } from "next/font/google";
const caveat = Caveat({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function Hero() {
  return (
    // Фон секции прозрачный — виден глобальный градиент
    <section className="relative overflow-hidden">
      <div className="relative max-w-[1200px] mx-auto px-6 pt-28 pb-10 md:pb-12 text-center">
        {/* Логотип */}
        <img
          src="/hero/logo.png"
          alt="Dandelion"
          className="mx-auto mb-2 w-[640px] max-w-[80%]"
        />

        {/* Подпись — Caveat, верхний регистр */}
        <div className={`${caveat.className} text-[28px] uppercase tracking-[0.14em] text-[#ECEDE8]/95`}>
          Цветочная мастерская
        </div>

        {/* Слоган */}
        <p className="mt-10 text-[27px] leading-relaxed text-[#ECEDE8]">
          Флорариум — природа в твоих руках
          <br />
          Создай свой маленький мир
        </p>
      </div>
    </section>
  );
}
