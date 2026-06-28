export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function StoryIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
