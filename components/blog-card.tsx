import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  authorName?: string;
  authorAvatar?: string;
  readTime?: string;
  thumbnail?: string;
  showRightBorder?: boolean;
}

export function BlogCard({
  url,
  title,
  description,
  date,
  authorName,
  authorAvatar,
  readTime,
  thumbnail,
  showRightBorder = true,
}: BlogCardProps) {
  return (
    <Link
      href={url}
      className={cn(
        "group block relative focus-visible:outline-none before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-0 after:h-px after:w-screen after:bg-border after:content-['']",
        showRightBorder && "md:border-r border-border border-b-0"
      )}
    >
      <div className="flex h-full flex-col bg-background transition-[background-color,box-shadow] duration-200 group-hover:bg-muted/30 group-hover:shadow-sm group-focus-visible:bg-muted/30 group-focus-visible:shadow-sm">
        {thumbnail && (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="p-6 flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-card-foreground group-hover:underline underline-offset-4">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">{description}</p>
          {(authorName || readTime) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {authorName && (
                <div className="flex items-center gap-2">
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
                  <span className="font-medium text-muted-foreground">
                    {authorName}
                  </span>
                </div>
              )}
              {authorName && readTime && <span aria-hidden="true">•</span>}
              {readTime && <span>{readTime}</span>}
            </div>
          )}
          <time className="block text-sm font-medium text-muted-foreground">
            {date}
          </time>
        </div>
      </div>
    </Link>
  );
}
