// Test environment setup
export const setupTestEnvironment = () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
  process.env.NEXTAUTH_SECRET = 'test-secret-key'
  
  // Mock Stripe keys
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock'
  
  // Mock other services
  process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
  process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
  process.env.RESEND_API_KEY = 'test-resend-api-key'
  process.env.CRON_SECRET = 'test-cron-secret'
}

// Call this in test files
setupTestEnvironment()