import Link from "next/link";
import Image from "next/image";
import type { BlogCardProps } from "@/types/components/blog-card";

export function BlogCard({
  url,
  title,
  description,
  date,
  tags,
  authorName,
  authorAvatar,
  readTime,
  thumbnail,
}: BlogCardProps) {
  return (
    <Link
      href={url}
      className="group relative block h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[transform,border-color,box-shadow] duration-200 ease-out hover:z-10 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_14px_28px_-18px_rgba(0,0,0,0.55)] focus-visible:z-10 focus-visible:-translate-y-1 focus-visible:border-primary/40 focus-visible:shadow-[0_14px_28px_-18px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:shadow-[0_18px_36px_-20px_rgba(0,0,0,0.85)] dark:focus-visible:shadow-[0_18px_36px_-20px_rgba(0,0,0,0.85)]"
    >
      <div className="flex h-full flex-col bg-background transition-colors duration-200 group-hover:bg-muted/40 group-focus-visible:bg-muted/40">
        {thumbnail && (
          <div className="relative w-full overflow-hidden aspect-[16/10] sm:aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/10]">
            <Image
              src={thumbnail}
              alt={title}
              fill
              style={{ objectFit: "cover" }}
              className="object-cover transition-transform duration-300 group-hover:scale-105 dark:brightness-[0.86] dark:contrast-110 dark:saturate-90"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-black/0 dark:bg-black/20 transition-colors duration-300 group-hover:dark:bg-black/10"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h3 className="line-clamp-2 text-lg font-semibold text-card-foreground transition-colors group-hover:underline underline-offset-4 md:text-xl">
            {title}
          </h3>
          <p className="line-clamp-3 text-sm text-muted-foreground md:line-clamp-4">{description}</p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <div className="min-w-0 flex items-center gap-2 text-xs text-muted-foreground">
              {authorName && (
                <div className="min-w-0 flex items-center gap-2">
                  {authorAvatar && (
                    <Image
                      src={authorAvatar}
                      alt=""
                      aria-hidden="true"
                      width={20}
                      height={20}
                      sizes="20px"
                      className="rounded-full border border-border object-cover"
                    />
                  )}
                  <span className="truncate font-medium text-muted-foreground">
                    {authorName}
                  </span>
                </div>
              )}
              {authorName && readTime && <span aria-hidden="true">•</span>}
              {readTime && <span className="shrink-0">{readTime}</span>}
            </div>
            <time className="shrink-0 text-xs font-medium text-muted-foreground">
              {date}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
}
