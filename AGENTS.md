# AI Instructions for blog

## Project Context

This repository is a high-performance Next.js 15 dev blog using the App Router, Fumadocs MDX, Tailwind CSS 4, Drizzle ORM, Neon Postgres, Clerk, and React 19 and TypeScript.

## Required Stack

- Package manager: `pnpm` only.
- Framework: Next.js 15 App Router with Turbopack for development.
- React: 19.
- Styling: Tailwind CSS 4 through CSS/PostCSS. Do not add `tailwind.config.js` unless the project is intentionally migrated to config-based Tailwind.
- Content: Fumadocs MDX in `blog/content/`.
- Database: Neon Postgres through Drizzle ORM.
- Auth: Clerk, with the existing no-op fallback in `middleware.ts`.
- Icons: `lucide-react` only.

## Repository Map

- `app/`: App Router routes, layouts, metadata, RSS, sitemap, and API routes.
- `components/`: Shared UI components. Keep interactive leaf components client-side.
- `lib/`: Shared application code.
- `lib/db/schema.ts`: Drizzle schema.
- `lib/db/client.ts`: Database client factory and `getDb()`.
- `lib/hooks/`: Client hooks and TanStack Query hooks.
- `lib/generated/read-times.json`: Generated read-time data. Do not edit by hand.
- `blog/content/`: MDX article source files.
- `drizzle/`: Generated Drizzle migrations.
- `.source/`: Fumadocs-generated output. Do not edit by hand.
- `scripts/`: Project automation, including read-time generation.
- `types/`: Shared TypeScript types.

Do not create a `src/` directory. Internal imports must use the root alias `@/`.

## Execution Rules

1. Prefer Server Components. Add `'use client'` only for browser interactivity, React client hooks, TanStack Query hooks, or client-only libraries.
2. Await asynchronous Next.js 15 request APIs before reading values. Treat `params`, `searchParams`, `cookies()`, and similar dynamic APIs as async when used in App Router code.
3. Keep the Clerk fallback resilient. Do not break startup when Clerk environment variables are missing; preserve the `isClerkConfigured()` gate in `middleware.ts`.
4. After editing `lib/db/schema.ts`, run `pnpm run db:generate`.
5. Use Drizzle types from schema objects, such as `InferSelectModel` and `InferInsertModel`, instead of hand-written row types.
6. After adding, deleting, renaming, or editing any file in `blog/content/`, run `pnpm run readtime`.
7. Do not manually edit generated files in `lib/generated/`, `.source/`, or `drizzle/` unless the task explicitly requires generated output review or repair.
8. New code must pass TypeScript strict mode. Avoid `any` unless there is a narrow, documented reason.
9. Favor existing utilities in `lib/` and existing components before adding dependencies or new abstractions.
10. Route-specific components should live near the route when they are not reused elsewhere.

## Commands

| Task | Command |
| --- | --- |
| Development | `pnpm run dev` |
| Production build | `pnpm run build` |
| Lint | `pnpm run lint` |
| Format | `pnpm run format` |
| Format check | `pnpm run format:check` |
| Generate read times | `pnpm run readtime` |
| Generate Drizzle migration | `pnpm run db:generate` |
| Apply Drizzle migrations | `pnpm run db:migrate` |
| Push schema to database | `pnpm run db:push` |
| Open Drizzle Studio | `pnpm run db:studio` |

`pnpm run dev` and `pnpm run build` already run `readtime` and `fumadocs-mdx` before starting Next.js.

## Coding Style

- Use `@/` for internal imports.
- Keep Server Component data access on the server.
- Keep browser-only code out of Server Components.
- Use `server-only` for modules that must never be imported by Client Components when appropriate.
- Use structured validation with existing schemas/utilities where available.
- Keep edits scoped to the requested change and nearby affected code.
