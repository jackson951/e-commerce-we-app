import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.error("[client-error]", payload);
  } catch (error) {
    console.error("[client-error] failed to parse payload", error);
  }

  return NextResponse.json({ ok: true });
}
