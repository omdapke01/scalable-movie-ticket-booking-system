# Implementation Plan - Phase 2: Distributed Memory Locks & Real-Time UX Integration

This phase integrates temporary memory-locking layers using Redis, pessimistic row-locking inside PostgreSQL transactions, and a WebSocket gateway to stream seat status updates in real-time.

## Confirmed Stack & Libraries
- **Redis Client**: `ioredis` for secure TLS connection to Upstash Redis.
- **Pessimistic Locking**: PostgreSQL transaction context using Prisma `$queryRaw` running explicit `SELECT ... FOR UPDATE` statements.
- **Real-Time Gateway**: Socket.io configured under NestJS `@nestjs/websockets` and `@nestjs/platform-socket.io`.

## Proposed Changes

### 1. Redis Configuration

#### [NEW] [redis.service.ts](file:///d:/Projects/BookMyShow-Clone/src/redis/redis.service.ts)
A NestJS service that initializes the `ioredis` client using the `REDIS_URL` connection string and exposes helper methods to:
- Acquire lock (`SET key val NX PX 300000` - 5 min TTL)
- Release lock (using an atomic Lua script to ensure a worker only deletes its own lock)

#### [NEW] [redis.module.ts](file:///d:/Projects/BookMyShow-Clone/src/redis/redis.module.ts)
A global module exporting `RedisService`.

### 2. Transactional Reservation Engine (Booking Module)

#### [NEW] [booking.module.ts](file:///d:/Projects/BookMyShow-Clone/src/booking/booking.module.ts) / [booking.controller.ts](file:///d:/Projects/BookMyShow-Clone/src/booking/booking.controller.ts) / [booking.service.ts](file:///d:/Projects/BookMyShow-Clone/src/booking/booking.service.ts)
Endpoints for the seat booking lifecycle:
- `POST /bookings`: Create a temporary booking reservation.
  - Checks and acquires Redis memory locks for the requested seat codes.
  - Starts a PostgreSQL transaction.
  - Locks rows using `SELECT ... FOR UPDATE` via raw SQL queries.
  - Verifies seats are `AVAILABLE`, creates a `Booking` record with `RESERVED` status, and marks seats as `RESERVED`.
  - Sets up a decentralized low-latency timeout to expire the booking if payment is not confirmed within 5 minutes.
- `POST /bookings/:id/confirm`: Confirm the reservation (simulates payment success).
  - Starts a database transaction.
  - Locks and updates the booking status to `SUCCESS` and seat status to `BOOKED`.
  - Releases Redis locks.
- `POST /bookings/:id/cancel`: User cancels booking manually, reverting seats to `AVAILABLE` and releasing Redis locks.

### 3. Real-Time Seat Status Stream (WebSockets)

#### [NEW] [seats.gateway.ts](file:///d:/Projects/BookMyShow-Clone/src/show/seats.gateway.ts)
A WebSocket gateway using Socket.io:
- Clients emit a `joinShowRoom` event with a `showId` to subscribe to a show's real-time events.
- Whenever a seat status shifts (`AVAILABLE` <-> `RESERVED` -> `BOOKED`), the booking service will trigger a broadcast event to the specific show's room.

#### [MODIFY] [show.module.ts](file:///d:/Projects/BookMyShow-Clone/src/show/show.module.ts)
Register the new `SeatsGateway` as a provider and export it, or inject it directly.

---

## Verification Plan

### Automated Steps
- Install new dependencies: `npm install ioredis @nestjs/websockets @nestjs/platform-socket.io socket.io` and dev dependencies `@types/express`.
- Compile the code using `npm run build`.

### Manual/Scenario-Based Verification
- **Double Booking Test**: Trigger two simultaneous HTTP requests trying to reserve the exact same seat code on the same show and verify that one request fails fast on the Redis lock, while the other succeeds.
- **Expiry Test**: Create a reservation, wait 5 minutes, and verify that the database reverts seats to `AVAILABLE` and booking status becomes `EXPIRED`.
- **WebSocket Broadcast Test**: Connect to the WebSocket room for a show and trigger a booking request; verify that the connection receives the seat reservation broadcast in real-time.
