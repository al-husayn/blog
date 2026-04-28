import type { LucideIcon } from 'lucide-react';

export interface BaseSocialLink {
    label: string;
    href: string;
    icon: LucideIcon;
}

export interface ConnectLink extends BaseSocialLink {
    description: string;
    external?: boolean;
}

export type FooterSocialLink = BaseSocialLink;
