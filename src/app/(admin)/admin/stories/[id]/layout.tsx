import { prisma } from "@/lib/db";

export async function generateStaticParams() {
  const stories = await prisma.story.findMany({ select: { id: true } });
  return stories.map((s) => ({ id: s.id }));
}

export default function StoryIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
