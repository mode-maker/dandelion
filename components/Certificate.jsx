"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Manrope, Caveat } from "next/font/google";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});
const caveat = Caveat({
  subsets: ["cyrillic", "latin"],
  weight: ["700"],
  display: "swap",
});

// ⚠️ замени на свой ник/ссылку
const TG = "https://t.me/dandelion_craft_studio";

// ограничения для суммы
const MIN = 1000;
const MAX = 100000;

export default function Certificate() {
  const [amount, setAmount] = useState(3000);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");

  // нормализуем «Другая сумма»
  const normalizedCustom = useMemo(() => {
    // оставляем только цифры
    const digits = custom.replace(/\D+/g, "");
    if (!digits) return "";
    // форматируем (разделители тысяч)
    return Number(digits).toLocaleString("ru-RU");
  }, [custom]);

  // итоговая сумма
  const finalAmount = useMemo(() => {
    const raw = Number(custom.replace(/\D+/g, ""));
    // если в «Другая сумма» есть валидное число — используем его, иначе «amount»
    let value = raw > 0 ? raw : amount;

    // ограничиваем
    if (value < MIN) value = MIN;
    if (value > MAX) value = MAX;

    return value;
  }, [amount, custom]);

  const openTelegram = () => {
    const text = `Здравствуйте! Хочу оформить подарочный сертификат Dandelion на ${finalAmount.toLocaleString(
      "ru-RU"
    )} ₽.${name ? ` Имя получателя: ${name}.` : ""} Подскажите, как оплатить и получить.`;
    const url = `${TG}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    // якорь + запас под фикс-хедер
    <section id="certificate" className="py-16 scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Заголовок */}
        <h2
          className={`${caveat.className} text-[#ECEDE8] text-[32px] md:text-[36px] tracking-wide text-center mb-8`}
        >
          ПОДАРОЧНЫЙ СЕРТИФИКАТ
        </h2>

        {/* Подложка */}
        <div className="rounded-2xl bg-[#E7E8E0] p-6 md:p-8 shadow-[0_10px_28px_rgba(0,0,0,0.25)]">
          <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
            {/* Превью */}
            <div className="rounded-xl overflow-hidden shadow-[0_8px_22px_rgba(0,0,0,0.22)]">
              {/* Положи /public/cert/certificate.jpg (или PNG) */}
              <Image
                src="/cert/certificate.jpg"
                alt="Подарочный сертификат Dandelion"
                width={1400}
                height={950}
                className="w-full h-auto object-cover"
                priority={false}
              />
            </div>

            {/* Контент / форма */}
            <div>
              <p className={`${manrope.className} text-[18px] leading-8 text-[#2b2b2b]`}>
                Лучший подарок — эмоции. Сертификат можно использовать на мастер-классы,
                готовые флорариумы или индивидуальные заказы. Выбирайте сумму — мы
                подготовим электронный или печатный вариант.
              </p>

              {/* Быстрые факты */}
              <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[14px] text-[#3b3b3b]">
                <li>• Номинал: от {MIN.toLocaleString("ru-RU")} ₽</li>
                <li>• Срок действия: 6 месяцев</li>
                <li>• Электронный PDF за 5–10 минут</li>
                <li>• Печатный — по договорённости</li>
              </ul>

              {/* Суммы */}
              <div className="mt-6">
                <label
                  htmlFor="certificate-amount"
                  className={`${manrope.className} block text-[16px] font-semibold text-[#1d1d1d] mb-2`}
                >
                  Выберите сумму
                </label>
                <div className="flex flex-wrap gap-2" id="certificate-amount">
                  {[1000, 2000, 3000, 5000, 7000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={finalAmount === v && !custom}
                      onClick={() => {
                        setAmount(v);
                        setCustom("");
                      }}
                      className={`rounded-md px-4 py-2 text-[14px] transition
                        ${
                          finalAmount === v && !custom
                            ? "bg-[#3F3F3F] text-[#E7E8E0]"
                            : "bg-white/90 text-[#222] hover:-translate-y-0.5 hover:shadow-md"
                        }`}
                    >
                      {v.toLocaleString("ru-RU")} ₽
                    </button>
                  ))}

                  {/* Другая сумма */}
                  <div className="flex items-center gap-2 ml-1">
                    <input
                      inputMode="numeric"
                      aria-label="Другая сумма"
                      placeholder="Другая сумма"
                      value={normalizedCustom}
                      onChange={(e) => setCustom(e.target.value)}
                      className={`rounded-md bg-white/90 px-3 py-2 text-[14px] w-[140px]
                                 outline-none ring-1 ring-black/10 focus:ring-black/20
                                 ${
                                   custom.trim()
                                     ? "ring-[#3F3F3F]/30"
                                     : ""
                                 }`}
                    />
                  </div>
                </div>

                {/* Подсказка по лимитам */}
                {custom.trim() && (
                  <div className="mt-1 text-[12px] text-[#444]">
                    Сумма от {MIN.toLocaleString("ru-RU")} до {MAX.toLocaleString("ru-RU")} ₽
                  </div>
                )}
              </div>

              {/* Имя получателя (необязательно) */}
              <div className="mt-4">
                <label
                  htmlFor="certificate-name"
                  className={`${manrope.className} block text-[16px] font-semibold text-[#1d1d1d] mb-2`}
                >
                  Имя получателя (необязательно)
                </label>
                <input
                  id="certificate-name"
                  type="text"
                  placeholder="Например: Анна"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-md bg-white/90 px-3 py-2 text-[14px] w-full
                             outline-none ring-1 ring-black/10 focus:ring-black/20"
                />
              </div>

              {/* Кнопки */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={openTelegram}
                  className="rounded-md bg-[#3F3F3F] text-[#E7E8E0] px-5 py-2.5 text-[15px]
                             transition transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                >
                  Оформить в Telegram — {finalAmount.toLocaleString("ru-RU")} ₽
                </button>

                {/* опционально: скачивание PDF-макета (положишь позже) */}
                <a
                  href="/cert/dandelion-certificate.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-white/90 text-[#222] px-4 py-2 text-[14px]
                             ring-1 ring-black/10 hover:-translate-y-0.5 hover:shadow-md transition"
                >
                  Скачать образец (PDF)
                </a>
              </div>

              {/* Мини-FAQ */}
              <details className="mt-6 group">
                <summary className="cursor-pointer select-none text-[14px] text-[#2b2b2b] group-open:font-semibold">
                  Условия использования
                </summary>
                <div className="mt-2 text-[14px] leading-7 text-[#3b3b3b]">
                  Сертификат действует 6 месяцев с момента покупки. Его можно использовать
                  полностью или частично (остаток сохраняется). Для записи на мастер-класс
                  или выбора готового изделия — просто напишите нам в Telegram.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
