# 🎬 Scalable Movie Ticket Booking System

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License" />
</p>

> A production-grade, highly scalable distributed movie ticket booking platform inspired by **BookMyShow**. Designed to handle high-concurrency seat selection with zero double-booking through distributed locking, polyglot persistence, event-driven queues, and an Apple VisionOS-inspired glassmorphic UI interface.

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [System Hierarchy & Design Principles](#-system-hierarchy--design-principles)
- [Key Features](#-key-features)
- [Polyglot Database Architecture](#-polyglot-database-architecture)
- [Concurrency & Distributed Locking (Redis TTL)](#-concurrency--distributed-locking-redis-ttl)
- [System Workflows](#-system-workflows)
  - [1. Search & Catalog Query Flow](#1-search--catalog-query-flow)
  - [2. Seat Reservation & Payment Flow](#2-seat-reservation--payment-flow)
- [Tech Stack](#-tech-stack)
- [Repository & Project Structure](#-repository--project-structure)
- [API Documentation](#-api-documentation)
- [Getting Started & Setup](#-getting-started--setup)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Local Installation](#local-installation)
  - [Docker Setup](#docker-setup)
- [Load Testing & Metrics](#-load-testing--metrics)
- [Future Roadmap](#-future-roadmap)
- [License & Author](#-license--author)

---

## 🏗️ Overview & Architecture

The **Scalable Movie Ticket Booking System** models a modern distributed ticketing platform capable of scaling to millions of concurrent user sessions. Traditional monolithic ticketing systems crash during high-demand premiere ticket sales due to race conditions and database lock contention. 

This platform tackles concurrency using an **Event-Driven, Distributed Locking, and Polyglot Persistence Architecture**:

```text
                               ┌──────────────────────────────────┐
                               │           Client Layer           │
                               │  (Vite + React 19 + VisionOS UI) │
                               └────────────────┬─────────────────┘
                                                │
                                                ▼
                               ┌──────────────────────────────────┐
                               │       API Gateway / NestJS       │
                               │   (Authentication & Rate Limiting│
                               └────────┬─────────────────┬───────┘
                                        │                 │
                ┌───────────────────────┘                 └───────────────────────┐
                ▼                                                                 ▼
 ┌─────────────────────────────┐                                   ┌─────────────────────────────┐
 │       Read-Model (NoSQL)    │                                   │      Write-Model (ACID SQL) │
 │       MongoDB / Atlas       │                                   │      PostgreSQL (Neon)      │
 ├─────────────────────────────┤                                   ├─────────────────────────────┤
 │ • Movies & Genres           │                                   │ • Users & User Sessions     │
 │ • Venues & Cities           │                                   │ • Ledger Bookings           │
 │ • Showtimes & Screens       │                                   │ • ShowSeat Status Ledger    │
 └─────────────────────────────┘                                   └──────────────┬──────────────┘
                                                                                  │
                                                                                  ▼
                                                                   ┌─────────────────────────────┐
                                                                   │     Distributed Locking     │
                                                                   │      Upstash Redis Cache    │
                                                                   ├─────────────────────────────┤
                                                                   │ • 5-min TTL Seat Locks      │
                                                                   │ • Atomic SET NX PX Locks    │
                                                                   │ • Real-time WebSockets      │
                                                                   └─────────────────────────────┘
```

---

## 🏛️ System Hierarchy & Design Principles

A common mistake in simple CRUD applications is modeling seats directly under a `Movie` model. In real-world platforms, a **Movie does NOT own Seats**—a **Show owns Seats**.

This project enforces strict domain normalization:

```text
Movie
 └── City (Mumbai, Bangalore, Delhi, Pune)
      └── Venue (Theater: PVR, INOX, Cinepolis)
           └── Screen (Audi 01, IMAX 3D, Dolby Atmos)
                └── Show (Specific Start Time & Date)
                     └── ShowSeat (Row A-K, Column 1-12, Status: AVAILABLE | RESERVED | BOOKED)
```

### Core Design Guarantees:
1. **Isolation of Catalog and Transactions**: Read-heavy operations (browsing movies, city filters, theater schedules) hit MongoDB Atlas or local memory fallbacks, preventing database pressure on the relational transactional ledger.
2. **Zero Double-Booking Guarantee**: Concurrency control uses a two-tier locking strategy: atomic Redis key-value locks (`SET lock:show:id:seat:code val NX PX 300000`) backed by PostgreSQL row locking (`SELECT FOR UPDATE`).

---

## ✨ Key Features

### 🌌 VisionOS & Cinematic Glassmorphic Frontend
- **Design Aesthetic**: Inspired by **Apple VisionOS + Netflix + Linear.app**, featuring dark modes (`#09090B`), subtle neon gradients (`#8B5CF6`), frosted glass cards (`backdrop-blur-md`), and micro-animations.
- **Cinematic Banner Carousel**: Autoplay hero carousel showcasing top movies with sliding transitions, genre pills, and backdrop vignetting.
- **Dynamic City Dropdown**: Live city selector (Mumbai, Bangalore, Delhi, Pune) that filters theater screenings, available showtimes, and movie grids in real time.

### 🛋️ Real-Time Interactive Seat Grid & Tiering
- **Dynamic Theater & Showtime Mapping**: Automatically queries 16 theater venues and 320 scheduled shows across cities.
- **VIP & Standard Tiers**: Tiered seat pricing with distinct visual styling for Standard vs VIP rows (Last 2 rows).
- **Live Seat Locking**: Instantly grays out booked or temporarily reserved seats (`BOOKED` / `RESERVED`), rendering them non-clickable across concurrent sessions.

### 🎟️ 3D Folding Ticket Envelope & Wallet
- **Interactive Ticket Vault**: 3D barcode ticket that folds out of a glassy envelope upon checkout confirmation.
- **Dynamic Parameter Hydration**: Hydrates movie poster, title, hall, date, time, and seat numbers based on the user's booking parameters.

### 🔒 Enterprise Distributed Locking & Resiliency
- **5-Minute Temporary Reservation Locks**: Redis locks auto-expire after 300,000 ms (5 mins). If a user abandons payment, seats auto-revert to `AVAILABLE` state without locking up resources.
- **Graceful DB Fallbacks**: If MongoDB or Elasticsearch nodes are missing, services start up gracefully in in-memory catalog fallback mode without crashing.

---

## 🗄️ Polyglot Database Architecture

| Database Layer | Technology | Primary Purpose | Model Strategy |
| :--- | :--- | :--- | :--- |
| **Write Model (Transactional)** | **PostgreSQL (Prisma ORM)** | Bookings, Seat Statuses, Users, Sessions | **Normalized (ACID)** |
| **Read Model (Catalog)** | **MongoDB (Mongoose)** | Movies, Venues, City Schedules, Screens | **Denormalized (No Joins)** |
| **Distributed Cache & Lock** | **Redis (Upstash)** | Distributed Locks, TTL Expiration, Waiting Room | **KeyValue / Atomic** |

### PostgreSQL Schema (`prisma/schema.prisma`)
```prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String
  name      String
  bookings  Booking[]
  sessions  Session[]
  createdAt DateTime  @default(now())
}

enum SeatStatus {
  AVAILABLE
  RESERVED   // Temporary 5-minute lock
  BOOKED     // Permanent ledger entry
}

model ShowSeat {
  id        String     @id @default(uuid())
  showId    String     // Foreign key reference to MongoDB Show ID
  seatCode  String     // e.g. "A10", "F05"
  status    SeatStatus @default(AVAILABLE)
  version   Int        @default(0) // Optimistic Concurrency Control
  bookingId String?
  booking   Booking?   @relation(fields: [bookingId], references: [id])

  @@unique([showId, seatCode])
  @@index([showId, status])
}

enum BookingStatus {
  INITIATED
  RESERVED
  SUCCESS
  FAILED
  EXPIRED
}

model Booking {
  id             String        @id @default(uuid())
  userId         String
  user           User          @relation(fields: [userId], references: [id])
  showId         String
  status         BookingStatus @default(INITIATED)
  reservedSeats  ShowSeat[]
  totalAmount    Decimal       @db.Decimal(10, 2)
  idempotencyKey String?       @unique
  createdAt      DateTime      @default(now())
}
```

---

## 🔒 Concurrency & Distributed Locking (Redis TTL)

To prevent race conditions when two users click "Book Now" on the exact same seat at the exact same millisecond:

```
[User A & User B click Seat A10 simultaneously]
                       │
                       ▼
         [NestJS Booking Service]
                       │
                       ▼
       ┌───────────────────────────────┐
       │   Redis Atomic Key Check      │
       │   SET lock:show:1:seat:A10    │
       │   NX PX 300000 (5 min TTL)    │
       └───────────────┬───────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
  [User A: SUCCESS]             [User B: REJECTED]
  • Lock Acquired               • Lock Failed (409 Conflict)
  • Postgres Row Lock           • Show "Seat Already Taken"
  • Status = RESERVED           • Rollback Transaction
```

---

## 🔄 System Workflows

### 1. Search & Catalog Query Flow

```text
User Selects City (Mumbai)
   │
   ▼
Get Movies / Screening Shows
   │
   ├───► Elasticsearch Index (if configured)
   │
   └───► CatalogService (MongoDB Read Store)
           │
           └───► Returns Denormalized Show Schedule (Venues, Timings, Movies)
```

### 2. Seat Reservation & Payment Flow

```text
Select Seats (e.g. H8, H9)
   │
   ▼
POST /bookings
   │
   ├───► 1. Acquire Redis Lock (5-min TTL)
   │
   ├───► 2. Execute Postgres SQL Transaction (SELECT FOR UPDATE)
   │
   ├───► 3. Create Booking Record (Status: RESERVED)
   │
   └───► 4. Schedule 5-minute Auto-Expiration Job
           │
           ├───► [Payment Confirmed within 5 mins]
           │       └──► POST /bookings/:id/confirm
           │               ├──► Update Booking Status = SUCCESS
           │               ├──► Set Seats Status = BOOKED
           │               └──► Dispatch Ticket Notification Queue
           │
           └───► [Payment Expired / Abandoned]
                   └──► Auto-Worker reclaims locks:
                           ├──► Revert Seat Status = AVAILABLE
                           └──► Release Redis Key Lock
```

---

## 🛠️ Tech Stack

### Backend & Core Infrastructure
- **Framework**: [NestJS](https://nestjs.com/) (Node.js / TypeScript)
- **Database (ACID Write-Model)**: PostgreSQL managed on [Neon.tech](https://neon.tech/)
- **Database (Catalog Read-Model)**: MongoDB Atlas via Mongoose
- **ORM**: [Prisma ORM](https://www.prisma.io/) (PostgreSQL) + Mongoose (MongoDB)
- **Distributed Cache & Locks**: Upstash Redis (Redis Cluster)
- **Event Queues**: BullMQ / Redis Queue
- **Metrics & Monitoring**: Prometheus + `@willsoto/nestjs-prometheus`

### Frontend & UI
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router) (File-based type-safe routing)
- **Styling**: Tailwind CSS + Custom Glassmorphism CSS design system
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Toast Notifications**: Sonner

### DevOps & Testing
- **Containerization**: Docker & Docker Compose
- **Load Testing**: k6 load testing scripts (`k6-load-test.js`)

---

## 📁 Repository & Project Structure

```text
scalable-movie-ticket-booking-system/
├── cinema-vision-flow/               # Vite + React 19 Frontend App
│   ├── src/
│   │   ├── assets/                   # Movie posters, cast photos, backdrops
│   │   ├── components/
│   │   │   ├── glass/                # GlassNavbar, AuroraBackground, NeonButton
│   │   │   ├── movie/                # MovieHero, MovieTabs
│   │   │   └── seats/                # SeatGrid, SeatLegend, BookingBar
│   │   ├── lib/
│   │   │   ├── api.ts                # Client API wrappers (Auth, Bookings, Shows)
│   │   │   └── mock-data.ts          # Catalog fallback definitions & tiers
│   │   └── routes/                   # TanStack Router File Routes
│   │       ├── index.tsx             # Landing Page (Carousel & City Grid)
│   │       ├── seats.tsx             # Dynamic Seat Selection Page
│   │       ├── checkout.tsx          # Secure Checkout & Payment
│   │       ├── booking-success.tsx   # 3D Ticket Envelope Confirmation
│   │       ├── profile.tsx           # User Dashboard & Booking History
│   │       └── auth.tsx              # Login / Register / Google OAuth
│   └── package.json
│
├── src/                              # NestJS Backend Microservice
│   ├── auth/                         # Authentication (JWT, Google SSO, Guards)
│   ├── booking/                      # Core Ticket Booking Engine & Processors
│   ├── catalog/                      # MongoDB Catalog Schemas & Auto-Seeder
│   ├── metrics/                      # Prometheus Metrics Collectors
│   ├── movie/                        # Movie Catalog Controller & Service
│   ├── payment/                      # Mock Payment Gateway & Callbacks
│   ├── prisma/                       # PostgreSQL Prisma Client Integration
│   ├── redis/                        # Distributed Locking & Redis Service
│   ├── search/                       # Autocomplete & Elasticsearch Listeners
│   ├── show/                         # Showtimes Controller & WebSockets Gateway
│   ├── venue/                        # Venue & Theater Management
│   ├── app.module.ts                 # Root Application Module
│   └── main.ts                       # Application Entry Point
│
├── prisma/
│   ├── schema.prisma                 # Transactional Relational Schema
│   └── migrations/                   # SQL Schema Migration Tracking
├── docker-compose.yml                # Multi-container orchestration (App, Redis, Postgres)
├── Dockerfile                        # NestJS containerization dockerfile
├── k6-load-test.js                   # Stress & Concurrency load test script
├── .env.example                      # Environment variables template
└── README.md                         # Project Developer Documentation
```

---

## 📡 API Documentation

### Key REST Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user account | Public |
| `POST` | `/auth/login` | Login and receive JWT Access Token | Public |
| `POST` | `/auth/google` | Google SSO Sign-in OAuth Handler | Public |
| `GET` | `/shows` | Get shows by `movieId`, `venueId`, `date`, or `city` | Public |
| `GET` | `/shows/:id/seats` | Fetch dynamic seat layout & statuses for a show | Public |
| `POST` | `/bookings` | Create a temporary seat lock reservation | Authenticated |
| `POST` | `/bookings/:id/confirm` | Confirm payment and finalize seat booking | Authenticated |
| `GET` | `/bookings` | Fetch user's active and historical bookings | Authenticated |

#### Example: Create Reservation Request (`POST /bookings`)
```json
{
  "showId": "show-1",
  "seatCodes": ["H8", "H9"]
}
```

#### Response (`201 Created`)
```json
{
  "id": "b7d8c4e1-9f20-4a81-b55d-[#8B5CF6]",
  "userId": "user-uuid",
  "showId": "show-1",
  "status": "RESERVED",
  "totalAmount": 500,
  "reservedSeats": [
    { "seatCode": "H8", "status": "RESERVED" },
    { "seatCode": "H9", "status": "RESERVED" }
  ],
  "expiresAt": "2026-07-21T17:05:00.000Z"
}
```

---

## 🚀 Getting Started & Setup

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: PostgreSQL 14+ (or Neon.tech connection URL)
- **Redis**: Redis 6+ (or Upstash Redis URL)
- **MongoDB**: MongoDB 6+ (or MongoDB Atlas connection string)

### Environment Configuration

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your database and service connection parameters:

```env
DATABASE_URL="postgresql://neondb_owner:password@host.aws.neon.tech/neondb?sslmode=require"
REDIS_URL="rediss://default:token@your-redis-host.upstash.io:6379"
MONGODB_URL="mongodb+srv://user:password@cluster.mongodb.net/"
JWT_SECRET="your-super-secret-jwt-key"
```

### Local Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/omdapke01/scalable-movie-ticket-booking-system.git
   cd scalable-movie-ticket-booking-system
   ```

2. **Install Backend Dependencies**:
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd cinema-vision-flow
   npm install
   cd ..
   ```

4. **Sync PostgreSQL Schema (Prisma)**:
   ```bash
   npx prisma db push
   ```

5. **Start the Backend Server**:
   ```bash
   npm run start:dev
   ```
   *The server will start on `http://localhost:3000` and auto-seed MongoDB Atlas with 16 theaters and 320 showtimes across 4 cities.*

6. **Start the Frontend Application**:
   ```bash
   cd cinema-vision-flow
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser to launch the VisionOS Glass UI.*

---

### Docker Setup

Alternatively, launch the complete infrastructure using Docker Compose:

```bash
docker-compose up --build
```

---

## ⚡ Load Testing & Metrics

A load testing script (`k6-load-test.js`) is provided to simulate high-concurrency seat reservation stress:

```bash
k6 run k6-load-test.js
```

### Prometheus Metrics
Prometheus metrics are exposed at `http://localhost:3000/metrics`, tracking:
- `booking_requests_total{status="success|conflict|db_failed"}`
- `http_request_duration_seconds`
- `active_redis_locks`

---

## 🛣️ Future Roadmap

- [ ] **Apache Kafka Event Bus**: Migrate asynchronously dispatched notifications and analytics metrics to Kafka topics.
- [ ] **Elasticsearch Production Cluster**: Full-text fuzzy movie search with autocomplete and geo-spatial theater sorting.
- [ ] **Kubernetes Manifests & Helm Charts**: Automated cloud scaling for high-traffic premiere releases.
- [ ] **Stripe / Razorpay Payment Webhooks**: Real payment gateway integration.

---

## 📄 License & Author

Distributed under the **MIT License**. See `LICENSE` for details.

Developed with ❤️ by **[Om Dapke](https://github.com/omdapke01)**.
