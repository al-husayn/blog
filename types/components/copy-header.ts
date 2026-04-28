import type { HTMLAttributes, ReactNode } from 'react';

export interface CopyHeaderProps extends HTMLAttributes<HTMLHeadingElement> {
    level: number;
    children: ReactNode;
}
