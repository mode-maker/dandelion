export async function GET() {
  return Response.json({
    ok: true,
    hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN)
  });
}
