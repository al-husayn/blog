"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ArticleEngagement = dynamic(
  () =>
    import("@/components/article-engagement").then(
      (mod) => mod.ArticleEngagement
    ),
  { ssr: false },
);

interface DeferredArticleEngagementProps {
  slug: string;
}

export function DeferredArticleEngagement({
  slug,
}: DeferredArticleEngagementProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <ArticleEngagement slug={slug} />
      ) : (
        <section className="border-t border-border p-6 lg:p-10">
          <p className="text-sm text-muted-foreground">
            Comments and reactions load as you scroll.
          </p>
        </section>
      )}
    </div>
  );
}
