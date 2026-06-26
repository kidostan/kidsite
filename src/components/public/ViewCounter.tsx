"use client";

import { useEffect } from "react";

export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/stories/${slug}/views`, { method: "POST" }).catch(() => {});
  }, [slug]);

  return null;
}
