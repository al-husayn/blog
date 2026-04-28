'use client';

import { cn } from '@/lib/utils';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlickeringGridProps } from '@/types/components/flickering-grid';

const FALLBACK_GRID_COLOR = 'rgb(107, 114, 128)';
const CSS_VAR_PATTERN = /^var\((--[^,\s)]+)(?:,\s*([^)]+))?\)$/;
const MAX_VAR_RESOLVE_DEPTH = 4;

const resolveCssVariableColor = (input: string, themeClassName: string): string => {
    if (typeof window === 'undefined') {
        return input;
    }

    let candidate = input.trim();
    const rootStyles = getComputedStyle(document.documentElement);

    // Include the theme class signature in this function call so we re-resolve
    // CSS variables after light/dark class changes.
    const _themeSignature = themeClassName;
    void _themeSignature;

    for (let depth = 0; depth < MAX_VAR_RESOLVE_DEPTH; depth += 1) {
        const match = CSS_VAR_PATTERN.exec(candidate);
        if (!match) {
            return candidate || FALLBACK_GRID_COLOR;
        }

        const [, varName, fallback = ''] = match;
        const resolved = rootStyles.getPropertyValue(varName).trim();
        if (resolved) {
            candidate = resolved;
            continue;
        }

        candidate = fallback.trim();
        if (!candidate) {
            return FALLBACK_GRID_COLOR;
        }
    }

    return candidate || FALLBACK_GRID_COLOR;
};

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
    squareSize = 4,
    gridGap = 6,
    flickerChance = 0.3,
    color = 'var(--muted-foreground)',
    width,
    height,
    className,
    maxOpacity = 0.3,
    ...props
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [rootThemeClass, setRootThemeClass] = useState('');

    useEffect(() => {
        const root = document.documentElement;
        const updateThemeClass = () => setRootThemeClass(root.className);

        updateThemeClass();

        const observer = new MutationObserver(updateThemeClass);
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const memoizedColor = useMemo(() => {
        const toRGBA = (inputColor: string) => {
            if (typeof window === 'undefined') {
                return 'rgba(107, 114, 128,';
            }
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            const ctx = canvas.getContext('2d');
            if (!ctx) return 'rgba(107, 114, 128,';

            const resolvedColor = resolveCssVariableColor(inputColor, rootThemeClass);

            ctx.fillStyle = FALLBACK_GRID_COLOR;
            ctx.fillStyle = resolvedColor;
            ctx.fillRect(0, 0, 1, 1);
            const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
            return `rgba(${r}, ${g}, ${b},`;
        };
        return toRGBA(color);
    }, [color, rootThemeClass]);

    const setupCanvas = useCallback(
        (canvas: HTMLCanvasElement, width: number, height: number) => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            const cols = Math.floor(width / (squareSize + gridGap));
            const rows = Math.floor(height / (squareSize + gridGap));

            const squares = new Float32Array(cols * rows);
            for (let i = 0; i < squares.length; i++) {
                squares[i] = Math.random() * maxOpacity;
            }

            return { cols, rows, squares, dpr };
        },
        [squareSize, gridGap, maxOpacity],
    );

    const updateSquares = useCallback(
        (squares: Float32Array, deltaTime: number) => {
            for (let i = 0; i < squares.length; i++) {
                if (Math.random() < flickerChance * deltaTime) {
                    squares[i] = Math.random() * maxOpacity;
                }
            }
        },
        [flickerChance, maxOpacity],
    );

    const drawGrid = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            width: number,
            height: number,
            cols: number,
            rows: number,
            squares: Float32Array,
            dpr: number,
        ) => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'transparent';
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const opacity = squares[i * rows + j];
                    ctx.fillStyle = `${memoizedColor}${opacity})`;
                    ctx.fillRect(
                        i * (squareSize + gridGap) * dpr,
                        j * (squareSize + gridGap) * dpr,
                        squareSize * dpr,
                        squareSize * dpr,
                    );
                }
            }
        },
        [memoizedColor, squareSize, gridGap],
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let gridParams: ReturnType<typeof setupCanvas>;

        const updateCanvasSize = () => {
            const newWidth = width || container.clientWidth;
            const newHeight = height || container.clientHeight;
            setCanvasSize({ width: newWidth, height: newHeight });
            gridParams = setupCanvas(canvas, newWidth, newHeight);
        };

        updateCanvasSize();

        let lastTime = 0;
        const animate = (time: number) => {
            if (!isInView) return;

            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;

            updateSquares(gridParams.squares, deltaTime);
            drawGrid(
                ctx,
                canvas.width,
                canvas.height,
                gridParams.cols,
                gridParams.rows,
                gridParams.squares,
                gridParams.dpr,
            );
            animationFrameId = requestAnimationFrame(animate);
        };

        const resizeObserver = new ResizeObserver(() => {
            updateCanvasSize();
        });

        resizeObserver.observe(container);

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0 },
        );

        intersectionObserver.observe(canvas);

        if (isInView) {
            animationFrameId = requestAnimationFrame(animate);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

    return (
        <div ref={containerRef} className={cn(`h-full w-full ${className}`)} {...props}>
            <canvas
                ref={canvasRef}
                className='pointer-events-none'
                aria-hidden='true'
                role='presentation'
                style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                }}
            />
        </div>
    );
};
