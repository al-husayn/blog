import type { ComponentProps, ReactNode } from 'react';
import type { Card as FumaCard, Cards as FumaCards } from 'fumadocs-ui/components/card';
import type { Tab as FumaTab, Tabs as FumaTabs } from 'fumadocs-ui/components/tabs';
import type { AuthorKey } from '@/types/authors';

export interface AuthorProps {
  id: AuthorKey;
}

export interface TabsProps extends ComponentProps<typeof FumaTabs> {
  children?: ReactNode;
}

export interface TabProps extends ComponentProps<typeof FumaTab> {
  title?: string;
}

export interface CardGroupProps extends ComponentProps<typeof FumaCards> {
  cols?: number;
}

export interface StepProps {
  title?: ReactNode;
  children?: ReactNode;
}

export interface MdxCardProps extends ComponentProps<typeof FumaCard> {
  icon?: ReactNode | string;
}

export interface MdxPreProps extends ComponentProps<'pre'> {
  icon?: ReactNode | string;
}
