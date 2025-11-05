// lib/image-compress.js

/**
 * Сжатие изображения на клиенте перед загрузкой.
 * Работает без TypeScript. Использует <canvas> (без OffscreenCanvas для максимальной совместимости).
 *
 * @param {File} file
 * @param {Object} opts
 * @param {number} [opts.maxWidth=2560]
 * @param {number} [opts.maxHeight=2560]
 * @param {number} [opts.quality=0.82]  // 0..1
 * @param {'image/webp'|'image/jpeg'} [opts.mimeType='image/webp']
 * @returns {Promise<File>}
 */
export async function compressFile(file, opts = {}) {
  const {
    maxWidth = 2560,
    maxHeight = 2560,
    quality = 0.82,
    mimeType = 'image/webp',
  } = opts;

  // Загружаем исходное изображение в <img> с objectURL (самая совместимая тактика)
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);

    // Рассчитываем целевые размеры
    const ratio = Math.min(1, maxWidth / (img.naturalWidth || img.width), maxHeight / (img.naturalHeight || img.height));
    const targetW = Math.max(1, Math.round((img.naturalWidth || img.width) * ratio));
    const targetH = Math.max(1, Math.round((img.naturalHeight || img.height) * ratio));

    // Рисуем в обычный canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { alpha: true });

    // Чуть-чуть сглаживания
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), mimeType, quality)
    );

    // Если что-то пошло не так — вернём оригинал
    if (!blob) return file;

    return new File([blob], renameExt(file.name, mimeType), {
      type: mimeType,
      lastModified: Date.now(),
    });
  } catch {
    // На сбое компрессии безопасно вернём исходник
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function renameExt(name, mime) {
  const ext = mime === 'image/webp' ? '.webp' : '.jpg';
  return name.replace(/\.[^.]+$/g, ext);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // важные флаги: не тащим куки, работаем кросс-доменно с blob: URL
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
