import { Caveat, Manrope } from "next/font/google";

const caveat = Caveat({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function Impressions() {
  return (
    <section className="py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Карточка: закругления + точная тень */}
        <div className="rounded-2xl overflow-hidden bg-[#EFE9DD] shadow-[8px_8px_15.5px_rgba(0,0,0,0.3)]">
          <div className="grid grid-cols-2">
            {/* Левая половина — текст */}
            <div className="p-10">
              <h2 className={`${caveat.className} text-4xl leading-tight mb-6`}>
                ВПЕЧАТЛЕНИЯ, КОТОРЫЕ<br />ОСТАНУТСЯ В ПАМЯТИ
              </h2>

              <div className={`${manrope.className} text-[20px] leading-7 text-zinc-800 space-y-4`}>
                <p>
                  Мы проводим мастер-классы, создаём уникальные флорариумы и делаем
                  мероприятия особенными. Уже более 2 лет мы помогаем людям открыть для
                  себя мир миниатюрных садов в стекле.
                </p>
                <p>
                  За это время у нас сотни довольных гостей, десятки уютных мероприятий и
                  множество эксклюзивных композиций, которые нашли свой дом.
                </p>
                <p>
                  Наша цель — подарить атмосферу творчества, уюта и живого общения.
                </p>
              </div>
            </div>

            {/* Правая половина — фото */}
            <div className="relative">
              <img
                src="/about/terrarium.jpg"
                alt="Флорариум"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
