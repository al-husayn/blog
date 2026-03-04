"use client";

import React, { useState, useEffect, createContext, useContext, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
    DrawerBodyProps,
    DrawerContentProps,
    DrawerContextType,
    DrawerFooterProps,
    DrawerHeaderProps,
    DrawerProps,
    DrawerTriggerProps,
} from "@/types/components/drawer";

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

const useDrawer = () => {
    const context = useContext(DrawerContext);
    if (!context) {
        throw new Error("Drawer components must be used within a Drawer");
    }
    return context;
};

export function Drawer({ children }: DrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
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

export function DrawerTrigger({ children, className, onClick, ...props }: DrawerTriggerProps) {
    const { setIsOpen } = useDrawer();

    return (
        <button
            type="button"
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

export function DrawerContent({ children, className, onClick }: DrawerContentProps) {
    const { isOpen, setIsOpen } = useDrawer();
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", onKeyDown);
        contentRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen, setIsOpen]);

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
                        aria-hidden="true"
                        onClick={() => setIsOpen(false)}
                    />

                    <motion.div
                        ref={contentRef}
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{
                            duration: 0.25,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        role="dialog"
                        aria-modal="true"
                        tabIndex={-1}
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

export function DrawerHeader({ children, className, showCloseButton = true }: DrawerHeaderProps) {
    const { setIsOpen } = useDrawer();

    return (
        <div className={cn("flex items-center justify-between p-4 border-b border-border", className)}>
            <div className="flex-1">{children}</div>
            {showCloseButton && (
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                    aria-label="Close drawer"
                    className="ml-4 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <X size={20} />
                </motion.button>
            )}
        </div>
    );
}

export function DrawerBody({ children, className }: DrawerBodyProps) {
    return (
        <div className={cn("p-4 overflow-y-auto flex-1", className)}>
            {children}
        </div>
    );
}

export function DrawerFooter({ children, className }: DrawerFooterProps) {
    return (
        <div className={cn("border-t border-border", className)}>
            {children}
        </div>
    );
} 
