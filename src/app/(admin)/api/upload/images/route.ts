import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "images");
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files" }, { status: 400 });
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        if (file.size > MAX_SIZE) {
          throw new Error(`Файл слишком большой: ${file.name}`);
        }

        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filepath, buffer);

        return { url: `/uploads/images/${filename}`, name: file.name };
      })
    );

    return NextResponse.json({ files: uploads });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ошибка загрузки";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
