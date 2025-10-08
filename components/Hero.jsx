import { Marck_Script } from "next/font/google";
const marck = Marck_Script({ subsets: ["cyrillic"], weight: "400", display: "swap" });

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#5F6F65]">
      {/* ЛЕВЫЙ одуванчик — крупный, частично за пределами экрана */}
      <img
        src="/hero/dandelion-left.png"
        alt=""
        className="pointer-events-none select-none absolute left-[-80px] top-[-40px] w-[560px] opacity-90"
      />
      {/* ПРАВЫЙ одуванчик — в углу */}
      <img
        src="/hero/dandelion-right.png"
        alt=""
        className="pointer-events-none select-none absolute right-[-40px] top-[-60px] w-[400px] opacity-90"
      />

      <div className="relative max-w-[1200px] mx-auto px-6 py-28 text-center">
        {/* ЛОГОТИП */}
        <img
          src="/hero/logo.png"
          alt="Dandelion"
          className="mx-auto mb-2 w-[640px] max-w-[80%]"
        />

        {/* ПОДПИСЬ ПОД ЛОГО: ВЕРХНИЙ РЕГИСТР + трекинг */}
        <div
          className={`${marck.className} text-[30px] tracking-[0.18em] uppercase text-[#ECEDE8]/95`}
        >
          ЦВЕТОЧНАЯ МАСТЕРСКАЯ
        </div>

        {/* СЛОГАН */}
        <p className="mt-10 text-[22px] leading-relaxed text-[#ECEDE8]">
          Флорариум — природа в твоих руках
          <br />
          Создай свой маленький мир
        </p>
      </div>
    </section>
  );
}
