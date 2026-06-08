import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    eslintConfigPrettier,
    globalIgnores([
        '.next/**',
        '.source/**',
        'node_modules/**',
        '**/*.md',
        '**/*.mdx',
        'scripts/generate-read-times.js',
    ]),
    {
        files: ['scripts/**/*.js'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
]);

export default eslintConfig;
