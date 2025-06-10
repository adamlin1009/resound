import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
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