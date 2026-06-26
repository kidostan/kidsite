import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { generateSlug } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { stories: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = categorySchema.parse(body);
    const slug = generateSlug(data.name);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        parentId: data.parent_id,
        metadata: JSON.stringify(data.metadata),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
