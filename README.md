# Resound

Portfolio demo of a full-stack marketplace for classical instrument rentals, built with Next.js, TypeScript, MongoDB, Stripe, Socket.io, Uploadthing, and Tailwind CSS.

> **Demo mode:** Resound is a portfolio demonstration. Bookings and payments are for testing only; no real instrument rentals are arranged. Use Stripe test cards only.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.3-blue)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-4.12.0-2D3748)](https://www.prisma.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248)](https://www.mongodb.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF)](https://stripe.com)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#license)

[Demo site](https://resound-nu.vercel.app/) | [Setup](#getting-started) | [Architecture](#architecture)

## Overview

Resound is an Airbnb-style rental marketplace for musicians who need access to high-quality classical instruments. Renters can search by instrument family, location, skill level, availability, and condition. Owners can publish listings, manage reservation logistics, upload instrument photos, and communicate with renters in real time.

The demo showcases full-stack marketplace workflows: authentication, test payment-backed reservations, image upload authorization, real-time messaging, geocoded search, admin tooling, rate limiting, and automated tests.

## Project Highlights

- Marketplace workflows covering listings, favorites, reservations, payments, owner tools, renter tools, and admin moderation.
- Secure checkout flow with Stripe Checkout, webhook verification, pending reservation holds, and expiration cleanup.
- Real-time messaging with Socket.io on a custom Next.js server.
- Mobile QR-code upload flow using scoped, expiring upload tokens and Uploadthing V7.
- Location-aware search with Google geocoding, normalized city/state/ZIP data, and radius filtering.
- Role-aware authorization for renters, listing owners, and admins.
- Test coverage across API routes, components, and critical data access paths.

## Core Features

### Renting

- Search by instrument category, instrument type, location, radius, condition, dates, and experience level.
- View detailed listings with image galleries, pricing, owner context, availability, and pickup/return windows.
- Save favorites, try demo reservations and Stripe test checkout, and explore rental status tracking.
- Message listing owners after authorized booking flows.

### Listing Management

- Create and edit instrument listings with category-specific metadata.
- Manage pricing, availability days, pickup windows, return windows, and listing images.
- Generate QR-code upload links so owners can add photos from a phone.
- Track reservations and renter communication from owner dashboards.

### Platform Operations

- Admin dashboard for user management, listing moderation, platform stats, and image operations.
- Cron endpoints for reservation expiration and upload-token cleanup.
- In-memory rate limiting for sensitive endpoints such as registration, checkout, geocoding, favorites, and general API traffic.

## Tech Stack

| Area | Tools |
| --- | --- |
| App framework | Next.js 15 App Router, React 18, TypeScript |
| UI | Tailwind CSS, Framer Motion, React Icons, React Hook Form |
| Data | MongoDB, Prisma ORM |
| Auth | NextAuth.js, Prisma Adapter, Google OAuth, credentials auth |
| Payments | Stripe Checkout, Stripe webhooks |
| Realtime | Socket.io, custom Next.js server |
| Media | Uploadthing V7, Sharp, Plaiceholder |
| Location | Google Places, Google Geocoding, Leaflet, React-Leaflet |
| State | Zustand, React hooks, Server Components |
| Testing | Jest, Testing Library, API and database test suites |
| Deployment | Vercel for the app, Railway-compatible custom server/WebSocket deployment |

## Architecture

- `app/` contains App Router pages, layouts, server actions, and API route handlers.
- `components/` contains reusable UI and feature components.
- `hook/` contains client hooks for favorites, messages, modals, socket state, and listing workflows.
- `lib/` contains shared infrastructure such as Prisma, rate limiting, socket helpers, and auth utilities.
- `prisma/` contains the MongoDB Prisma schema and seed script.
- `server.js` runs the custom Next.js server with Socket.io support.
- `scripts/` contains operational scripts for geocoding, data maintenance, image migration, admin setup, and diagnostics.
- `__tests__/` contains Jest suites for components, APIs, database behavior, and user flows.

## Repository Topics

`nextjs` `react` `typescript` `mongodb` `prisma` `stripe` `socket-io` `tailwindcss` `nextauth` `uploadthing` `marketplace` `websockets` `payments` `realtime` `image-upload` `full-stack` `classical-music` `jest` `testing-library`

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB database
- Stripe account for checkout and webhook testing
- Uploadthing V7 token for image uploads
- Google OAuth credentials for social login
- Optional Google Places/Geocoding API keys for location search

### Install

```bash
npm install
cp .env.example .env.local
npx prisma generate
```

Fill in the required values in `.env.local`, especially `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `UPLOADTHING_TOKEN`, and Stripe keys.

### Run Locally

```bash
npm run dev
```

The custom server starts the app at `http://localhost:3000`.

### Common Commands

```bash
npm run lint
npm test
npm run build
npm run seed
npm run db:reset
```

## Environment Variables

The main required variables are documented in `.env.example`.

- `NEXT_PUBLIC_DEMO_MODE` defaults to `true`. Demo mode displays a persistent notice and rejects live Stripe secret keys. Keep it enabled for the portfolio demo; changing it requires a rebuild to keep server and browser behavior in sync.
- `DATABASE_URL` for MongoDB.
- `NEXTAUTH_SECRET` and `NEXTAUTH_URL` for authentication.
- `NEXT_PUBLIC_APP_URL` for absolute URLs, QR-code upload links, and checkout redirects.
- `UPLOADTHING_TOKEN` for Uploadthing V7.
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` for payments.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_PLACES_API_KEY`, and `GOOGLE_GEOCODING_API_KEY` for OAuth and location services.

## Testing

```bash
npm test
npm test -- --coverage
npm run test:api
npm run test:db
npm run test:e2e
```

The suite uses Jest and Testing Library with mocks for external services where appropriate.

## Deployment Notes

- The app uses a custom server (`server.js`) so Socket.io can run alongside Next.js routes.
- `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` must match the deployed domain for auth redirects, Stripe redirects, and mobile upload QR codes.
- Uploadthing V7 requires `UPLOADTHING_TOKEN`; legacy Uploadthing secrets are not used.
- WebSocket hosting is Railway-compatible for environments that do not support persistent WebSocket connections.

## Status

Portfolio demo with core marketplace workflows and integrations for Stripe test payments, images, authentication, messaging, and location services. Demo mode is enabled by default; the app is not offered as an operational rental service.

## License

Proprietary. All rights reserved.
