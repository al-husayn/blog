"use client";

import React from "react";
import { Link } from "lucide-react";
import { gooeyToast } from "goey-toast";
import { copySectionLink, scrollToSection, updateSectionHash } from "@/lib/section-links";
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
        if (!id) {
            return;
        }

        updateSectionHash(id);
        scrollToSection(id);

        try {
            await copySectionLink(id);
            gooeyToast.success("Section link copied", {
                description: "You can paste this heading link anywhere.",
                timing: { displayDuration: 2600 },
                showTimestamp: false,
            });
        } catch {
            gooeyToast.error("Could not copy this section link", {
                description: "The page still jumped to the section, so you can copy the URL from the address bar.",
                showTimestamp: false,
            });
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
