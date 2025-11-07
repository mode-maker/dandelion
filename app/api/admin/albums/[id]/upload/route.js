// app/api/admin/albums/[id]/upload/route.js
// Обёртка над POST /photos для обратной совместимости с клиентом админки
export { runtime, dynamic, revalidate } from '../photos/route';

import { POST as uploadPhoto } from '../photos/route';

export async function POST(req, ctx) {
  return uploadPhoto(req, ctx);
}
