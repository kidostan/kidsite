import slugifyLib from "slugify";

export function generateSlug(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, locale: "ru" });
}

export async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const { prisma } = await import("./db");
  let slug = base || "untitled";
  let suffix = 0;
  while (true) {
    const existing = await prisma.story.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    suffix++;
    slug = `${base}-${suffix}`;
  }
}

export function readingTime(text: string): number {
  const wordsPerMinute = 150;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/!(?:\[.*?\])\(.*?\)/g, "")
    .replace(/\[(.+?)\]\(.*?\)/g, "$1")
    .replace(/>/g, "")
    .replace(/[-*+]\s/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

export function parseStoryParagraphs(markdown: string): { content: string; hasImage: boolean }[] {
  const blocks = markdown.split(/\n\n+/);
  return blocks
    .filter((b) => b.trim().length > 0)
    .map((block) => {
      const hasImage = /!\[.*?\]\(.*?\)/.test(block);
      return { content: block.trim(), hasImage };
    });
}

export function extractImagesFromMarkdown(markdown: string): { alt: string; url: string }[] {
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: { alt: string; url: string }[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    images.push({ alt: match[1], url: match[2] });
  }
  return images;
}

export function parseMetadata(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "object") return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}
