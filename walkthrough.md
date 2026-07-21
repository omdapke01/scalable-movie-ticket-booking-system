# Walkthrough - Phase 1: Foundation Services, Database Modeling & Modular APIs

We have successfully built and compiled Phase 1 of the BookMyShow clone backend. The application implements the database schema, seeding, modular NestJS API structure, and secure JWT authentication.

## 🛠️ Components Completed

### 1. Database & Seeding (Steps 1-4)
- **Database Schema**: Created [schema.prisma](file:///d:/Projects/BookMyShow-Clone/prisma/schema.prisma) mapping models (`User`, `Session`, `Movie`, `Venue`, `Show`, `ShowSeat`, `Booking`).
  - Added unique composite constraints to prevent double booking.
  - Implemented `version` column for optimistic concurrency control.
- **Prisma 7 Integration**: Configured connection pooling and ESM runtime compatibility using `@prisma/adapter-pg` and `pg`.
- **Database Seeding**: Populated initial mock data (2 users, 2 movies, 2 venues, 2 shows, and 100 available show seats).

### 2. Global Core Layers (Step 6)
- **PrismaService**: Extends the `PrismaClient` and links to the NestJS module lifecycle hooks (`OnModuleInit`/`OnModuleDestroy`) for clean resource management.
- **PrismaModule**: Configured with the `@Global()` decorator to expose the database connection pool across all future microservices/modules without redundant imports.

### 3. Dual-Token Authentication & Sessions (Step 7)
- **AuthModule / Controller / Service**:
  - `POST /auth/register`: Hashes passwords using `bcrypt` (10 rounds) and saves new users.
  - `POST /auth/login`: Verifies user credentials, spins up a new device tracking `Session` row in the database, and issues:
    1. A short-lived (15 min) JWT Access Token in the response body.
    2. A long-lived (7 day) signed JWT Refresh Token stored inside a secure, `HTTP-Only`, `Lax` cookie.
  - `POST /auth/refresh`: Implements **Refresh Token Rotation**. When refreshed, the old session is marked `isRevoked: true` and a new token pair and session are issued, protecting against replay attacks.
  - `POST /auth/logout`: Revokes active session tokens and clears the client cookies.
- **Passport JWT Security**: Built a custom `JwtStrategy` and `JwtAuthGuard` to validate Bearer tokens on protected endpoints.

### 4. Inventory & Discovery APIs (Step 8)
- **MovieModule**: Exposes `GET /movies` listing the movie catalog.
- **VenueModule**: Exposes `GET /venues` (filterable by city: `GET /venues?city=Delhi`).
- **ShowModule**:
  - `GET /shows`: Lists scheduled shows filterable by `movieId`, `venueId`, and date.
  - `GET /shows/:id/seats`: Fetches the real-time seat status map (rows A-E, seats 1-10) showing `AVAILABLE`, `RESERVED`, or `BOOKED` statuses.

### 5. CORS & Middleware (Step 9)
- Enabled `cookie-parser` globally inside [main.ts](file:///d:/Projects/BookMyShow-Clone/src/main.ts).
- Enabled CORS with credentials (`credentials: true`, `origin: true`) to support cookie transmission across frontend domains.

---

## 🧪 Verification Results

### Build Verification
Ran the TypeScript build pipeline to ensure type-safety and decorator metadata compile correctly:
```bash
> bookmyshow-backend@0.0.1 build
> nest build
```
**Result**: Build succeeded without errors, outputting a clean JavaScript production bundle.
