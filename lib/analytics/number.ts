export const toNumber = (value: number | string | bigint | null | undefined): number => {
    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'bigint') {
        return Number(value);
    }

    if (typeof value === 'string') {
        return Number.parseFloat(value);
    }

    return 0;
};

export const clampNumber = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

export const roundToOneDecimal = (value: number): number => Math.round(value * 10) / 10;

export const getGrowthDelta = (currentValue: number, previousValue: number): number | null => {
    if (previousValue === 0) {
        return currentValue === 0 ? null : 100;
    }

    return ((currentValue - previousValue) / previousValue) * 100;
};
