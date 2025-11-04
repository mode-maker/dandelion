// lib/image-compress.ts
export type CompressOptions = {
  maxWidth?: number;        // макс. ширина
  maxHeight?: number;       // макс. высота
  quality?: number;         // 0..1
  mimeType?: 'image/webp' | 'image/jpeg';
};

export async function compressFile(file: File, opts: CompressOptions = {}) {
  const {
    maxWidth = 2560,
    maxHeight = 2560,
    quality = 0.82,
    mimeType = 'image/webp',
  } = opts;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file; // не получилось — вернём исходник

  const ratio = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const targetW = Math.max(1, Math.round(bitmap.width * ratio));
  const targetH = Math.max(1, Math.round(bitmap.height * ratio));

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  const blob = await canvas.convertToBlob({ type: mimeType, quality });
  return new File([blob], renameExt(file.name, mimeType), { type: mimeType, lastModified: Date.now() });
}

function renameExt(name: string, mime: string) {
  const ext = mime === 'image/webp' ? '.webp' : '.jpg';
  return name.replace(/\.[^.]+$/g, ext);
}
