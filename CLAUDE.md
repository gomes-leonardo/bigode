# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bigode is a WhatsApp bot for barbershop scheduling. Built with Clean Architecture principles using Fastify, Prisma ORM, and PostgreSQL.

## Commands

```bash
# Development (starts Docker, waits for DB, runs migrations)
npm run dev

# Run all tests (manages Docker lifecycle automatically)
npm test

# Run tests in watch mode (requires services running)
npm run test:watch

# Run single test file
npx vitest run src/infra/http/controllers/health.spec.ts

# CI mode (assumes DB is already running)
npm run test:ci

# Docker services
npm run services:up      # Start PostgreSQL
npm run services:stop    # Stop PostgreSQL
npm run services:down    # Remove containers

# Prisma
npx prisma migrate dev   # Create/apply migrations in dev
npx prisma generate      # Generate client
```

## Architecture

```
src/
├── app.ts                    # Fastify app setup and routes
├── server.ts                 # Server entry point
├── domain/                   # Business logic (Clean Architecture)
│   └── scheduling/
│       ├── application/      # Use cases and repository interfaces
│       └── enterprise/       # Domain entities
├── infra/                    # Infrastructure layer
│   ├── http/
│   │   ├── controllers/      # Request handlers (thin, no business logic)
│   │   ├── routes/           # Route definitions
│   │   ├── presenters/       # Response formatting
│   │   └── middlewares/
│   ├── database/
│   │   └── prisma/
│   │       ├── client.ts     # Prisma singleton
│   │       ├── repositories/ # Repository implementations
│   │       └── mappers/      # Entity/DTO transformations
│   └── env/                  # Environment validation (Zod)
├── core/                     # Shared types and logic
└── lib/                      # Utility functions

test/
└── orchestrators/            # Test utilities
    ├── clear-database.ts     # Truncate all tables
    └── run-migrations.ts     # Apply pending migrations
```

## Key Patterns

- **Repository Pattern**: Interfaces in `domain/*/application/repositories/`, implementations in `infra/database/prisma/repositories/`
- **Operational endpoints** (like `/health`): Skip use cases, repository directly in controller
- **Prisma singleton**: Use `src/infra/database/prisma/client.ts`
- **Integration tests**: Use Supertest with `app.server`, manage lifecycle with `beforeAll`/`afterAll`

## Test Orchestrators

```typescript
import { clearDatabase } from "../../test/orchestrators/index.js";
import { runMigrations, resetDatabase } from "../../test/orchestrators/index.js";

await clearDatabase();  // Truncate all tables except _prisma_migrations
runMigrations();        // Apply pending migrations
resetDatabase();        // Reset and re-apply all migrations
```

## Environment

- PostgreSQL runs in Docker on port 5432
- Environment variables in `.env` (production) and `.env.development` (local)
- `DATABASE_URL` required for Prisma
