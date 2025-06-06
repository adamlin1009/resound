#!/bin/bash

# Test Stripe Webhook Locally
# This script helps test the webhook integration using Stripe CLI

echo "🚀 Starting Stripe webhook testing..."
echo ""
echo "Prerequisites:"
echo "- Install Stripe CLI: brew install stripe/stripe-cli/stripe"
echo "- Login to Stripe: stripe login"
echo "- Make sure your dev server is running on port 3000"
echo ""

echo "📡 Starting webhook forwarding..."
echo "Copy the webhook signing secret that appears and add it to your .env file as:"
echo "STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe --events checkout.session.completed,checkout.session.expired

# To trigger test events:
# stripe trigger checkout.session.completed