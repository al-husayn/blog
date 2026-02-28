"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

const useDrawer = () => {
    const context = useContext(DrawerContext);
    if (!context) {
        throw new Error("Drawer components must be used within a Drawer");
    }
    return context;
};

interface DrawerProps {
    children: React.ReactNode;
}

export function Drawer({ children }: DrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <DrawerContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </DrawerContext.Provider>
    );
}

interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export function DrawerTrigger({ children, className, onClick, ...props }: DrawerTriggerProps) {
    const { setIsOpen } = useDrawer();

    return (
        <button
            onClick={(event) => {
                onClick?.(event);
                if (!event.defaultPrevented) {
                    setIsOpen(true);
                }
            }}
            className={cn(className)}
            {...props}
        >
            {children}
        </button>
    );
}

interface DrawerContentProps {
    children: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function DrawerContent({ children, className, onClick }: DrawerContentProps) {
    const { isOpen, setIsOpen } = useDrawer();

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => setIsOpen(false)}
                    />

                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{
                            duration: 0.25,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        onClick={(event) => {
                            onClick?.(event);
                            if (event.defaultPrevented) {
                                return;
                            }

                            const target = event.target as HTMLElement;
                            if (target.closest("[data-drawer-close='true']")) {
                                setIsOpen(false);
                            }
                        }}
                        className={cn(
                            "fixed bottom-3 left-0 right-0 bg-background border-t border-border rounded-lg z-[60] max-h-[70vh] overflow-hidden w-[95%] mx-auto flex flex-col",
                            className
                        )}
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

interface DrawerHeaderProps {
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

export function DrawerHeader({ children, className, showCloseButton = true }: DrawerHeaderProps) {
    const { setIsOpen } = useDrawer();

    return (
        <div className={cn("flex items-center justify-between p-4 border-b border-border", className)}>
            <div className="flex-1">{children}</div>
            {showCloseButton && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors ml-4"
                >
                    <X size={20} />
                </motion.button>
            )}
        </div>
    );
}

interface DrawerBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function DrawerBody({ children, className }: DrawerBodyProps) {
    return (
        <div className={cn("p-4 overflow-y-auto flex-1", className)}>
            {children}
        </div>
    );
}

interface DrawerFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function DrawerFooter({ children, className }: DrawerFooterProps) {
    return (
        <div className={cn("border-t border-border", className)}>
            {children}
        </div>
    );
} 
