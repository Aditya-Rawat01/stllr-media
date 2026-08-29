export const runtime = "nodejs";
export async function GET() {
  return Response.json({ status: "pong" }, { status: 200 });
}
