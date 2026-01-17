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
npx vitest run src/infra/http/controllers/health/health.spec.ts

# CI mode (assumes DB is already running)
npm run test:ci

# Docker services
npm run services:up      # Start PostgreSQL
npm run services:stop    # Stop PostgreSQL
npm run services:down    # Remove containers

# Prisma
npx prisma migrate dev   # Create/apply migrations in dev
npx prisma generate      # Generate client

# Linting
npm run lint:prettier:check   # Check formatting
npm run lint:prettier:fix     # Fix formatting
npm run lint:eslint:check     # Check linting
npm run lint:eslint:fix       # Fix linting
```

## Architecture

```
src/
├── app.ts                    # Fastify app setup, JWT registration, error handler
├── server.ts                 # Server entry point
├── domain/                   # Business logic (Clean Architecture)
│   └── scheduling/
│       ├── application/      # Use cases and repository interfaces
│       │   ├── repositories/ # Interface definitions (IAppointmentRepository.ts)
│       │   └── use-cases/    # Business logic (CreateAppointment, GetAvailability)
│       └── enterprise/       # Domain entities
├── infra/                    # Infrastructure layer
│   ├── http/
│   │   ├── controllers/      # Organized by feature: auth/, health/, scheduling/
│   │   ├── routes/           # Route definitions (routes.ts registers all)
│   │   └── middlewares/      # error-handler.ts
│   ├── database/
│   │   └── prisma/
│   │       ├── client.ts     # Prisma singleton
│   │       ├── repositories/ # Repository implementations
│   │       └── test-utils.ts # clearDatabase() for tests
│   └── env/                  # Environment validation (Zod schema)
└── @types/                   # TypeScript type extensions
```

## Key Patterns

- **Repository Pattern**: Interfaces in `domain/*/application/repositories/`, implementations in `infra/database/prisma/repositories/`
- **Controller organization**: Feature folders with controller + spec file (e.g., `controllers/scheduling/createAppointment/`)
- **Use case instantiation**: Controllers instantiate use cases with repository dependencies at module level
- **Request validation**: Zod schemas defined inline in controllers
- **JWT authentication**: Registered on Fastify app, verify with `await req.jwtVerify()` in controllers
- **Error handling**: Domain-specific errors (e.g., `SlotOccupiedError`) caught in controllers, others bubble to global error handler
- **Operational endpoints** (like `/health`): Skip use cases, query directly in controller
- **Prisma singleton**: Always import from `src/infra/database/prisma/client.ts`

## Integration Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../../../app.js";
import { clearDatabase } from "../../../database/prisma/test-utils.js";

describe("Feature (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
    await clearDatabase();
  });

  it("should do something", async () => {
    const response = await request(app.server).get("/endpoint").send();
    expect(response.statusCode).toEqual(200);
  });
});
```

## Environment

- PostgreSQL runs in Docker via `src/infra/compose.yaml`
- Required: `DATABASE_URL`, `JWT_SECRET` (defaults exist for dev)
- `NODE_ENV`: `dev` | `test` | `production`

## Domain Model

Core entities: `Barbershop` → `Barber`, `Service`, `Customer` → `Appointment`, `QueueItem`, `LoyaltyCard`, `Reminder`
