import type { ReactNode } from 'react';
import type {
    AnalyticsTimeseriesPoint,
    DashboardAnalytics,
    DashboardTopPostMetric,
} from '@/types/analytics';

export interface AnalyticsDashboardSectionProps {
    data: DashboardAnalytics;
}

export interface AnalyticsDashboardViewProps {
    data: DashboardAnalytics;
    isRefreshing: boolean;
    onRefresh: () => void;
    refreshError: string | null;
}

export interface DashboardStateProps {
    title: string;
    description: string;
    action?: ReactNode;
    isLoading?: boolean;
}

export interface CardProps {
    title: string;
    description: string;
    className?: string;
    children: ReactNode;
}

export interface DonutSegment {
    label: string;
    value: number;
    color: string;
}

export interface SparklineProps {
    points: AnalyticsTimeseriesPoint[];
    height?: number;
    stroke?: string;
    gradientId?: string;
}

export interface LineChartProps {
    points: AnalyticsTimeseriesPoint[];
    gradientId?: string;
}

export interface DonutChartProps {
    segments: DonutSegment[];
    centerLabel: string;
    centerSubLabel: string;
}

export interface EngagementGaugeProps {
    score: number;
    label: string;
}

export interface LeaderboardListProps {
    title: string;
    posts: DashboardTopPostMetric[];
    metricLabel: string;
    metricValue: (post: DashboardTopPostMetric) => string;
}

export interface ProgressRowProps {
    label: string;
    valueLabel: string;
    percent: number;
    color?: string;
}

export interface SectionMetricCardProps {
    icon?: ReactNode;
    label: string;
    value: ReactNode;
    className?: string;
}

export interface TopPostsMobileListProps {
    posts: DashboardTopPostMetric[];
}

export interface TopPostsMobileCardProps {
    post: DashboardTopPostMetric;
}

export interface MobileStatCardProps {
    label: string;
    value: string;
}

export interface TopPostsTableProps {
    posts: DashboardTopPostMetric[];
}

export interface TopPostsTableRowProps {
    post: DashboardTopPostMetric;
}

export interface PostLinkProps {
    post: DashboardTopPostMetric;
}
