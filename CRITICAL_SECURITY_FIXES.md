# Critical Security Fixes - Immediate Action Required

These minimal fixes address the 5 critical vulnerabilities. Total implementation time: 30 minutes.

## 1. Fix Unprotected Geocoding Endpoint

**File**: `/app/api/geocode/listings/route.ts`
**Line**: Add after line 4

```typescript
import { checkAdminUser } from "@/app/actions/checkAdminUser";

export async function POST(request: NextRequest) {
  const currentUser = await checkAdminUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ... rest of existing code unchanged
```

## 2. Fix Price Manipulation in Checkout

**File**: `/app/api/create-checkout-session/route.ts`  
**Line**: Add after line 50 (after listing fetch)

```typescript
// Validate price matches expected calculation
const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
const expectedPrice = listing.price * days;
if (Math.abs(totalPrice - expectedPrice) > 0.01) {
  return NextResponse.json({ error: "Invalid price calculation" }, { status: 400 });
}
```

## 3. Secure NextAuth Configuration

**File**: `/pages/api/auth/[...nextauth].ts`
**Line**: Replace lines 56-58 with:

```typescript
session: {
  strategy: "jwt",
  maxAge: 24 * 60 * 60, // 24 hours instead of 30 days
},
cookies: {
  sessionToken: {
    name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  }
},
```

## 4. Remove Console.log Statements

**Files to clean**:
- `/app/api/webhooks/stripe/route.ts` - Remove lines 38, 55, 62, 67, 72, 79, 84, 96, 105, 132, 144
- `/lib/email.ts` - Remove lines 14-15, 41
- `/app/error.tsx` - Remove line 12
- `/prisma/seed.ts` - Remove lines 491-501 (contains passwords!)
- `/app/api/geocode/listings/route.ts` - Remove lines 24, 57-68

## 5. Expand Middleware Protection

**File**: `/middleware.ts`
**Line**: Replace line 4 with:

```typescript
export const config = {
  matcher: [
    "/rentals",
    "/reservations", 
    "/instruments",
    "/favorites",
    "/api/admin/:path*",
    "/api/profile",
    "/api/listings",
    "/api/reservations/:path*",
    "/api/geocode/:path*"
  ],
};
```

## Verification Steps

After implementing these fixes:

1. **Test geocoding endpoint**: Should return 401 without admin auth
2. **Test checkout**: Try to submit mismatched price, should fail
3. **Check cookies**: In browser dev tools, verify secure cookie settings in production
4. **Verify logs**: Search codebase for "console.log" - should only be in client components
5. **Test protected routes**: Verify new routes in middleware require authentication

## Additional Quick Wins (5 minutes each)

### Add NEXTAUTH_SECRET validation
**File**: `/pages/api/auth/[...nextauth].ts`
**Line**: Add at top of file after imports

```typescript
if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
  throw new Error('NEXTAUTH_SECRET must be defined and at least 32 characters');
}
```

### Fix Email Enumeration
**File**: `/app/api/register/route.ts`
**Line**: Change line 60

```typescript
// From:
return NextResponse.json({ error: "User already exists" }, { status: 409 });
// To:
return NextResponse.json({ error: "Registration failed" }, { status: 400 });
```

### Add Rate Limiting to Messages
**File**: `/app/api/conversations/[conversationId]/messages/route.ts`
**Line**: Add after line 9

```typescript
import { rateLimiters } from "@/lib/rateLimiter";

export async function POST(request: NextRequest, { params }: { params: { conversationId: string } }) {
  const rateLimitResponse = await rateLimiters.api(request);
  if (rateLimitResponse) return rateLimitResponse;
  // ... rest unchanged
```

These fixes eliminate the most critical vulnerabilities with minimal code changes.