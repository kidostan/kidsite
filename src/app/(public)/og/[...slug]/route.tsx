import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const storySlug = slug?.[0];

  let title = "Сказки Онлайн";
  let subtitle = "Читайте бесплатно сказки для детей";

  if (storySlug && storySlug !== "home") {
    const story = await prisma.story.findUnique({
      where: { slug: storySlug },
      select: { title: true },
    });
    if (story) {
      title = story.title;
      subtitle = "Читать сказку онлайн";
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #faf5ff 0%, #fce7f3 50%, #ede9fe 100%)",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#a855f7",
            marginBottom: 20,
            letterSpacing: 2,
          }}
        >
          СКАЗКИ ОНЛАЙН
        </div>
        <div
          style={{
            fontSize: storySlug ? 52 : 64,
            fontWeight: "bold",
            color: "#1e1b4b",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#6b7280",
            marginTop: 30,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#a855f7",
            marginTop: 40,
            padding: "8px 24px",
            border: "2px solid #a855f7",
            borderRadius: 30,
          }}
        >
          kidsite.ru
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
