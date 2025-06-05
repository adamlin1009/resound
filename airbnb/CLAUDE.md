# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev            # Start development server on localhost:3000
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint

# Database
npm run seed           # Seed database with sample data
npm run db:reset       # Reset database and reseed
npx prisma generate    # Regenerate Prisma client
npx prisma db push     # Push schema changes to database
```

## Architecture Overview

This is a **Resound** - a classical instrument rental platform built as an Airbnb-style marketplace using Next.js 13+ with the App Router.

### Core Architecture

- **Frontend**: Next.js 13+ App Router with TypeScript and Tailwind CSS
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth and credentials
- **File Upload**: Cloudinary for image management
- **State Management**: Zustand for client-side state
- **UI Components**: Custom components with Tailwind, React Hook Form for forms

### Key Directory Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable UI components organized by feature
- `hook/` - Custom React hooks for modals and business logic
- `lib/` - Utility libraries (Prisma client)
- `prisma/` - Database schema and seed files
- `types.ts` - Global TypeScript type definitions

### Data Models (Prisma Schema)

**Key Models:**
- `User` - Users with authentication and favorites
- `Listing` - Instrument listings with custom fields for music rentals:
  - `conditionRating` (1-10 scale)
  - `experienceLevel` (beginner to professional)
  - Standard fields: title, description, price, category, location
- `Reservation` - Booking system with date ranges and pricing
- `Account` - NextAuth account linking

### Authentication Flow

- NextAuth.js configuration in `pages/api/auth/[...nextauth].ts`
- Supports Google OAuth and email/password
- User session management with JWT strategy
- Protected routes using `getCurrentUser()` server action

### Component Architecture

**Modals**: Centralized modal system using Zustand
- `LoginModal`, `RegisterModal`, `RentModal`, `SearchModal`
- Custom hooks: `useLoginModal`, `useRegisterModal`, etc.

**UI Patterns**:
- Client-side components wrapped with `ClientOnly` wrapper
- Server components for data fetching (`getCurrentUser`, `getListings`, etc.)
- Custom input components in `components/inputs/`
- Listing components in `components/listing/`

### API Structure

- REST API routes in `app/api/`
- Server actions in `app/actions/` for data fetching
- Prisma client singleton pattern in `lib/prismadb.ts`

### Styling

- Tailwind CSS with custom configuration
- Responsive design patterns
- Custom components follow Tailwind utility-first approach

### Environment Setup

Required environment variables (see SETUP_INSTRUCTIONS.md):
- `DATABASE_URL` - MongoDB connection
- `NEXTAUTH_SECRET` - Auth secret
- `GOOGLE_CLIENT_ID/SECRET` - OAuth credentials
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Image uploads