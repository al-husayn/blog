'use client';

import React from 'react';
import { Link } from 'lucide-react';
import { gooeyToast } from 'goey-toast';
import { copySectionLink, scrollToSection, updateSectionHash } from '@/lib/section-links';
import { cn } from '@/lib/utils';
import type { CopyHeaderProps } from '@/types/components/copy-header';

function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
}

// ✅ small utility to handle ReactNode properly
function extractText(node: React.ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
    }

    if (Array.isArray(node)) {
        return node.map(extractText).join('');
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        return extractText(node.props.children);
    }

    return '';
}

export function CopyHeader({
    level,
    children,
    className,
    id, // ✅ explicit id support
    ...props
}: CopyHeaderProps & { id?: string }) {
    const text = extractText(children);
    const generatedSlug = generateSlug(text);

    // ✅ single source of truth
    const headingId = id || generatedSlug || undefined;

    const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    const copyToClipboard = async () => {
        if (!headingId) return;

        updateSectionHash(headingId);
        scrollToSection(headingId);

        try {
            await copySectionLink(headingId);
            gooeyToast.success('Section link copied', {
                description: 'You can paste this heading link anywhere.',
                timing: { displayDuration: 2600 },
                showTimestamp: false,
            });
        } catch {
            gooeyToast.error('Could not copy this section link', {
                description:
                    'The page still jumped to the section, so you can copy the URL from the address bar.',
                showTimestamp: false,
            });
        }
    };

    const showCopyFunctionality = (level === 1 || level === 2) && Boolean(headingId);

    if (showCopyFunctionality) {
        return (
            <HeadingTag
                id={headingId}
                className={cn(
                    'group relative scroll-mt-20 cursor-pointer hover:text-muted-foreground transition-colors duration-200 flex items-center gap-2',
                    className,
                )}
                onClick={copyToClipboard}
                title='Click to copy link to this section'
                {...props}
            >
                {children}
                <Link className='w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0' />
            </HeadingTag>
        );
    }

    return (
        <HeadingTag id={headingId} className={cn('scroll-mt-20', className)} {...props}>
            {children}
        </HeadingTag>
    );
}
