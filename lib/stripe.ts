import Stripe from 'stripe';
import { isDemoMode } from './demo';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

if (isDemoMode && !/^(sk|rk)_test_/.test(process.env.STRIPE_SECRET_KEY)) {
  throw new Error('Demo mode requires a Stripe test secret key');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

export function formatAmountForStripe(amount: number): number {
  // Convert dollar amount to cents
  return Math.round(amount * 100);
}

export function formatAmountFromStripe(amount: number): number {
  // Convert cents to dollar amount
  return amount / 100;
}
