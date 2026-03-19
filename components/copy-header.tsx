"use client";

import React from "react";
import { Link } from "lucide-react";
import { copyTextToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import type { CopyHeaderProps } from "@/types/components/copy-header";

function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
}

export function CopyHeader({ level, children, className, ...props }: CopyHeaderProps) {
    const text = typeof children === "string" ? children : "";
    const id = generateSlug(text);

    const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    const copyToClipboard = async () => {
        const url = `${window.location.origin}${window.location.pathname}#${id}`;

        window.history.pushState({}, '', `#${id}`);

        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }

        try {
            await copyTextToClipboard(url);
        } catch (err) {
            console.error(err);
        }
    };

    const showCopyFunctionality = level === 1 || level === 2;

    if (showCopyFunctionality) {
        return (
            <HeadingTag
                id={id}
                className={cn(
                    "group relative scroll-mt-20 cursor-pointer hover:text-muted-foreground transition-colors duration-200 flex items-center gap-2",
                    className
                )}
                onClick={copyToClipboard}
                title="Click to copy link to this section"
                {...props}
            >
                {children}
                <Link className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
            </HeadingTag>
        );
    }

    return (
        <HeadingTag
            id={id}
            className={cn("scroll-mt-20", className)}
            {...props}
        >
            {children}
        </HeadingTag>
    );
} 
