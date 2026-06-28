import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";

export const dynamic = "force-static";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, role: admin.role });
}
