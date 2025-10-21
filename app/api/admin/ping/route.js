export async function GET() {
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  return Response.json({ ok: true, hasBlobToken: hasToken });
}
