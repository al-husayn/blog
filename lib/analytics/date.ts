import { DAY_IN_MS } from '@/lib/analytics/constants';
import type { AnalyticsTimeseriesPoint } from '@/types/analytics';
import { toNumber } from '@/lib/analytics/number';

const UTC_DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
});

const UTC_MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
});

export const toDate = (value: Date | string | null | undefined): Date | null => {
    if (!value) {
        return null;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const formatDayKey = (value: Date): string => value.toISOString().slice(0, 10);

export const formatMonthKey = (value: Date): string =>
    `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}`;

export const startOfUtcDay = (value: Date): Date =>
    new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));

export const startOfUtcMonth = (value: Date): Date =>
    new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));

export const subtractDays = (value: Date, days: number): Date =>
    new Date(value.getTime() - days * DAY_IN_MS);

export const subtractMonths = (value: Date, months: number): Date =>
    new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() - months, 1));

export const buildSinceDate = (days: number, now: Date): Date =>
    startOfUtcDay(subtractDays(now, days - 1));

export const buildFilledDailySeries = (
    rows: Array<{ day: string; value: number | string | bigint }>,
    days: number,
    now: Date,
): AnalyticsTimeseriesPoint[] => {
    const valuesByDay = new Map(rows.map((row) => [row.day, toNumber(row.value)]));
    const firstDay = buildSinceDate(days, now);

    return Array.from({ length: days }, (_, offset) => {
        const currentDay = new Date(firstDay.getTime() + offset * DAY_IN_MS);
        const dayKey = formatDayKey(currentDay);

        return {
            date: dayKey,
            label: UTC_DAY_FORMATTER.format(currentDay),
            value: valuesByDay.get(dayKey) ?? 0,
        };
    });
};

export const buildFilledMonthlySeries = (
    rows: Array<{ month: string; value: number | string | bigint }>,
    months: number,
    now: Date,
): AnalyticsTimeseriesPoint[] => {
    const valuesByMonth = new Map(rows.map((row) => [row.month, toNumber(row.value)]));
    const firstMonth = startOfUtcMonth(subtractMonths(now, months - 1));

    return Array.from({ length: months }, (_, offset) => {
        const currentMonth = new Date(
            Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + offset, 1),
        );
        const monthKey = formatMonthKey(currentMonth);

        return {
            date: monthKey,
            label: UTC_MONTH_FORMATTER.format(currentMonth),
            value: valuesByMonth.get(monthKey) ?? 0,
        };
    });
};
