# Learn. Build. Share.

A modern technical blog built with Next.js 15, Fumadocs MDX, Tailwind CSS, Clerk, Neon, Drizzle, and TanStack Query. It includes article pages, SEO metadata, an embedded AI assistant, and a synced engagement system with article upvotes, comments, and comment upvotes.

## Highlights

- Next.js 15 App Router blog with MDX-powered content
- Automatic read-time generation for every post
- Embedded article-aware AI assistant
- Clerk-authenticated engagement system
- Private admin analytics dashboard with first-party article tracking
- TanStack Query-powered client caching, syncing, and optimistic engagement updates
- Neon Postgres persistence through Drizzle ORM
- Responsive UI, dark mode, RSS, sitemap, and Open Graph images

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Fumadocs MDX
- Tailwind CSS 4
- TanStack Query
- Clerk
- Neon Postgres
- Drizzle ORM and Drizzle Kit
- OpenRouter or any OpenAI-compatible inference endpoint

## Client Data Layer

TanStack Query is used for client-side server state, especially around engagement features such as article upvotes, comments, and comment upvotes.

- A shared `QueryClient` is created in `components/query-provider.tsx`.
- Engagement queries and mutations are organized in `lib/hooks/use-engagement.ts`.
- Comment tree update helpers live in `lib/engagement-client.ts`.
- Current defaults use a 30 second `staleTime`, a 5 minute `gcTime`, background refetching on window focus and reconnect, and optimistic mutation updates for engagement interactions.

## Prerequisites

- Node.js 20.9 or newer
- pnpm 10 or newer

## Getting Started

1. Clone the repository and install dependencies.

```bash
git clone https://github.com/al-husayn/blog
cd blog
pnpm install
```

2. Create a `.env.local` file and add the values your environment needs.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgres://user:password@host/dbname?sslmode=require
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
ADMIN_USER_IDS=user_123,user_456
AI_API_BASE_URL=https://openrouter.ai/api/v1
AI_API_KEY=your_cloud_api_key_here
AI_MODEL=openrouter/free
```

3. Sync the database schema.

```bash
pnpm db:push
```

4. Start the development server.

```bash
pnpm dev
```

5. Build for production when needed.

```bash
pnpm build
```

## Environment Variables

### Core

- `NEXT_PUBLIC_SITE_URL`: Public site URL used for local and deployed metadata.

### Database and Auth

- `DATABASE_URL`: Neon Postgres connection string.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key for client auth.
- `CLERK_SECRET_KEY`: Clerk secret key for server auth.
- `ADMIN_USER_IDS`: Comma-separated Clerk user IDs allowed to access `/admin`.

### AI Assistant

- `AI_API_BASE_URL`: OpenAI-compatible base URL. The default setup uses OpenRouter.
- `AI_API_KEY`: Provider API key.
- `AI_MODEL`: Model identifier used by the blog assistant.

## Database and Engagement

The engagement system is backed by Neon and Drizzle and is tied to Clerk authentication.

- Article likes and dislikes have been removed.
- Article upvotes are persisted per signed-in user.
- Comments are persisted and linked to the authenticated Clerk user.
- Comment upvotes are persisted per signed-in user.
- The schema is aligned with the live engagement tables: `article_comments`, `article_upvotes`, and `comment_upvotes`.
- The analytics dashboard stores article page views and share events in `article_page_views` and `article_share_events`.

## Admin Analytics Dashboard

Visit `/admin` after signing in with a Clerk user ID listed in `ADMIN_USER_IDS`.

The dashboard includes:

- 7d, 30d, 90d, and all-time pageviews
- Unique visitors and new vs returning reader ratios
- Top posts by 30d and all-time views
- Traffic source attribution for direct, organic, social, and referrals
- Average engaged time, bounce rate, and scroll depth completion
- Organic search trend lines and top referrer keywords when available
- Share tracking and first-48-hour comment velocity

Article analytics are collected with lightweight first-party tracking on blog post pages and the built-in share controls.

Useful commands:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio
```

The Drizzle config reads `DATABASE_URL` from `.env.local` or `.env`, so `pnpm db:push` works outside the Next.js runtime as well.

## AI Assistant

Each article page includes an assistant that is grounded in the active post content. By default, the project is configured for OpenRouter, but any OpenAI-compatible provider can be used by updating `AI_API_BASE_URL` and `AI_MODEL`.

If your chosen model or route changes, restart the dev server after updating environment variables.

## Writing Posts

Create a new `.mdx` file inside `blog/content/`.

Example frontmatter:

````mdx
---
title: "Your Blog Post Title"
description: "A brief description of your post"
date: "2026-03-17"
tags: ["JavaScript", "Next.js", "Tutorial"]
featured: true
author: "al"
thumbnail: "/blog/example-cover.png"
---

Your blog post content here...
````

Notes:

- `author` should be an author key from `lib/authors.ts`, not a display name.
- `readTime` is generated automatically from the MDX content.
- Read times are regenerated during `pnpm dev`, `pnpm build`, and with `pnpm run readtime`.

## Authors

Author records live in `lib/authors.ts`.

Current built-in keys:

- `al`
- `al-hussein`
- `hamdan`

Add a new author there, then reference that key in your post frontmatter.

## Scripts

- `pnpm dev`: Generate read times, compile MDX sources, and start the dev server.
- `pnpm build`: Generate read times, compile MDX sources, and build the app.
- `pnpm start`: Start the production server.
- `pnpm lint`: Run Next.js linting.
- `pnpm readtime`: Regenerate `lib/generated/read-times.json`.
- `pnpm db:generate`: Generate Drizzle migration files from the schema.
- `pnpm db:migrate`: Run Drizzle migrations.
- `pnpm db:push`: Push the current schema to the database.
- `pnpm db:studio`: Open Drizzle Studio.

## Project Notes

- The site includes RSS, sitemap, metadata, and Open Graph image generation.
- Engagement routes live under `app/api/engagement`.
- Client-side engagement state is cached and synchronized through TanStack Query.
- If Clerk keys are missing, the site still renders, but synced engagement features remain unavailable until auth is configured.

## License

This project is open source and available under the [MIT License](LICENSE).
