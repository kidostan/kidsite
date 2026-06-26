import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const story = await prisma.story.findUnique({ where: { slug } });
  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.story.update({
    where: { id: story.id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
