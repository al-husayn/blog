import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/lib/db/schema';

const createDb = () => {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL is required to use engagement storage.');
    }

    return drizzle(neon(databaseUrl), { schema });
};

declare global {
    var __blogDb: ReturnType<typeof createDb> | undefined;
}

export const getDb = () => {
    if (process.env.NODE_ENV === 'production') {
        return createDb();
    }

    if (!globalThis.__blogDb) {
        globalThis.__blogDb = createDb();
    }

    return globalThis.__blogDb;
};
