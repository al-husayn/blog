import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';

export interface DrawerContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export interface DrawerProps {
  children: ReactNode;
}

export interface DrawerTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export interface DrawerContentProps {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export interface DrawerHeaderProps {
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export interface DrawerBodyProps {
  children: ReactNode;
  className?: string;
}

export interface DrawerFooterProps {
  children: ReactNode;
  className?: string;
}
