# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev            # Start development server on localhost:3000
npm run build          # Build for production (includes prisma generate)
npm run start          # Start production server
npm run lint           # Run ESLint

# Database
npm run seed           # Seed database with sample data (uses tsx)
npm run db:reset       # Reset database and reseed
npx prisma generate    # Regenerate Prisma client
npx prisma db push     # Push schema changes to database
npx prisma studio      # Open Prisma Studio GUI

# One-time setup for existing deployments
node scripts/geocodeExistingListings.js  # Geocode existing listings for radius search
node scripts/makeAdmin.js your@email.com # Make a user an admin

# Testing & Debugging
node scripts/testRadiusSearch.js         # Test radius search functionality
./scripts/test-stripe-webhook.sh         # Test Stripe webhook with local forwarding
node scripts/checkListingData.js         # Verify listing data integrity
node scripts/testRadiusSearchDirect.js   # Direct database radius search test
```

## Architecture Overview

**Resound** is a classical instrument rental marketplace built as an Airbnb-style platform using Next.js 15+ with the App Router. It's specifically designed for musicians to rent high-quality instruments with features tailored to the music community.

### Tech Stack

- **Framework**: Next.js 15.3.3 (App Router) with React 18.2.0
- **Language**: TypeScript 5.0.3
- **Styling**: Tailwind CSS 3.4.17 with tailwind-scrollbar plugin
- **Database**: MongoDB with Prisma ORM 4.12.0
- **Authentication**: NextAuth.js 4.20.1 with Prisma Adapter
- **State Management**: Zustand 4.3.7
- **Payment Processing**: Stripe 18.2.1 with webhook support
- **Image Management**: Cloudinary (next-cloudinary 6.16.0)
- **Email Service**: Resend 4.5.2
- **Form Handling**: React Hook Form 7.43.9
- **Date Handling**: date-fns 2.29.3 and react-date-range 1.4.0
- **Maps**: Leaflet 1.9.4 with React-Leaflet 4.2.1
- **Icons**: React Icons 4.12.0
- **Animations**: Framer Motion 10.10.0
- **HTTP Client**: Axios 1.3.4
- **Notifications**: React Toastify 9.1.3
- **Password Encryption**: bcrypt 5.1.0

### Core Data Models

#### User
- Authentication: email, hashedPassword, OAuth providers
- Profile: name, image, createdAt, updatedAt
- Permissions: isAdmin flag
- Relations: listings[], reservations[], favorites[], accounts[], conversations[]

#### Listing
- Music-specific: conditionRating (1-10), experienceLevel (1-5), category
- Location: location, city, state, zipCode, latitude, longitude
- Details: title, description, price, imageSrc[], available
- Relations: user (owner), reservations[], conversations[]

#### Reservation
- Booking: startDate, endDate, totalPrice
- Status: PENDING | ACTIVE | COMPLETED | CANCELED
- Metadata: cancellationReason, createdAt
- Relations: user, listing, payment

#### Payment
- Stripe: stripeSessionId, stripePaymentIntentId
- Details: amount, status (PENDING | SUCCEEDED | FAILED)
- Relations: reservation

#### Conversation & Message
- Threading: owner-renter communication per listing
- Persistence: 30 days post-rental completion
- Content: text messages with timestamps

### API Routes Structure

```
/api/
├── auth/[...nextauth]        # NextAuth.js dynamic routes
├── listings/                  # CRUD operations
│   └── [listingId]/          # Single listing operations
├── reservations/             # Booking management
│   └── [reservationId]/      
│       ├── cancel/           # Cancel with reason
│       ├── pickup/           # Mark as picked up
│       ├── return/           # Mark as returned
│       └── setup/            # Initialize rental
├── create-checkout-session/  # Stripe payment initialization
├── webhooks/stripe/          # Payment confirmation webhook
├── payments/[sessionId]/     # Payment status check
├── favorites/[listingId]/    # Toggle favorite
├── conversations/            # Messaging system
│   └── [conversationId]/messages/
├── geocode/                  # Address geocoding
│   └── listings/             # Batch geocoding
├── places/autocomplete/      # Google Places integration
├── admin/                    # Admin-only endpoints
│   ├── users/               # User management
│   ├── listings/            # Listing moderation
│   └── stats/               # Platform analytics
└── profile/                 # User profile updates
```

### Key Architectural Patterns

#### Server Components & Actions
- Default to Server Components for data fetching
- Server Actions in `app/actions/` for mutations
- Client Components only for interactivity
- Proper error boundaries and loading states

#### Authentication & Authorization
- NextAuth session management with JWT
- Google OAuth and credentials providers
- getCurrentUser() server action for auth checks
- Admin role enforcement via checkAdminUser()
- Owner-only operations on listings/reservations

#### State Management Strategy
- Zustand for modal states (login, register, rent, search, confirm)
- useFavorite hook for optimistic updates
- useMessages for conversation state
- Server state via React Server Components

#### Payment Flow Architecture
1. Create PENDING reservation on checkout initiation
2. Generate Stripe Checkout Session
3. Redirect to Stripe hosted page
4. Webhook handles payment confirmation
5. Atomic transaction updates reservation to ACTIVE
6. 15-minute expiry for incomplete payments

### Security Implementation

#### Payment Security
- Webhook signature verification
- Idempotent payment processing
- Transaction boundaries for consistency
- Race condition prevention in bookings
- Automatic PENDING reservation cleanup

#### Data Protection
- bcrypt password hashing
- Environment variable separation
- HTTPS-only sessions with secure cookies
- CSRF protection via NextAuth
- XSS prevention through React
- SQL injection prevention via Prisma

#### Authorization Rules
- Users see only their reservations/listings
- Admins have full platform access
- Owners manage their listings
- Renters need paid reservations to message
- API routes enforce session checks

### Location & Search System

#### Geocoding Implementation
- Google Geocoding API integration
- Fallback to manual coordinates
- Batch processing for existing listings
- Haversine formula for radius search
- City/State/ZIP normalization

#### Search Capabilities
- Three modes: Nationwide, Radius, Exact location
- Smart query parsing (city, state, zip)
- Category and instrument type filtering
- Condition rating minimum
- Experience level matching
- Date availability checking

### Environment Variables

```env
# Database
DATABASE_URL=mongodb+srv://...    # MongoDB connection

# Authentication
NEXTAUTH_SECRET=                  # JWT secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google APIs (Optional)
GOOGLE_PLACES_API_KEY=            # For address autocomplete
GOOGLE_GEOCODING_API_KEY=         # For geocoding

# Email
RESEND_API_KEY=                   # Email service

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Recent Major Updates (January 2025)

1. **Enhanced Security**
   - Race condition prevention in reservations
   - Transaction-safe payment processing
   - Improved authorization checks
   - Reservation hold system during checkout

2. **Admin Dashboard**
   - Full admin panel at `/admin`
   - User and listing management
   - Platform statistics and analytics
   - Confirmation modals for destructive actions

3. **Messaging System**
   - Real-time owner-renter communication
   - 30-day post-rental messaging
   - Conversation persistence
   - Split-view interface

4. **Location Search**
   - Radius-based search with miles
   - Nationwide search option
   - Geocoding for all listings
   - Batch processing scripts

### Common Development Tasks

#### Adding a New Feature
1. Update Prisma schema if needed
2. Run `npx prisma db push` and `npx prisma generate`
3. Create server action in `app/actions/`
4. Build API route in `app/api/`
5. Create components with proper client/server split
6. Add Zustand store if needed for UI state
7. Update TypeScript types in `types.ts`

#### Testing Stripe Locally
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Run webhook forwarding: `./scripts/test-stripe-webhook.sh`
4. Copy webhook secret to `.env`
5. Test with card: 4242 4242 4242 4242

#### Managing Production Data
1. Grant admin: `node scripts/makeAdmin.js email@example.com`
2. Geocode listings: `node scripts/geocodeExistingListings.js`
3. Test search: `node scripts/testRadiusSearch.js`
4. Check data: `node scripts/checkListingData.js`

### Performance Considerations

- Dynamic imports for heavy components (maps, modals)
- Image optimization via Next.js Image
- Prisma connection pooling singleton
- Efficient query patterns with selective fields
- Client-side result caching
- Static generation where applicable

### Code Quality Standards

- TypeScript strict mode enabled
- ESLint configuration for consistency
- Server/Client component separation
- Proper error handling with try-catch
- User-friendly error messages
- Console logging only in development
- No hardcoded values or magic numbers

## Engineering Best Practices

### Style Guidelines

#### Code Organization
- One component per file, named after the component
- Group related functionality in feature folders
- Colocate tests, styles, and types with components
- Use barrel exports (index.ts) sparingly to avoid circular dependencies

#### Naming Conventions
- Components: PascalCase (ListingCard, UserMenu)
- Hooks: camelCase with 'use' prefix (useFavorite, useLoginModal)
- Server Actions: camelCase with verb (getCurrentUser, getListings)
- API Routes: kebab-case URLs (/api/create-checkout-session)
- Database fields: camelCase in code, mapped if needed
- Environment variables: SCREAMING_SNAKE_CASE

#### TypeScript Practices
- Prefer interfaces over types for object shapes (better error messages)
- Use const assertions for literal types
- Avoid any - use unknown and narrow types
- Define return types explicitly for public APIs
- Use discriminated unions for state machines

```typescript
// Good: Discriminated union
type PaymentState = 
  | { status: 'pending' }
  | { status: 'processing'; sessionId: string }
  | { status: 'succeeded'; paymentId: string }
  | { status: 'failed'; error: string };

// Bad: Optional fields
type PaymentState = {
  status: string;
  sessionId?: string;
  paymentId?: string;
  error?: string;
};
```

### Debugging & Diagnostics

#### Development Debugging
```bash
# Enable verbose Prisma logging
DEBUG=prisma:* npm run dev

# Next.js debug mode
NODE_OPTIONS='--inspect' npm run dev

# Database query logging
PRISMA_LOG_LEVEL=query npm run dev

# Memory profiling
NODE_OPTIONS='--inspect --max-old-space-size=8192' npm run dev
```

#### Diagnostic Scripts
```bash
# Check for slow queries
node scripts/analyzeDatabasePerformance.js

# Memory leak detection
node --expose-gc scripts/memoryLeakDetector.js

# API endpoint health check
curl http://localhost:3000/api/health

# Database connection test
npx prisma db pull --force
```

#### Error Tracking
- Use structured logging with correlation IDs
- Capture full stack traces in development
- Log user context (without PII) for debugging
- Monitor error rates by endpoint

### Test-Driven Development

#### Testing Strategy
```bash
# Unit tests (not yet implemented - priority task)
npm test                      # Run all tests
npm test -- --watch          # Watch mode
npm test -- ListingCard      # Specific component

# Integration tests
npm run test:api             # API route tests
npm run test:db              # Database operations

# E2E tests
npm run test:e2e             # Full user flows
```

#### TDD Workflow
1. Write failing test for new feature
2. Implement minimal code to pass
3. Refactor with confidence
4. Ensure edge cases are covered

#### Test Patterns
```typescript
// Server Action Testing Pattern
describe('getListings', () => {
  it('should filter by location radius', async () => {
    // Arrange
    await seedDatabase({ withGeocodedListings: true });
    
    // Act
    const listings = await getListings({ 
      location: 'New York, NY',
      radius: 50 
    });
    
    // Assert
    expect(listings.every(l => 
      calculateDistance(l, { lat: 40.7128, lng: -74.0060 }) <= 50
    )).toBe(true);
  });
});
```

### Security Review Checklist

#### Input Validation
- [ ] Validate all user inputs at API boundaries
- [ ] Use Zod schemas for runtime validation
- [ ] Sanitize HTML content (already handled by React)
- [ ] Validate file uploads (type, size, content)
- [ ] Check authorization before data access

#### Common Vulnerabilities
```typescript
// ❌ BAD: SQL Injection risk (if using raw queries)
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
`;

// ✅ GOOD: Parameterized queries
const user = await prisma.user.findUnique({
  where: { email: userInput }
});

// ❌ BAD: Path traversal
const file = await readFile(`/uploads/${req.query.filename}`);

// ✅ GOOD: Validate and sanitize
const filename = path.basename(req.query.filename);
const file = await readFile(`/uploads/${filename}`);
```

#### Security Audit Commands
```bash
# Check for known vulnerabilities
npm audit

# Check for secrets in code
git secrets --scan

# Review environment variables
grep -r "process.env" --include="*.ts" --include="*.tsx" | grep -v ".env"
```

### Performance Review Guidelines

#### Database Performance
```typescript
// ❌ BAD: N+1 Query
const listings = await prisma.listing.findMany();
for (const listing of listings) {
  listing.owner = await prisma.user.findUnique({
    where: { id: listing.userId }
  });
}

// ✅ GOOD: Include relation
const listings = await prisma.listing.findMany({
  include: { user: true }
});

// ✅ BETTER: Select only needed fields
const listings = await prisma.listing.findMany({
  select: {
    id: true,
    title: true,
    price: true,
    user: {
      select: { name: true, image: true }
    }
  }
});
```

#### React Performance
- Use React.memo for expensive pure components
- Implement proper key strategies for lists
- Lazy load heavy components and routes
- Optimize re-renders with useCallback/useMemo
- Profile with React DevTools Profiler

#### Bundle Optimization
```bash
# Analyze bundle size
npm run build && npm run analyze

# Check for duplicate dependencies
npm ls --depth=0 | grep -E '@[0-9]'

# Find large dependencies
npm run build && ls -la .next/static/chunks
```

### Correctness Review

#### Edge Case Testing
- Empty states (no data, empty arrays)
- Boundary values (0, -1, MAX_INT)
- Concurrent operations (double-booking)
- Network failures (retry logic)
- Invalid state transitions

#### Common Pitfalls
```typescript
// ❌ BAD: Off-by-one error
for (let i = 0; i <= array.length; i++) {
  console.log(array[i]); // undefined on last iteration
}

// ✅ GOOD: Correct bounds
for (let i = 0; i < array.length; i++) {
  console.log(array[i]);
}

// ❌ BAD: Race condition
const handleReservation = async () => {
  const available = await checkAvailability(listing.id, dates);
  if (available) {
    await createReservation(listing.id, dates); // Another user might book between checks
  }
};

// ✅ GOOD: Atomic operation
const handleReservation = async () => {
  const result = await createReservationAtomic(listing.id, dates);
  if (!result.success) {
    toast.error('This listing is no longer available');
  }
};
```

### Architectural Principles

#### Composition Over Inheritance
```typescript
// ❌ BAD: Inheritance hierarchy
class BaseModal extends Component { }
class AuthModal extends BaseModal { }
class LoginModal extends AuthModal { }

// ✅ GOOD: Composition
const Modal = ({ children, ...props }) => { };
const AuthModal = ({ children }) => (
  <Modal><AuthForm>{children}</AuthForm></Modal>
);
const LoginModal = () => (
  <AuthModal><LoginForm /></AuthModal>
);
```

#### SOLID Principles in Practice
- **Single Responsibility**: One reason to change per module
- **Open/Closed**: Extend behavior without modifying existing code
- **Liskov Substitution**: Subtypes must be substitutable
- **Interface Segregation**: Many specific interfaces over one general
- **Dependency Inversion**: Depend on abstractions, not concretions

#### Design Patterns Used
- **Singleton**: Database connection (prisma/client)
- **Factory**: Modal creation via Zustand stores
- **Observer**: React hooks for state updates
- **Strategy**: Payment providers (extensible)
- **Repository**: Data access layer via Prisma

### Code Review Checklist

Before submitting code:
- [ ] All tests pass
- [ ] No console.logs in production code
- [ ] Error handling for all async operations
- [ ] Loading states for async UI
- [ ] Mobile responsive design verified
- [ ] Accessibility checked (keyboard nav, ARIA)
- [ ] No hardcoded values or secrets
- [ ] Database migrations are backward compatible
- [ ] API changes are backward compatible
- [ ] Performance impact assessed

This guide should help you understand and work effectively with the Resound codebase while maintaining high engineering standards.