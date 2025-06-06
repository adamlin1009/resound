# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

# One-time setup for existing deployments
node scripts/geocodeExistingListings.js  # Geocode existing listings for radius search
node scripts/makeAdmin.js your@email.com # Make a user an admin

# Testing
node scripts/testRadiusSearch.js     # Test radius search functionality
node scripts/testStripeWebhook.js    # Test Stripe webhook handling
```

## Architecture Overview

**Resound** is a classical instrument rental marketplace built as an Airbnb-style platform using Next.js 13+ with the App Router. It's specifically designed for musicians to rent high-quality instruments with features tailored to the music community.

### Complete Tech Stack

- **Frontend Framework**: Next.js 15.3.3 with App Router (React 18.2.0)
- **Language**: TypeScript 5.0.3
- **Styling**: Tailwind CSS 3.4.17 with custom plugins (tailwind-scrollbar)
- **Database**: MongoDB with Prisma ORM 4.12.0
- **Authentication**: NextAuth.js 4.20.1 with Prisma Adapter
- **State Management**: Zustand 4.3.7
- **Payment Processing**: Stripe 18.2.1
- **Image Management**: Cloudinary (next-cloudinary 6.16.0)
- **Form Handling**: React Hook Form 7.43.9
- **Date Handling**: date-fns 2.29.3 and react-date-range 1.4.0
- **Maps**: Leaflet 1.9.4 with React-Leaflet 4.2.1
- **Icons**: React Icons 4.12.0
- **Animations**: Framer Motion 10.10.0
- **HTTP Client**: Axios 1.3.4
- **Notifications**: React Toastify 9.1.2
- **Password Encryption**: bcrypt 5.1.0

### Key Directory Structure

```
/Users/adamlin/Documents/resound/airbnb/
├── app/                      # Next.js App Router
│   ├── actions/             # Server actions for data fetching
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── listings/       # Listing CRUD operations
│   │   ├── reservations/   # Booking management
│   │   ├── favorites/      # Favorites management
│   │   ├── conversations/  # Messaging system
│   │   ├── payments/       # Stripe integration
│   │   ├── admin/          # Admin endpoints
│   │   └── webhooks/       # External webhooks
│   ├── (pages)/            # Route pages
│   └── layout.tsx          # Root layout
├── components/              # Reusable UI components
│   ├── inputs/             # Form inputs
│   ├── listing/            # Listing-specific components
│   ├── models/             # Modal components
│   └── navbar/             # Navigation components
├── hook/                    # Custom React hooks
├── lib/                     # Utility libraries
├── prisma/                  # Database schema and seeds
├── public/                  # Static assets
├── scripts/                 # Utility scripts
└── types.ts                # TypeScript definitions
```

### Data Models (Prisma Schema)

#### Core Models:

**User**
- Authentication fields (email, hashedPassword)
- Profile information (name, image)
- Admin flag for platform management
- Favorites array for liked listings
- Relations to listings, reservations, conversations

**Listing**
- Music-specific fields:
  - `conditionRating`: Int (1-10 scale for instrument quality)
  - `experienceLevel`: Int (1-5 scale for player requirements)
  - `category`: String (Guitar, Piano, Violin, etc.)
- Location fields with geocoding support:
  - `location`: String (formatted address)
  - `city`, `state`, `zipCode`: Individual fields
  - `latitude`, `longitude`: Float coordinates
- Standard marketplace fields:
  - `title`, `description`, `price`
  - `imageSrc`: Array of Cloudinary URLs
  - `available`: Boolean flag
- Relations to owner, reservations, conversations

**Reservation**
- Date range (startDate, endDate)
- Status enum: ACTIVE | COMPLETED | CANCELED
- Total price calculation
- Cancellation reason tracking
- Relations to user, listing, payment

**Payment**
- Stripe integration fields:
  - `stripeSessionId`, `stripePaymentIntentId`
  - `status`: PENDING | SUCCEEDED | FAILED
  - `amount`: Float
- Relations to reservation

**Conversation**
- Links owner and renter for a listing
- Contains message thread
- Last message timestamp

**Message**
- Text content
- Sender identification
- Timestamps for ordering

### API Routes Documentation

#### Authentication (`/api/auth/`)
- `[...nextauth]`: Dynamic NextAuth routes
  - Google OAuth 2.0 provider
  - Credentials provider with bcrypt
  - JWT session strategy

#### Listings (`/api/listings/`)
- `POST /`: Create new listing with geocoding
- `DELETE /[listingId]`: Delete listing (owner only)

#### Reservations (`/api/reservations/`)
- `POST /`: Create reservation
- `DELETE /[reservationId]`: Cancel reservation
- `POST /[reservationId]/cancel`: Cancel with reason

#### Favorites (`/api/favorites/`)
- `POST /[listingId]`: Toggle favorite status

#### Payments (`/api/`)
- `POST /create-checkout-session`: Initialize Stripe payment
- `GET /payments/[sessionId]`: Get payment details
- `POST /webhooks/stripe`: Handle Stripe webhooks

#### Conversations (`/api/conversations/`)
- `GET /`: List user conversations
- `POST /`: Create new conversation
- `GET /[conversationId]/messages`: Get messages
- `POST /[conversationId]/messages`: Send message

#### Admin (`/api/admin/`)
- `/users`: User management
- `/listings`: Listing moderation
- `/stats`: Platform analytics

#### Location Services (`/api/`)
- `POST /geocode`: Geocode addresses
- `GET /places/autocomplete`: Google Places suggestions

### Authentication and Authorization

#### Authentication Flow:
1. NextAuth handles session management
2. Google OAuth for social login
3. Email/password with bcrypt hashing
4. JWT tokens for session persistence
5. Secure HTTP-only cookies

#### Authorization Patterns:
- `getCurrentUser()`: Server action for session validation
- Middleware protection on sensitive routes
- Owner-only operations (edit/delete listings)
- Admin role for platform management
- API route guards with session checks

### Component Architecture

#### Modal System:
Centralized modal management using Zustand stores:
- `LoginModal`: User authentication
- `RegisterModal`: New user registration
- `RentModal`: Multi-step listing creation
- `SearchModal`: Advanced search interface
- `ConfirmModal`: Action confirmations

#### Key Components:

**Listing Components**:
- `ListingCard`: Grid item display
- `ListingHead`: Hero section with images
- `ListingInfo`: Details and features
- `ListingReservation`: Booking interface
- `ListingCategory`: Category icon display

**Input Components**:
- `Input`: Text/email/password fields
- `Counter`: Numeric incrementer
- `ImageUpload`: Cloudinary integration
- `Calendar`: Date range picker
- `CategoryInput`: Icon-based selection
- `CountrySelect`: Location picker

**Navigation**:
- `Navbar`: Main navigation bar
- `Categories`: Horizontal category filter
- `Search`: Location search bar
- `UserMenu`: Account dropdown

### State Management

#### Zustand Stores:
- `useLoginModal`: Login modal visibility
- `useRegisterModal`: Registration modal visibility
- `useRentModal`: Listing creation modal
- `useSearchModal`: Search interface modal
- `useFavorite`: Optimistic favorite updates

#### State Patterns:
- Client-side state for UI interactions
- Server state via server actions
- Optimistic updates for better UX
- Modal state centralization

### Location System

#### Implementation:
- US-focused marketplace
- City, State, ZIP structure
- Google Places API integration (optional)
- Fallback to manual entry
- Geocoding for coordinates
- Radius search with Haversine formula

#### Search Features:
- Location-based filtering
- Radius search (miles)
- Nationwide search option
- Smart query parsing
- Geocoding with fallbacks

### Reservation System

#### Booking Flow:
1. Calendar date selection
2. Availability checking
3. Price calculation
4. Stripe checkout
5. Payment processing
6. Confirmation email
7. Reservation creation

#### Management Features:
- Status tracking
- Cancellation with reasons
- Owner approval (optional)
- Conflict prevention
- History tracking

### Payment Integration

#### Stripe Implementation:
- Checkout Sessions API
- Webhook event handling
- Payment status tracking
- Secure redirect flow
- Amount formatting utilities
- Success/cancel pages

### Messaging System

#### Features:
- Direct owner-renter communication
- Conversation threads per listing
- Message history
- User avatars
- Chronological ordering
- Post-rental messaging support (30 days after completion)
- Unread indicators (planned)

#### Messaging Rules:
- Renters must have a paid reservation to start conversations
- Messaging allowed during PENDING, ACTIVE, and COMPLETED states
- After rental completion, messaging continues for 30 days
- Owners can always respond to renter messages
- Conversations persist even if listings are deleted

### File Upload System

#### Cloudinary Integration:
- Drag-and-drop interface
- Multiple image support
- Unsigned upload presets
- Secure URL storage
- Image optimization
- Progress indicators

### Search and Filtering

#### Capabilities:
- Location search with geocoding
- Radius-based filtering
- Category filtering
- Condition rating minimum
- Experience level filtering
- Date availability
- Price range (planned)

### Environment Variables

```env
# Database
DATABASE_URL=              # MongoDB connection string

# Authentication
NEXTAUTH_SECRET=          # Random secret for JWT
NEXTAUTH_URL=             # Application URL

# Google OAuth
GOOGLE_CLIENT_ID=         # OAuth app ID
GOOGLE_CLIENT_SECRET=     # OAuth app secret

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=    # Cloud name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET= # Upload preset

# Stripe
STRIPE_SECRET_KEY=                    # Secret API key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=   # Public key
STRIPE_WEBHOOK_SECRET=                # Webhook signing

# Google Places (Optional)
GOOGLE_PLACES_API_KEY=                # For autocomplete
```

### Security Measures

- HTTPS-only sessions
- CSRF protection
- SQL injection prevention (Prisma)
- XSS protection (React)
- Environment variable separation
- Owner-only operations
- Webhook signature verification
- Password hashing with bcrypt
- Session token rotation

### Performance Optimizations

- Dynamic imports for heavy components
- Next.js Image optimization
- Prisma singleton pattern
- Server-side data fetching
- Component memoization
- Efficient database queries
- Static generation where possible
- Client-side caching

### Error Handling

- Try-catch in server actions
- API error responses
- Toast notifications
- Console logging (development)
- Graceful service fallbacks
- User-friendly messages
- Validation error display

### Music-Specific Features

1. **Condition Rating System**:
   - 1-10 scale for instrument quality
   - Visual indicators
   - Search filtering

2. **Experience Level Requirements**:
   - 1-5 scale (Beginner to Professional)
   - Helps match instruments to players
   - Clear labeling

3. **Instrument Categories**:
   - Guitar, Piano, Violin, Drums
   - Woodwinds, Brass, Other
   - Icon representations

### Development Patterns

1. **Server Components by Default**
2. **Client Components for Interactivity**
3. **Server Actions for Data Mutations**
4. **Optimistic UI Updates**
5. **Progressive Enhancement**
6. **Mobile-First Design**
7. **Accessibility First**

### Security Improvements (January 2025)

#### 1. **Race Condition Prevention**
- Implemented date conflict checking for reservation creation
- Added transaction boundaries for all critical operations
- Created reservation hold system during checkout (15-minute expiry)
- Double-checking conflicts within database transactions

#### 2. **Enhanced Authorization**
- Fixed `getReservations` to enforce proper user permissions
- Users can only view their own reservations or listings they own
- Admin users have full access to all reservations
- Consistent permission checks across all endpoints

#### 3. **Improved Data Integrity**
- Listing deletion prevented when active/future reservations exist
- Payment and reservation synchronization via atomic transactions
- Idempotent webhook handling to prevent duplicate processing
- Proper cascade handling for related data

#### 4. **Reservation Hold System**
- Creates PENDING reservations during checkout
- Automatically expires after 15 minutes if payment not completed
- Prevents double-booking during payment processing
- Seamless conversion to ACTIVE upon successful payment

#### 5. **Transaction Safety**
- All critical operations wrapped in database transactions
- Atomic updates for reservation status changes
- Rollback capability for failed operations
- Consistent state management across payment flows

### Recent Major Updates (January 2025)

#### 1. **Enhanced Admin Panel**
- Full-featured admin dashboard at `/admin`
- Three main sections: Dashboard (stats), Users (management), Listings (moderation)
- Key metrics tracking: total users, listings, reservations, revenue
- Admin privilege management with confirmation modals
- Secure admin-only routes with `checkAdminUser` action

#### 2. **Confirmation Modal System**
- New reusable modal component: `ConfirmModal`
- Zustand store: `useConfirmModal` hook
- Used for destructive actions (delete listings, cancel reservations)
- Customizable titles, messages, and action buttons
- Integrated throughout admin and user interfaces

#### 3. **Improved Messaging System**
- Real-time messaging between owners and renters
- Split-view interface in `/messages`
- Conversation management with avatar display
- Message state management via `useMessages` hook
- Start conversations directly from listing pages

#### 4. **Advanced Location Search**
- Three search modes:
  - Nationwide (no location filter)
  - Radius-based (with miles parameter)
  - Exact location match
- Geocoding support for all listings
- Batch geocoding script: `scripts/geocodeExistingListings.js`
- Radius search testing: `scripts/testRadiusSearch.js`

#### 5. **Performance Optimizations**
- Optimized `getListings` with conditional query building
- Efficient location-based filtering
- Improved instrument search across multiple fields
- Better database query patterns
- Post-query filtering for complex searches

#### 6. **UI/UX Improvements**
- Fixed authentication modal flow
- Better error handling with toast notifications
- Consistent confirmation patterns for destructive actions
- Improved avatar display system
- Enhanced mobile responsiveness

#### 7. **Infrastructure Updates**
- New API endpoints for geocoding
- Enhanced payment flow with better Stripe integration
- Improved email system error handling
- Better cancellation flow with reason tracking
- Database schema optimizations

### Common Tasks

#### Adding a New Feature:
1. Update Prisma schema if needed
2. Run `npx prisma db push`
3. Create server action in `app/actions/`
4. Build API route if needed
5. Create components in `components/`
6. Add client-side state if needed
7. Update types in `types.ts`

#### Debugging Issues:
1. Check browser console
2. Review server logs
3. Verify environment variables
4. Check database connections
5. Test API routes directly
6. Review Prisma queries

#### Working with the Admin Panel:
1. Grant admin access: `node scripts/makeAdmin.js user@email.com`
2. Access admin panel at `/admin`
3. Use confirmation modals for all destructive actions
4. Check `checkAdminUser` for authorization patterns

#### Managing Locations:
1. Run `node scripts/geocodeExistingListings.js` for existing data
2. New listings are automatically geocoded
3. Test radius search: `node scripts/testRadiusSearch.js`
4. Use `GOOGLE_PLACES_API_KEY` for autocomplete

This comprehensive guide should help you understand and work effectively with the Resound codebase.