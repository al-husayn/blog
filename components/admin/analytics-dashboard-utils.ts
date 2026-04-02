import type { AnalyticsTimeseriesPoint } from '@/types/analytics';

const numberFormatter = new Intl.NumberFormat('en-US');
const compactNumberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

export const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

export const sourceColors: Record<string, string> = {
    direct: '#0f766e',
    organic: '#ea580c',
    social: '#2563eb',
    referral: '#7c3aed',
    new: '#ea580c',
    returning: '#0f766e',
};

export const formatNumber = (value: number): string => numberFormatter.format(value);

export const formatCompactNumber = (value: number): string =>
    compactNumberFormatter.format(value);

export const formatPercent = (value: number): string =>
    `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;

export const formatDelta = (value: number | null): string =>
    value === null ? 'No prior data' : `${value >= 0 ? '+' : ''}${formatPercent(value)}`;

export const formatDuration = (value: number): string => {
    if (value < 60) {
        return `${value}s`;
    }

    const minutes = Math.floor(value / 60);
    const seconds = value % 60;

    if (minutes < 60) {
        return `${minutes}m ${seconds}s`;
    }

    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
};

export const formatSourceShare = (value: number, total: number): string =>
    total === 0 ? '0%' : formatPercent((value / total) * 100);

export const buildPath = (points: Array<{ x: number; y: number }>): string =>
    points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
        .join(' ');

export const buildChartPoints = (
    points: AnalyticsTimeseriesPoint[],
    width: number,
    height: number,
    padding: number,
): Array<{ x: number; y: number }> => {
    if (points.length === 0) {
        return [];
    }

    const maxValue = Math.max(...points.map((point) => point.value), 1);
    const minValue = Math.min(...points.map((point) => point.value), 0);
    const valueRange = Math.max(maxValue - minValue, 1);
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return points.map((point, index) => ({
        x: padding + (chartWidth * index) / Math.max(points.length - 1, 1),
        y: padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight,
    }));
};
