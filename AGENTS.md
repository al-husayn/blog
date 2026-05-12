# AI Agent Instructions for blog

## Tech Stack Overview
- **Package Manager**: `pnpm` (Strictly use pnpm)
- **Framework**: Next.js 15 (App Router, React 19, **No src directory**)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4
- **Auth**: Clerk (Next.js SDK)
- **Database**: Neon Postgres (Serverless) + Drizzle ORM
- **Content**: Fumadocs MDX
- **Data Fetching**: TanStack Query & Server Components
- **Inference**: OpenRouter / OpenAI-compatible

## Core Directives
1. **Directory Structure**: This project does **NOT** use a `src` directory. Root-level folders include `app/`, `components/`, `lib/`, `blog/`, `drizzle/`, `public/`, `scripts/`, and `types/`.
2. **Next.js 15 APIs**: `params`, `searchParams`, and `cookies` are asynchronous. Always `await` them before access.
3. **RSC Strategy**: Use React Server Components by default. Keep `'use client'` components at the leaf nodes.
4. **Database Flow**: Define schemas in `lib/db/schema.ts`. Use Drizzle Kit for all migrations.
5. **Tailwind 4**: Use the new CSS-native configuration in `app/globals.css`. Do not look for a `tailwind.config.js`.

## Critical Commands
- **Dev**: `pnpm dev`
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Format**: `pnpm format`
- **Format Check**: `pnpm format:check`
- **Read Times**: `pnpm readtime`
- **DB Generate**: `pnpm db:generate`
- **DB Migrate**: `pnpm db:migrate`
- **DB Push**: `pnpm db:push`
- **DB Studio**: `pnpm db:studio`

## Project Structure (Root-level)
- `app/`: Next.js routes, layouts, and Server Actions.
- `components/`: UI components (radix/shadcn style) and feature components.
- `lib/db/`: Drizzle schema and Neon client config.
- `drizzle/`: Drizzle migrations generated from `lib/db/schema.ts`.
- `lib/`: Shared utilities, analytics helpers, API clients, and site data.
- `lib/hooks/`: TanStack Query and custom React hooks.
- `blog/content/`: MDX files for Fumadocs.

## Coding Conventions
- **Server Actions**: Place actions in `app/actions.ts` or alongside routes.
- **Type Safety**: Use `InferSelectModel<typeof table>` for return types.
- **Auth**: Secure routes via `middleware.ts` and use `auth()` in Server Components.
