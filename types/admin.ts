export type AdminAccessState =
    | { kind: 'analytics-unconfigured' }
    | { kind: 'clerk-unconfigured' }
    | { kind: 'admin-unconfigured' }
    | { kind: 'signed-out' }
    | { kind: 'forbidden'; userId: string; primaryEmail: string | null }
    | { kind: 'authorized'; userId: string; primaryEmail: string | null };

export interface AdminAccessError {
    message: string;
    status: number;
}
