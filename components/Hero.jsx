import { Marck_Script } from "next/font/google";
const marck = Marck_Script({ subsets: ["cyrillic"], weight: "400", display: "swap" });

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#5F6F65]">
      {/* декоративные одуванчики по бокам */}
      <img
        src="/hero/dandelion-left.png"
        alt=""
        className="pointer-events-none select-none absolute left-0 top-[-40px] w-[360px] opacity-90"
      />
      <img
        src="/hero/dandelion-right.png"
        alt=""
        className="pointer-events-none select-none absolute right-0 top-[-60px] w-[320px] opacity-90"
      />

      <div className="relative max-w-[1200px] mx-auto px-6 py-24 text-center">
        {/* ваш логотип (PNG). если файла нет — просто не отобразится, сайт не сломается */}
        <img
          src="/hero/logo.png"
          alt="Dandelion"
          className="mx-auto mb-2 w-[480px] max-w-[80%]"
        />

        {/* подпись под логотипом (рукописный стиль) */}
        <div className={`${marck.className} text-[28px] text-[#ECEDE8]/90`}>
          цветочная мастерская
        </div>

        {/* слоган */}
        <p className="mt-8 text-[20px] leading-relaxed text-[#ECEDE8]">
          Флорариум — природа в твоих руках<br />Создай свой маленький мир
        </p>
      </div>
    </section>
  );
}
