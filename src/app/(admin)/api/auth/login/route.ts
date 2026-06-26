import { NextRequest, NextResponse } from "next/server";
import { createToken, setAdminCookie, verifyAdminPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password } = body;

  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createToken();
  await setAdminCookie(token);

  return NextResponse.json({ ok: true });
}
