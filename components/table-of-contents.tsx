"use client";

import React, { useEffect, useState } from "react";
import { copySectionLink, scrollToSection, updateSectionHash } from "@/lib/section-links";
import { cn } from "@/lib/utils";
import type { Heading, TableOfContentsProps } from "@/types/components/table-of-contents";

export function TableOfContents({ className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headingElements = document.querySelectorAll("article h2, article h3, article h4");
    const headingsArray: Heading[] = [];

    headingElements.forEach((element) => {
      if (element.id) {
        headingsArray.push({
          id: element.id,
          text: element.textContent || "",
          level: parseInt(element.tagName.charAt(1)),
        });
      }
    });

    setHeadings(headingsArray);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      () => {
        const headingPositions = headings.map((heading) => {
          const element = document.getElementById(heading.id);
          return {
            id: heading.id,
            top: element ? element.getBoundingClientRect().top : Infinity,
          };
        });

        let activeHeading = headingPositions.find(
          (heading) => heading.top >= 0 && heading.top <= 100
        );

        if (!activeHeading) {
          const headingsAbove = headingPositions
            .filter((heading) => heading.top < 0)
            .sort((a, b) => b.top - a.top);

          activeHeading = headingsAbove[0];
        }

        if (!activeHeading) {
          const headingsBelow = headingPositions
            .filter((heading) => heading.top > 100)
            .sort((a, b) => a.top - b.top);

          activeHeading = headingsBelow[0];
        }

        if (activeHeading && activeHeading.id !== activeId) {
          setActiveId(activeHeading.id);
        }
      },
      {
        root: null,
        rootMargin: "-100px",
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    const handleScroll = () => {
      const headingPositions = headings.map((heading) => {
        const element = document.getElementById(heading.id);
        return {
          id: heading.id,
          top: element ? element.getBoundingClientRect().top : Infinity,
        };
      });

      let activeHeading = headingPositions.find(
        (heading) => heading.top >= -50 && heading.top <= 100
      );

      if (!activeHeading) {
        const headingsAbove = headingPositions
          .filter((heading) => heading.top < -50)
          .sort((a, b) => b.top - a.top);

        activeHeading = headingsAbove[0];
      }

      if (activeHeading && activeHeading.id !== activeId) {
        setActiveId(activeHeading.id);
      }
    };

    let scrollTimeout: NodeJS.Timeout;
    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 10);
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });

    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", throttledScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [headings, activeId]);

  const handleClick = async (id: string) => {
    updateSectionHash(id);
    scrollToSection(id);

    try {
      await copySectionLink(id);
    } catch {}
  };

  if (headings.length === 0) return null;
  const minLevel = Math.min(...headings.map((heading) => heading.level));

  const getIndentClass = (level: number) => {
    const depth = Math.max(0, level - minLevel);

    if (depth === 0) return "pl-0";
    if (depth === 1) return "pl-4";
    if (depth === 2) return "pl-8";
    return "pl-10";
  };

  const getTextClass = (level: number) => {
    const depth = Math.max(0, level - minLevel);
    return depth > 0 ? "text-xs" : "text-sm";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-semibold text-foreground mb-4">
        On this page
      </h4>
      <nav aria-label="Table of contents">
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id} className={getIndentClass(heading.level)}>
              <button
                onClick={() => handleClick(heading.id)}
                aria-current={activeId === heading.id ? "location" : undefined}
                className={cn(
                  "block w-full text-left border-l-2 pl-3 py-0.5 transition-colors text-muted-foreground hover:text-foreground hover:border-border/70",
                  getTextClass(heading.level),
                  {
                    "text-primary font-medium border-primary":
                      activeId === heading.id,
                    "border-transparent": activeId !== heading.id,
                  }
                )}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
