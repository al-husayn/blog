"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const BlogPostAssistant = dynamic(
  () =>
    import("@/components/blog-post-assistant").then(
      (mod) => mod.BlogPostAssistant
    ),
  { ssr: false }
);

interface DeferredBlogPostAssistantProps {
  slug: string;
  title: string;
}

export function DeferredBlogPostAssistant({
  slug,
  title,
}: DeferredBlogPostAssistantProps) {
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
      { rootMargin: "300px 0px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <BlogPostAssistant slug={slug} title={title} />
      ) : (
        <section className="border-t border-border p-6 lg:p-10">
          <p className="text-sm text-muted-foreground">
            AI assistant loads as you scroll.
          </p>
        </section>
      )}
    </div>
  );
}
