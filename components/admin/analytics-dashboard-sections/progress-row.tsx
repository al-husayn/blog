import type { ProgressRowProps } from '@/types/components/admin-analytics';

export function ProgressRow({ label, valueLabel, percent, color }: ProgressRowProps) {
    return (
        <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
                <p className='font-medium'>{label}</p>
                <p className='text-muted-foreground'>{valueLabel}</p>
            </div>
            <div className='h-2 rounded-full bg-muted/60'>
                <div
                    className='h-full rounded-full bg-foreground'
                    style={{
                        width: `${percent}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
        </div>
    );
}
