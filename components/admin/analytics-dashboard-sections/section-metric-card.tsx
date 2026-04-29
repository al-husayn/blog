import type { ReactNode } from 'react';

interface SectionMetricCardProps {
    icon?: ReactNode;
    label: string;
    value: ReactNode;
    className?: string;
}

export function SectionMetricCard({ icon, label, value, className }: SectionMetricCardProps) {
    return (
        <div className={className ?? 'rounded-2xl border border-border/70 bg-background/60 p-4'}>
            {icon}
            <p className='mt-3 text-3xl font-semibold'>{value}</p>
            <p className='mt-1 text-sm text-muted-foreground'>{label}</p>
        </div>
    );
}
