# BanquetBook - Banquet Hall Booking SaaS Platform

A full-stack SaaS platform for discovering, booking, and managing banquet halls. Built with Spring Boot, React, and PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Java 17, Spring Security, Spring Data JPA |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens), BCrypt |
| Payments | Stripe (Payment Intents, Refunds) |
| Build | Maven (backend), npm (frontend) |

## Features (Phase 1)

- **Authentication**: JWT-based login with password and simulated OTP
- **Role-Based Access**: Customer, Owner, Manager, Assistant, Admin roles
- **Hall Registration**: Multi-step registration with document upload and admin approval workflow
- **Venue Management**: CRUD with capacity, pricing, and availability
- **Booking System**: Search, book, pay with double-booking prevention
- **Payments**: Stripe integration for full and installment payments with refunds
- **Search**: Filter by city, date, capacity, budget with sorting and pagination

## Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)
- Maven 3.8+ (or use the Maven wrapper)

## Quick Start

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432 and pgAdmin on port 5050.

- **Database**: `banquet_db`
- **User**: `banquet` / `banquet123`
- **pgAdmin**: http://localhost:5050 (admin@banquet.com / admin123)

### 2. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on http://localhost:8080. Flyway automatically creates the database schema and seeds an admin user.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on http://localhost:5173 with API proxy to the backend.

## Default Accounts

| Role | Phone | Password |
|------|-------|----------|
| Admin | 0000000000 | admin123 |

Register new accounts as Customer or Owner through the UI.

**Simulated OTP**: Use `123456` as the OTP code for phone-based login.

## Project Structure

```
ban/
├── backend/                    Spring Boot API
│   ├── src/main/java/com/banquet/
│   │   ├── config/             Security, CORS, Stripe, Encryption configs
│   │   ├── controller/         REST API controllers (7)
│   │   ├── dto/                Request/Response DTOs (16)
│   │   ├── entity/             JPA entities (8)
│   │   ├── enums/              Status and role enums (5)
│   │   ├── exception/          Global exception handler
│   │   ├── repository/         Spring Data JPA repositories (8)
│   │   ├── security/           JWT provider, auth filter, user details
│   │   └── service/            Business logic services (7)
│   └── src/main/resources/
│       ├── application.yml     Configuration
│       └── db/migration/       Flyway SQL migrations
├── frontend/                   React SPA
│   └── src/
│       ├── api/                Axios HTTP client and API modules
│       ├── components/         Shared UI components
│       ├── context/            Auth context provider
│       ├── pages/              Page components by role
│       │   ├── auth/           Login, Register
│       │   ├── customer/       Home, Search, Hall Detail, Booking, My Bookings
│       │   ├── owner/          Dashboard, Hall Registration, Venues, Bookings, Staff
│       │   └── admin/          Dashboard, Hall Approvals
│       └── types/              TypeScript type definitions
├── docker-compose.yml          PostgreSQL + pgAdmin
└── README.md
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register (Customer/Owner)
- `POST /login` - Login (password or OTP)
- `POST /refresh` - Refresh JWT token
- `GET /me` - Current user profile

### Halls (`/api/halls`)
- `POST /` - Register hall (Owner)
- `PUT /{id}` - Update hall (Owner)
- `GET /{id}` - Hall details (Public)
- `GET /my` - Owner's halls
- `POST /{id}/documents` - Upload documents (Owner)
- `GET /admin/pending` - Pending halls (Admin)
- `PUT /admin/{id}/status` - Approve/Reject (Admin)

### Venues (`/api/halls/{hallId}/venues`)
- `POST /` - Create venue
- `PUT /{venueId}` - Update venue
- `GET /` - List venues
- `PUT /{venueId}/pricing` - Set pricing
- `GET /{venueId}/pricing` - Get pricing

### Bookings (`/api/bookings`)
- `POST /` - Create booking (Customer)
- `GET /my` - My bookings (Customer)
- `GET /hall/{hallId}` - Hall bookings (Owner/Manager)
- `PUT /{id}/cancel` - Cancel booking

### Payments (`/api/payments`)
- `POST /create-intent` - Create payment
- `POST /confirm` - Confirm payment
- `POST /{bookingId}/refund` - Process refund
- `GET /booking/{bookingId}` - Booking payments

### Search (`/api/search`)
- `GET /halls` - Search with filters (city, date, capacity, budget, sort)

## Configuration

Key settings in `backend/src/main/resources/application.yml`:

| Property | Description | Default |
|----------|-------------|---------|
| `app.jwt.secret` | JWT signing key (Base64) | Pre-configured |
| `app.jwt.access-token-expiration-ms` | Access token TTL | 900000 (15 min) |
| `app.jwt.refresh-token-expiration-ms` | Refresh token TTL | 604800000 (7 days) |
| `app.upload.dir` | File upload directory | ./uploads |
| `app.encryption.key` | AES-256 key for bank data | Pre-configured |
| `app.stripe.secret-key` | Stripe API secret key | sk_test_... |
| `app.cors.allowed-origins` | CORS allowed origins | http://localhost:5173 |

## Stripe Setup

1. Create a [Stripe account](https://stripe.com)
2. Get your test API keys from the Stripe Dashboard
3. Update `app.stripe.secret-key` in `application.yml`

For testing, Stripe provides test card numbers (e.g., `4242 4242 4242 4242`).

## Security Notes

- Passwords are hashed with BCrypt
- Bank account numbers are encrypted with AES-256
- JWT tokens are signed with HMAC-SHA256
- CSRF is disabled (stateless JWT auth)
- Role-based method-level authorization with `@PreAuthorize`
- Pessimistic locking prevents double-booking race conditions
