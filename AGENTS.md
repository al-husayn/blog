To make this AGENTS.md more effective, we need to shift from "telling a story" to providing "executable constraints." Modern coding agents perform better with explicit patterns, error prevention rules, and clear file locations.
Here is the optimized version with improved structure, stricter logic, and better performance cues for the AI.
------------------------------
## AGENTS.md## 🎯 Context & Goal
High-performance Next.js 15 blog using Fumadocs (MDX), Drizzle ORM (Neon), and Clerk. Optimized for React 19 and Tailwind 4.
## 🛠 Tech Stack & Constraints

* Runtime/Package Manager: pnpm (Mandatory).
* Framework: Next.js 15 (App Router, Turbopack).
* React: v19 (Experimental/RC features allowed).
* Styling: Tailwind CSS 4 (No tailwind.config.js; logic lives in CSS files).
* Data: Neon Postgres + Drizzle ORM.
* Content: Fumadocs MDX located in blog/content/.
* Auth: Clerk (with a no-op fallback in middleware.ts).

## 📂 Architecture Map

* app/: Routing, Metadata, RSS, Sitemap.
* components/: UI components. Keep "leaf" components client-side.
* lib/:
* db/: Schema (schema.ts) and Client (client.ts using getDb()).
   * hooks/: Custom hooks + TanStack Query logic.
   * generated/: Read-time JSON (Do not edit manually).
* blog/content/: MDX source files.
* 🚫 Prohibited: Do NOT create a src/ directory. Use root aliases (@/).

## 🤖 Critical Execution Rules

   1. Async Next.js 15 APIs: params, searchParams, and cookies() must be awaited before access.
   2. Server-First: Default to Server Components. Use 'use client' only for interactivity or TanStack Query hooks.
   3. Database Workflow:
   * Edit lib/db/schema.ts → Run pnpm db:generate.
      * Use InferSelectModel / InferInsertModel for TypeScript types.
   4. Content Updates: Every time an MDX file is added/modified, you must run pnpm readtime.
   5. Icons: Use lucide-react exclusively.
   6. Environment Resilience: Maintain the Clerk "no-op" fallback logic. Do not break the app if NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing.

## ⌨️ Command Reference

| Task | Command |
|---|---|
| Dev | pnpm dev (Runs readtime + fumadocs + turbopack) |
| Schema Change | pnpm db:generate |
| Deploy DB | pnpm db:migrate or pnpm db:push |
| Content Sync | pnpm readtime |
| Lint/Format | pnpm lint && pnpm format |

## 📝 Coding Style Guidelines

* Imports: Always use @/ for internal modules.
* Components: Group route-specific components inside the route folder if they aren't reused.
* Efficiency: Favor existing utilities in lib/ over new dependencies.
* Strict Mode: Ensure all new code passes TypeScript strict mode checks.

