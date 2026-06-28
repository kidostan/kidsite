import { NextResponse } from "next/server";
import { removeAdminCookie } from "@/lib/auth";

export const dynamic = "force-static";

export async function POST() {
  await removeAdminCookie();
  return NextResponse.json({ ok: true });
}
