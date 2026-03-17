import { readFileSync } from 'fs';
import { join } from 'path';
import { defineConfig } from 'drizzle-kit';

const readEnvValue = (key: string): string | undefined => {
    if (process.env[key]?.trim()) {
        return process.env[key]?.trim();
    }

    const envPaths = [join(process.cwd(), '.env.local'), join(process.cwd(), '.env')];

    for (const envPath of envPaths) {
        try {
            const fileContent = readFileSync(envPath, 'utf8');
            const lines = fileContent.split(/\r?\n/);

            for (const line of lines) {
                const trimmedLine = line.trim();

                if (!trimmedLine || trimmedLine.startsWith('#')) {
                    continue;
                }

                const match = trimmedLine.match(new RegExp(`^${key}\\s*=\\s*(.*)$`));

                if (match) {
                    return match[1].trim().replace(/^['"]|['"]$/g, '');
                }
            }
        } catch {
            continue;
        }
    }

    return undefined;
};

const databaseUrl = readEnvValue('DATABASE_URL');

export default defineConfig({
    out: './drizzle',
    schema: './lib/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: databaseUrl ?? '',
    },
    strict: true,
    verbose: true,
});
