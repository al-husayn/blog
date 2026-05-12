# AI Agent Instructions

## Project Snapshot
- Use `pnpm` for all package and script commands.
- Next.js 15 App Router project with React 19 and TypeScript strict mode.
- Tailwind CSS 4 is configured through CSS and PostCSS; there is no `tailwind.config.js`.
- Auth uses Clerk when configured. `middleware.ts` falls back to a no-op middleware when Clerk env vars are absent.
- Database uses Neon Postgres with Drizzle ORM.
- Content is Fumadocs MDX from `blog/content`.
- API/client data fetching uses Server Components where possible and TanStack Query for client-side state.
- Blog assistant inference is OpenAI-compatible through the app API layer.

## Repository Layout
- `app/`: App Router pages, layouts, route handlers, metadata, sitemap, and RSS route.
- `components/`: Shared UI and feature components.
- `lib/`: Shared utilities, analytics, engagement, API clients, site data, and generated read-time data.
- `lib/db/`: Drizzle schema and Neon client.
- `lib/hooks/`: Client hooks, including TanStack Query hooks.
- `drizzle/`: Generated Drizzle migrations.
- `blog/content/`: Fumadocs MDX posts.
- `scripts/`: Project scripts such as read-time generation.
- `types/`: Shared TypeScript types.

## Commands
- `pnpm dev`: Generate read times, run Fumadocs, and start Next.js with Turbopack.
- `pnpm build`: Generate read times, run Fumadocs, and build the app.
- `pnpm start`: Start the production server.
- `pnpm lint`: Run ESLint.
- `pnpm format`: Format the repo with Prettier.
- `pnpm format:check`: Check Prettier formatting.
- `pnpm readtime`: Regenerate `lib/generated/read-times.json`.
- `pnpm db:generate`: Generate Drizzle migrations.
- `pnpm db:migrate`: Apply Drizzle migrations.
- `pnpm db:push`: Push schema changes directly.
- `pnpm db:studio`: Open Drizzle Studio.

## Development Rules
- Do not add a `src` directory. Import from the existing root-level folders and `@/` alias.
- In Next.js 15 routes, treat `params`, `searchParams`, and request cookies as async when using APIs that return promises.
- Prefer React Server Components. Add `'use client'` only for components that need browser state, effects, event handlers, or client hooks.
- Keep client components near the leaves of the tree and pass serializable props from server components.
- Define database tables in `lib/db/schema.ts`; let Drizzle generate migrations into `drizzle/`.
- Use `getDb()` from `lib/db/client.ts` for database access.
- Keep MDX posts in `blog/content` and update frontmatter according to `source.config.ts`.
- Run `pnpm readtime` after adding or changing MDX content that affects reading time.
- Use `InferSelectModel<typeof table>` or related Drizzle helpers for database model types.
- Secure authenticated UI and route handlers with Clerk utilities, but preserve the current no-op fallback behavior for local environments without Clerk configuration.

## Style Notes
- Follow the existing TypeScript, Prettier, and component patterns.
- Prefer small, focused changes over broad rewrites.
- Keep reusable UI in `components/`; keep route-specific behavior close to the route when it is not shared.
- Use lucide-react icons when the UI needs icons.
- Avoid adding new dependencies unless the existing stack cannot reasonably solve the problem.
