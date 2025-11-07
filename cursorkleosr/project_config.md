# project_config.md
Developer Workflow Configuration

<!-- STATIC:GOAL:START -->
## Goal  
Developer-focused autonomous code workflow for CinemaRebel
Target: green build (lint/typecheck/tests), minimal diff, zero regressions
<!-- STATIC:GOAL:END -->

<!-- STATIC:TECH_STACK:START -->
## Tech Stack  
- Languages: TypeScript 5.6.3 | Node.js 18+
- Framework: Next.js 15.0.3 (App Router)
- Database: PostgreSQL with Prisma ORM 5.20.0
- Styling: Tailwind CSS 3.4.14
- JS/TS Tooling: npm | eslint (Next.js config) | TypeScript strict mode | tsc
- External APIs: TMDB API (The Movie Database) | CinemaOS (video player)
- Build/CI: Next.js build | Prisma migrations | (GitHub Actions - not configured)
- Runtime: Next.js Server Actions | React Server Components
<!-- STATIC:TECH_STACK:END -->

<!-- STATIC:PATTERNS:START -->
## Patterns  
- Next.js App Router architecture; camelCase for .ts/.tsx
- Server Actions for mutations; Server Components for data fetching
- Component-based React; reusable UI components in `components/`
- Prisma Client for database access; migrations for schema changes
- Tailwind CSS for styling; custom cinema theme colors
- Strict TypeScript: no any; strict mode enabled; path aliases (@/*)
- Secrets via env only (DATABASE_URL, TMDB_API_KEY); never log secrets
- TMDB API integration via lib/tmdb.ts; CinemaOS iframe embedding
<!-- STATIC:PATTERNS:END -->

<!-- STATIC:CONSTRAINTS:START -->
## Constraints  
Lint zero errors (ESLint Next.js config); typecheck zero errors (TypeScript strict)
Tests: Not yet configured (vitest/jest recommended for future)
No global installs; only repo-defined scripts/tools
No breaking API changes unless version bump planned
No file moves across module boundaries without explicit instruction
Prisma migrations required for schema changes; always run prisma:generate after schema updates
<!-- STATIC:CONSTRAINTS:END -->

<!-- STATIC:TOKENIZATION:START -->
## Tokenization  
3.5ch/token; 8K cap; summarize workflow_state.md>12K
<!-- STATIC:TOKENIZATION:END -->

<!-- STATIC:MODEL_CONFIG:START -->
## Model Config
Type: [feature|bugfix|refactor|test|chore]
Architecture: [frontend|backend|fullstack] (Next.js App Router)
Input: [files|entrypoints|interfaces|contracts|tmdb_api]
Output: [changed_files|diff|artifacts|scripts|prisma_migrations]
Baseline: [lint_pass|typecheck_pass|build_pass|prisma_generate]
<!-- STATIC:MODEL_CONFIG:END -->

<!-- STATIC:DATA_CONFIG:START -->
## Data Config  
Source: [repo_files|env|tmdb_api|prisma_db|cinemaos]
Size: [files_changed] files, [loc_estimate] LOC
Split: tests [unit|integration|e2e] (not yet configured)
Features: [typescript|nextjs|react|prisma|tailwind|tmdb|cinemaos]
<!-- STATIC:DATA_CONFIG:END -->

<!-- DYNAMIC:CHANGELOG:START -->
## Changelog
<!-- AI populates project changes -->
<!-- DYNAMIC:CHANGELOG:END -->
