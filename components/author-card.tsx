import Image from "next/image";
import { cn } from "@/lib/utils";
import type { AuthorCardProps } from "@/types/components/author-card";

export function AuthorCard({ author, className }: AuthorCardProps) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <Image
        src={author.avatar}
        alt={author.name}
        width={32}
        height={32}
        sizes="32px"
        className="rounded-full w-8 h-8 border border-border object-cover"
      />
      <div className="flex-1">
        <h3 className="text-sm tracking-tight text-balance font-semibold">
          {author.name}
        </h3>
        <p className="text-xs text-muted-foreground text-balance">
          {author.position}
        </p>
      </div>
    </div>
  );
}
