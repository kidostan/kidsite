import { NextResponse } from "next/server";
import { removeAdminCookie } from "@/lib/auth";

export async function POST() {
  await removeAdminCookie();
  return NextResponse.json({ ok: true });
}
