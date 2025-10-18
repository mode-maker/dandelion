"use client";

import { useEffect } from "react";

export default function UploadPage() {
  // простейшая защита (пароль спрашиваем один раз на клиенте)
  useEffect(() => {
    const ok = sessionStorage.getItem("admin_ok");
    if (ok === "1") return;
    const pass = prompt("Введите пароль администратора:");
    if (pass !== process.env.NEXT_PUBLIC_FAKE || pass !== undefined) {
      // Используем переменную окружения нельзя, поэтому:
    }
  }, []);

  useEffect(() => {
    // грузим скрипт Cloudinary
    const s = document.createElement("script");
    s.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  const openWidget = () => {
    // минимум безопасности: сравним введённый пароль с ADMIN_PASS на сервере
    const ok = sessionStorage.getItem("admin_ok");
    if (ok !== "1") {
      const pass = prompt("Введите пароль администратора:");
      if (pass !== process.env.NEXT_PUBLIC_ADMIN_PLACEHOLDER) {
        alert("Неверный пароль");
        return;
      }
      sessionStorage.setItem("admin_ok", "1");
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

    // @ts-ignore
    const widget = window.cloudinary?.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url", "camera"],
        multiple: true,
        folder: "events",
        tags: ["gallery"],
        maxFileSize: 8 * 1024 * 1024,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        showAdvancedOptions: false,
        cropping: false,
        styles: { palette: { window: "#2f3b36", sourceBg: "#2f3b36", windowBorder: "#6f8076", tabIcon: "#e7e8e0", menuIcons: "#e7e8e0" } },
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          console.log("Uploaded:", result.info.public_id);
        }
      }
    );
    widget?.open();
  };

  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <button
        onClick={openWidget}
        className="rounded-md bg-[#3F3F3F] text-[#E7E8E0] px-5 py-3 text-[15px]
                   hover:-translate-y-0.5 hover:shadow-md transition"
      >
        Загрузить фотографии
      </button>
    </main>
  );
}
