# Stripe Payment Integration Setup

## Phase 1 Implementation Complete

This document explains the Stripe payment integration added to the Resound platform.

## What's Been Implemented

### 1. Database Schema
- Added `Payment` model to track payment records
- Includes fields for Stripe session ID, amount, status, and rental details

### 2. Payment Flow
- User clicks "Proceed to Payment" on listing page
- Creates a Stripe Checkout Session
- Redirects to Stripe's hosted checkout page
- After payment: redirects to success/cancel pages

### 3. New Files Created
- `/lib/stripe.ts` - Stripe configuration and utilities
- `/app/api/create-checkout-session/route.ts` - API endpoint for checkout
- `/app/payment/success/page.tsx` - Payment success page
- `/app/payment/cancel/page.tsx` - Payment cancelled page

### 4. Modified Files
- `prisma/schema.prisma` - Added Payment model
- `components/ListingClient.tsx` - Updated to use Stripe checkout
- `components/listing/ListingReservation.tsx` - Changed button text

## Environment Variables Required

Add these to your `.env` file:

```env
# Stripe Test Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# App URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Webhook secret (for Phase 2)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing the Integration

1. Get test keys from Stripe Dashboard
2. Add environment variables to `.env`
3. Restart the development server
4. Try booking an instrument
5. Use test card: `4242 4242 4242 4242` with any future expiry

## Important Notes

⚠️ **Current Limitations:**
- Payments are recorded but reservations are NOT automatically created yet
- This requires Phase 2 (webhook implementation) to complete the flow
- Users will see success page but no reservation in "My Trips" yet

## Next Steps (Phase 2)

To complete the payment flow, you'll need to:
1. Implement Stripe webhook handler
2. Listen for `payment_intent.succeeded` events
3. Create reservations when payment succeeds
4. Handle edge cases and failures

## Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication Required: `4000 0025 0000 3155`