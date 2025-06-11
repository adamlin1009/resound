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

# Testing
npm test                                 # Run all tests
npm test -- --watch                     # Run tests in watch mode
npm test -- --coverage                  # Run tests with coverage
npm run test:api                        # Run API tests only
npm run test:db                         # Run database tests only
npm run test:e2e                        # Run E2E tests only

# Debugging & Maintenance Scripts
node scripts/testRadiusSearch.js         # Test radius search functionality
./scripts/test-stripe-webhook.sh         # Test Stripe webhook with local forwarding
node scripts/checkListingData.js         # Verify listing data integrity
node scripts/testRadiusSearchDirect.js   # Direct database radius search test
node scripts/testRadiusSearchSimple.js   # Simple radius search test
node scripts/addReservationIndexes.js    # Add database indexes for reservations
node scripts/findProblematicListing.js   # Find problematic listings in database
node scripts/findSpecificListing.js      # Search for specific listing by criteria
node scripts/fixViolaCategory.js         # Fix viola category data issues
node scripts/migrateCategoriesToBroadFamilies.js  # Migrate instrument categories
node scripts/migrateInstrumentTypes.js   # Migrate instrument types to new schema
node scripts/updateSpecificInstrumentTypes.js  # Update specific instrument types
node scripts/verifyInstrumentTypes.js    # Verify instrument type integrity
node scripts/searchForListing.js         # Search listings with advanced filters
node scripts/checkRecentListings.js      # Check recently created listings
node scripts/checkGeocodedListings.js    # Verify geocoding status

# Image Management Scripts
node scripts/analyzeCloudinaryImages.js  # Analyze Cloudinary image usage
node scripts/migrateImagesToArraysRaw.js # Migrate images to array format
node scripts/verifyUploadthingMigration.js # Verify Uploadthing migration status

# Bundle Analysis
npm run analyze                          # Analyze bundle size with Next.js Bundle Analyzer

# Mobile Upload Testing
node -e "console.log('Test QR Code URL:', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')"  # Check QR code base URL
curl http://localhost:3000/api/listings/[listingId]/upload-token -X POST  # Test upload token generation
```

## Architecture Overview

**Resound** is a classical instrument rental marketplace built as an Airbnb-style platform using Next.js 15+ with the App Router. It's specifically designed for musicians to rent high-quality instruments with features tailored to the music community.

### Custom Server Setup

The application uses a custom Next.js server (`server.js`) to enable:
- Socket.io WebSocket integration for real-time messaging
- Custom middleware for authentication
- WebSocket event handling alongside Next.js routes
- Graceful shutdown handling
- Production-ready with PM2 support

### Tech Stack

- **Framework**: Next.js 15.3.3 (App Router) with React 18.2.0
- **Language**: TypeScript 5.0.3
- **Styling**: Tailwind CSS 3.4.17 with tailwind-scrollbar plugin
- **Utility Classes**: clsx 2.1.1, tailwind-merge 3.3.1
- **Database**: MongoDB with Prisma ORM 4.12.0
- **Authentication**: NextAuth.js 4.20.1 with Prisma Adapter
- **State Management**: Zustand 4.3.7
- **Payment Processing**: Stripe 18.2.1 with webhook support
- **Image Management**: Uploadthing 7.7.2 (migrated from Cloudinary, V7 with resumable uploads)
- **Image Processing**: Sharp 0.34.2, Plaiceholder 3.0.0
- **Real-time Communication**: Socket.io 4.8.1 (server and client)
- **Email Service**: Resend 4.5.2
- **Form Handling**: React Hook Form 7.43.9
- **Date Handling**: date-fns 2.29.3 and react-date-range 1.4.0
- **Maps**: Leaflet 1.9.4 with React-Leaflet 4.2.1
- **Icons**: React Icons 4.12.0
- **Animations**: Framer Motion 10.10.0
- **HTTP Client**: Axios 1.3.4
- **Notifications**: React Toastify 9.1.3
- **Password Encryption**: bcrypt 5.1.0
- **Rate Limiting**: Custom in-memory implementation (lib/rateLimiter.ts)
- **Drag & Drop**: @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0
- **QR Codes**: qrcode 1.5.4
- **Testing**: Jest 29.7.0 with Testing Library
- **Bundle Analysis**: Next.js Bundle Analyzer 15.3.3
- **Select Inputs**: React Select 5.7.2
- **Development Tools**: tsx 4.19.4 for TypeScript execution

### Core Data Models

#### User
- Authentication: email, hashedPassword, OAuth providers
- Profile: name, image, experienceLevel, preferredInstruments, bio
- Permissions: isAdmin flag
- Relations: listings[], reservations[], favorites[], accounts[], conversations[], uploadTokens[]

#### Listing
- Music-specific: category, instrumentType, experienceLevel (1-5)
- Location: city, state, zipCode, exactAddress, latitude, longitude
- Details: title, description, price, imageSrc[] (array of image URLs)
- Availability: pickupStartTime, pickupEndTime, returnStartTime, returnEndTime, availableDays[]
- Relations: user (owner), reservations[], conversations[], uploadTokens[]

#### Reservation
- Booking: startDate, endDate, totalPrice
- Status: PENDING | ACTIVE | COMPLETED | CANCELED
- Rental Status: PENDING | READY_FOR_PICKUP | PICKED_UP | IN_PROGRESS | AWAITING_RETURN | RETURNED | COMPLETED
- Pickup Details: pickupAddress, pickupInstructions, pickupStartTime, pickupEndTime, confirmation flags
- Return Details: returnAddress, returnInstructions, returnDeadline, returnStartTime, returnEndTime, confirmation flags
- Metadata: cancellationReason, createdAt, expiresAt, stripeSessionId, ownerNotes, renterNotes
- Relations: user, listing

#### Payment
- Stripe: stripeSessionId (unique), stripePaymentIntentId
- Details: amount, currency, status (PENDING | PROCESSING | SUCCEEDED | FAILED | CANCELED)
- Booking Info: startDate, endDate
- Relations: user, listing

#### Conversation & Message
- Threading: owner-renter communication per listing (unique per triplet)
- Persistence: messages stored indefinitely
- Content: text messages with timestamps
- Relations: listing, owner, renter, messages[]

#### UploadToken
- Security: unique token for image upload authorization
- Metadata: expiresAt, createdAt
- Relations: user, listing

### API Routes Structure

```
/api/
├── auth/[...nextauth]        # NextAuth.js dynamic routes
├── listings/                  # CRUD operations
│   └── [listingId]/          # Single listing operations
│       ├── route.ts          # GET, PATCH, DELETE listing
│       ├── images/           # Image management
│       └── upload-token/     # Generate upload token (POST: create, GET: validate)
├── upload/[listingId]/       # Mobile upload pages
│   ├── page.tsx             # Server-side token validation and mobile interface
│   └── MobileUploadClient.tsx # Client-side mobile upload component
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
├── uploadthing/              # Uploadthing integration
│   ├── core.ts              # Upload configuration
│   └── route.ts             # Upload endpoints
├── cron/                     # Scheduled tasks
│   ├── expire-reservations/  # Clean up expired reservations
│   └── cleanup-upload-tokens/ # Remove expired upload tokens
├── admin/                    # Admin-only endpoints
│   ├── users/               # User management
│   ├── listings/            # Listing moderation
│   ├── stats/               # Platform analytics
│   └── images/              # Image management
│       ├── stats/           # Image statistics
│       └── bulk-delete/     # Bulk delete operations
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
- useSocket for real-time WebSocket connections
- Server state via React Server Components

#### Real-time Communication
- Socket.io server integration with Next.js custom server
- Client-side socket provider with React Context
- Event-based messaging for conversations
- Automatic reconnection handling
- User authentication via socket middleware

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

#### Image Upload Security
- Uploadthing integration with secure tokens
- Time-limited upload tokens (15 minutes expiry)
- User and listing-scoped upload permissions
- Automatic token cleanup via cron job
- File type and size restrictions enforced
- Server-side validation of upload requests

#### Authorization Rules
- Users see only their reservations/listings
- Admins have full platform access
- Owners manage their listings
- Renters need paid reservations to message
- API routes enforce session checks
- Upload tokens require authenticated users

#### Rate Limiting
- In-memory rate limiting for single-instance deployments
- Configurable windows and limits per endpoint
- Different limits for: 
  - Registration: 5 attempts per hour
  - Checkout: 10 attempts per hour
  - API general: 100 requests per 15 minutes
  - Geocoding: 30 requests per minute
  - Favorites: 60 requests per minute
- Headers include retry-after and rate limit info
- Automatic cleanup of expired entries every minute

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

# Uploadthing (Image Upload Service) - V7
UPLOADTHING_TOKEN=                # Uploadthing v7 token (base64 encoded, contains app ID, region, API key)
UPLOADTHING_URL=                  # Optional: Custom Uploadthing URL

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google APIs (Optional)
GOOGLE_PLACES_API_KEY=            # For address autocomplete
GOOGLE_GEOCODING_API_KEY=         # For geocoding

# Email
RESEND_API_KEY=                   # Email service

# App Config (CRITICAL for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # MUST be set to production domain for QR codes
NEXTAUTH_URL=http://localhost:3000         # MUST match NEXT_PUBLIC_APP_URL

# WebSocket (Optional)
SOCKET_PORT=3001                  # Port for Socket.io server
```

### WebSocket Deployment on Railway

Since Vercel doesn't support WebSocket connections, the WebSocket server is deployed separately on Railway:

#### Railway Deployment Steps

1. **Install Railway CLI**
   ```bash
   brew install railway
   # or
   npm install -g @railway/cli
   ```

2. **Deploy WebSocket Server**
   ```bash
   # Login to Railway
   railway login

   # Create new project (first time only)
   railway init

   # Link to existing project (if already created)
   railway link

   # Deploy the server
   railway up
   ```

3. **Configure Railway Environment Variables**
   In Railway dashboard, set:
   ```env
   NODE_ENV=production
   PORT=3000
   HOSTNAME=0.0.0.0
   CORS_ORIGIN=https://your-app.vercel.app,https://your-domain.com
   DATABASE_URL=mongodb+srv://...  # Same as Vercel
   NEXTAUTH_SECRET=...             # Same as Vercel
   ```

4. **Update Vercel Environment Variables**
   In Vercel dashboard, add:
   ```env
   NEXT_PUBLIC_SOCKET_URL=https://your-app.up.railway.app
   ```

#### Railway Configuration Files

- **railway.json** - Defines build and deployment settings
- **nixpacks.toml** - Specifies Node.js environment and start command

#### Testing WebSocket Connection

```bash
# Test locally with production socket server
NEXT_PUBLIC_SOCKET_URL=https://your-app.up.railway.app npm run dev

# Check socket server health
curl https://your-app.up.railway.app/socket.io/
```

### Critical Production Deployment Requirements

⚠️ **IMPORTANT**: The following environment variables are **CRITICAL** for production deployment:

#### Required for Mobile Upload QR Codes
- `NEXT_PUBLIC_APP_URL` - **MUST** be set to your production domain (e.g., `https://resound.app`)
- Without this, QR codes will show `localhost:3000` instead of your production URL
- Used in: Upload token generation, Stripe checkout URLs, Socket.io CORS

#### Required for Authentication
- `NEXTAUTH_URL` - Should match `NEXT_PUBLIC_APP_URL`
- Required for OAuth callbacks and session management

#### Required for Payment Processing
- `STRIPE_WEBHOOK_SECRET` - Production webhook secret from Stripe Dashboard
- Test webhooks will not work in production

#### Required for Image Upload (Uploadthing V7)
- `UPLOADTHING_TOKEN` - V7 token from UploadThing Dashboard → API Keys → V7 tab
- Contains base64 encoded app ID, region, and API key
- **NOT** the old `UPLOADTHING_SECRET` from v6
- Update `next.config.js` with your actual APP_ID for secure image optimization

#### Custom Server Deployment
- The app uses a custom Next.js server (`server.js`) for Socket.io
- Deploy the entire project, not just the Next.js build
- Ensure the custom server can handle both HTTP and WebSocket connections

#### Pre-Production Checklist
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Update `NEXTAUTH_URL` to match production domain
- [ ] **CRITICAL**: Get new `UPLOADTHING_TOKEN` from V7 dashboard (not old secret)
- [ ] **CRITICAL**: Update Next.js config with your actual APP_ID: `<APP_ID>.ufs.sh`
- [ ] Configure production Stripe webhook endpoint
- [ ] Test QR code generation shows production URL
- [ ] Verify mobile upload flow works end-to-end
- [ ] Test Socket.io connections in production environment
- [ ] Confirm upload token expiration works correctly

### Recent Major Updates (June 2025)

1. **Image Management Migration**
   - Migrated from Cloudinary to Uploadthing
   - Secure token-based upload system
   - Time-limited upload tokens (15 minutes)
   - Admin bulk delete functionality
   - Automatic cleanup of expired tokens
   - Image statistics dashboard

2. **Real-time Communication**
   - Socket.io integration for live messaging
   - WebSocket server with Next.js custom server
   - Real-time conversation updates
   - Typing indicators and presence
   - Automatic reconnection handling

3. **Enhanced Security**
   - Race condition prevention in reservations
   - Transaction-safe payment processing
   - Improved authorization checks
   - Reservation hold system during checkout
   - Rate limiting implementation for API endpoints
   - Upload token security for images

4. **Admin Dashboard Enhancements**
   - Full admin panel at `/admin`
   - User and listing management
   - Platform statistics and analytics
   - Image management tools
   - Bulk operations support
   - Confirmation modals for destructive actions

5. **Messaging System**
   - Real-time owner-renter communication via Socket.io
   - Persistent conversation storage
   - Split-view interface
   - Message history preservation

6. **Location Search Improvements**
   - Radius-based search with miles
   - Nationwide search option
   - Geocoding for all listings
   - Batch processing scripts
   - Search bar enhancements

7. **Testing Infrastructure**
   - Jest and Testing Library setup
   - Component unit tests
   - API integration tests
   - Test utilities and mock helpers
   - Comprehensive test coverage

8. **Code Quality & Performance**
   - Comprehensive security audit (Phases 1-6)
   - Bundle size optimization
   - Additional maintenance scripts
   - Database optimization with indexes
   - Image processing with Sharp
   - Drag-and-drop functionality with @dnd-kit

9. **Mobile Upload System**
   - QR code-based mobile image upload
   - Token-based security with 30-minute expiration
   - Mobile-optimized upload interface
   - Cross-device workflow (desktop → mobile)
   - Real-time upload progress and feedback
   - Automatic listing image synchronization

### Common Development Tasks

#### Adding a New Feature
1. Update Prisma schema if needed
2. Run `npx prisma db push` and `npx prisma generate`
3. Create server action in `app/actions/`
4. Build API route in `app/api/`
5. Create components with proper client/server split
6. Add Zustand store if needed for UI state
7. Update TypeScript types in `types.ts`
8. Add Socket.io events if real-time updates needed
9. Implement rate limiting for new endpoints
10. Add tests for critical functionality

#### Working with WebSocket/Real-time Features
1. Define event types in `lib/socket/types.ts`
2. Add server-side handlers in `server.js`
3. Use `useSocket` hook in client components
4. Handle connection state and reconnection
5. Implement proper cleanup in useEffect
6. Test with multiple concurrent connections

#### Testing Stripe Locally
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Run webhook forwarding: `./scripts/test-stripe-webhook.sh`
4. Copy webhook secret to `.env`
5. Test with card: 4242 4242 4242 4242

#### Working with Image Uploads (Uploadthing V7)
1. Generate upload token via API: `/api/listings/[listingId]/upload-token`
2. Use `@uploadthing/react` components for UI
3. Configure allowed file types in `app/api/uploadthing/core.ts`
4. Handle upload callbacks for database updates
5. Tokens expire after 15 minutes
6. Max file size: 4MB for images
7. Supported formats: jpg, jpeg, png, webp
8. Admin bulk operations via `/api/admin/images/`

**V7 Migration Notes:**
- Environment variable changed from `UPLOADTHING_SECRET` to `UPLOADTHING_TOKEN`
- Token is base64 encoded JSON containing app ID, region, and API key
- Get token from UploadThing Dashboard → API Keys → V7 tab
- Resumable uploads now supported with `createUpload` function
- 35% smaller client bundle size
- Faster upload experience with fewer round-trips
- Added `NextSSRPlugin` in layout for instant loading (no loading state)
- Tailwind config wrapped with `withUt` helper for better styling
- All components now use V7 patterns
- Updated Next.js image optimization for secure V7 file URLs
- Enhanced authentication security with `UploadThingError`
- File URL patterns updated for V6/V7 compatibility

#### Mobile Upload System (QR Code)
1. Desktop: Click "Upload via Phone" on listing edit page
2. QR code generated with secure 30-minute token
3. Mobile: Scan QR code or use copy link
4. Upload up to 5 images at once (4MB max each)
5. Real-time progress tracking and auto-redirect
6. Images automatically added to listing

#### Troubleshooting Mobile Upload Issues
1. **QR Code shows localhost instead of production URL**
   - Check `NEXT_PUBLIC_APP_URL` environment variable
   - Ensure it's set to your production domain
   - Restart server after changing environment variables

2. **Upload token validation fails**
   - Verify token hasn't expired (30-minute limit)
   - Check database connection for UploadToken model
   - Ensure listing owner permissions are correct

3. **Mobile upload interface doesn't load**
   - Confirm `/upload/[listingId]` route is accessible
   - Check browser console for JavaScript errors
   - Verify Uploadthing configuration

4. **Images not appearing after upload**
   - Check Uploadthing webhook configuration
   - Verify listing update logic in upload callback
   - Monitor server logs for upload completion events

#### UploadThing V7 File Handling & Security

**File URL Patterns:**
- **V7**: `https://<APP_ID>.ufs.sh/f/<FILE_KEY>` (recommended)
- **V6 Legacy**: `https://utfs.io/f/<FILE_KEY>` (deprecated but supported)
- **Never use**: Raw storage URLs (S3, etc.) as they may change

**Next.js Image Optimization:**
```javascript
// next.config.js - Secure pattern configuration
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.ufs.sh',        // V7 pattern
      pathname: '/f/*',
    },
    {
      protocol: 'https', 
      hostname: 'utfs.io',         // V6 legacy
      pathname: '/f/*',
    }
  ]
}
```

**Authentication Security:**
- Use `UploadThingError` instead of generic `Error` for proper client-side error messages
- Implement proper middleware authentication for each file route
- Mobile uploads use token-based security (validated at page level)
- Private files can use presigned URLs for access control

**File Route Security Examples:**
```typescript
// Protected route
protectedRoute: f({ image: {} })
  .middleware(async ({ req }) => {
    const user = await getCurrentUser();
    if (!user) throw new UploadThingError("You need to be logged in");
    return { userId: user.id };
  })

// Public route with rate limiting
publicRoute: f({ image: {} })
  .middleware(async ({ req }) => {
    const limit = await ratelimiter.verify(req);
    if (!limit.ok) throw new UploadThingError("Rate limit exceeded");
    return {};
  })
```

#### Managing Production Data
1. Grant admin: `node scripts/makeAdmin.js email@example.com`
2. Geocode listings: `node scripts/geocodeExistingListings.js`
3. Test search: `node scripts/testRadiusSearch.js`
4. Check data: `node scripts/checkListingData.js`
5. Migrate images: `node scripts/migrateImagesToArraysRaw.js`
6. Verify Uploadthing: `node scripts/verifyUploadthingMigration.js`
7. Update instruments: `node scripts/migrateInstrumentTypes.js`
8. Add indexes: `node scripts/addReservationIndexes.js`

### Performance Considerations

- Dynamic imports for heavy components (maps, modals)
- Image optimization via Next.js Image and Uploadthing
- Prisma connection pooling singleton
- Efficient query patterns with selective fields
- Client-side result caching
- Static generation where applicable
- WebSocket connection pooling
- Image lazy loading with blur placeholders
- Optimized bundle sizes with tree shaking

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

#### Current Test Coverage
The project has an established testing infrastructure with Jest and Testing Library:
- **Unit Tests**: Components (ListingCard, Modal, RentModal)
- **Integration Tests**: API routes (payment flow, registration)
- **Server Actions**: Data access layer tests
- **Test Utilities**: Mock helpers, test database setup, test environment config

#### Testing Strategy
```bash
# Run all tests
npm test                      # Run test suite
npm test -- --watch          # Watch mode for development
npm test -- --coverage       # Generate coverage report

# Run specific test suites
npm run test:api             # API route tests only
npm run test:db              # Database operation tests
npm run test:e2e             # End-to-end user flow tests

# Run specific test files
npm test ListingCard         # Test specific component
npm test paymentFlow         # Test specific flow
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