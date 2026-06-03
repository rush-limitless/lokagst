import { handlers } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const { GET } = handlers;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  if (isRateLimited(`auth:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 1 minute." }, { status: 429 });
  }
  return handlers.POST(req);
}
