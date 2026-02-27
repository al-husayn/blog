"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@/components/ui/drawer";

interface TagFilterProps {
  tags: string[];
  selectedTag: string;
  tagCounts?: Record<string, number>;
  panelId?: string;
}

const toTagId = (tag: string): string => {
  const normalized = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "all";
};

const getTabId = (tag: string, scope: "desktop" | "mobile"): string => {
  return `tag-tab-${scope}-${toTagId(tag)}`;
};

export function TagFilter({ tags, selectedTag, tagCounts, panelId = "filtered-articles-panel" }: TagFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tag !== "All") {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const DesktopTagFilter = () => (
    <div className="hidden md:flex flex-wrap gap-2" role="tablist" aria-label="Filter articles by tag">
      {tags.map((tag) => {
        const isSelected = selectedTag === tag;
        const tabId = getTabId(tag, "desktop");

        return (
          <button
            type="button"
            key={tag}
            onClick={() => handleTagClick(tag)}
            role="tab"
            id={tabId}
            aria-selected={isSelected}
            aria-controls={panelId}
            className={`h-8 flex items-center px-1 pl-3 rounded-lg cursor-pointer border text-sm transition-colors ${
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted"
            }`}
          >
            <span>{tag}</span>
            {tagCounts?.[tag] && (
              <span
                className={`ml-2 text-xs border rounded-md h-6 min-w-6 font-medium flex items-center justify-center ${
                  isSelected
                    ? "border-border/40 dark:border-primary-foreground bg-background text-primary"
                    : "border-border dark:border-border"
                }`}
              >
                {tagCounts[tag]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const MobileTagFilter = () => (
    <Drawer>
      <DrawerTrigger className="md:hidden w-full flex items-center justify-between px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
        <span className="capitalize text-sm font-medium">{selectedTag}</span>
        <ChevronDown className="h-4 w-4" />
      </DrawerTrigger>

      <DrawerContent className="md:hidden">
        <DrawerHeader>
          <h3 className="font-semibold text-sm">Select Category</h3>
        </DrawerHeader>

        <DrawerBody>
          <div className="space-y-2" role="tablist" aria-label="Filter articles by tag">
            {tags.map((tag) => {
              const isSelected = selectedTag === tag;
              const tabId = getTabId(tag, "mobile");

              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  role="tab"
                  id={tabId}
                  aria-selected={isSelected}
                  aria-controls={panelId}
                  className="w-full flex items-center justify-between font-medium cursor-pointer text-sm transition-colors"
                >
                  <span
                    className={`w-full flex items-center justify-between font-medium cursor-pointer text-sm transition-colors ${
                      isSelected
                        ? "underline underline-offset-4 text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tag}
                  </span>
                  {tagCounts?.[tag] && (
                    <span className="flex-shrink-0 ml-2 border border-border rounded-md h-6 min-w-6 flex items-center justify-center">
                      {tagCounts[tag]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <>
      <DesktopTagFilter />
      <MobileTagFilter />
    </>
  );
}
