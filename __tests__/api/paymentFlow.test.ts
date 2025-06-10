import { POST as createCheckoutSession } from '@/app/api/create-checkout-session/route'
import { POST as handleStripeWebhook } from '@/app/api/webhooks/stripe/route'
import { GET as getPaymentStatus } from '@/app/api/payments/[sessionId]/route'
import { createMockRequest, createMockSession, createMockStripeEvent } from '@/__tests__/utils/mockHelpers'
import { cleanupDatabase, createTestUser, createTestListing, getTestPrismaClient } from '@/__tests__/utils/testDb'
import { getServerSession } from 'next-auth/next'
import stripe from 'stripe'

// Mock next-auth
jest.mock('next-auth/next')
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

// Mock Stripe
jest.mock('stripe')
const MockedStripe = stripe as jest.MockedClass<typeof stripe>

describe('Payment Flow Integration', () => {
  let user: any
  let listing: any
  let mockStripeInstance: any

  beforeEach(async () => {
    await cleanupDatabase()

    // Create test data
    user = await createTestUser({
      email: 'buyer@example.com',
      name: 'Test Buyer'
    })

    const owner = await createTestUser({
      email: 'owner@example.com',
      name: 'Test Owner'
    })

    listing = await createTestListing(owner.id, {
      title: 'Test Violin',
      price: 100,
      available: true
    })

    // Setup Stripe mocks
    mockStripeInstance = {
      checkout: {
        sessions: {
          create: jest.fn(),
          retrieve: jest.fn()
        }
      },
      webhooks: {
        constructEvent: jest.fn()
      }
    }
    MockedStripe.mockImplementation(() => mockStripeInstance as any)
  })

  afterAll(async () => {
    await cleanupDatabase()
  })

  describe('Create Checkout Session', () => {
    beforeEach(() => {
      mockedGetServerSession.mockResolvedValue(createMockSession({
        user: { id: user.id, email: user.email }
      }))
    })

    it('should create checkout session and pending reservation', async () => {
      const mockSessionId = 'cs_test_123'
      mockStripeInstance.checkout.sessions.create.mockResolvedValue({
        id: mockSessionId,
        url: 'https://checkout.stripe.com/test'
      })

      const request = createMockRequest({
        method: 'POST',
        body: {
          listingId: listing.id,
          totalPrice: 700,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      })

      const response = await createCheckoutSession(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.url).toBe('https://checkout.stripe.com/test')

      // Verify Stripe was called correctly
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Test Violin',
              description: expect.any(String)
            },
            unit_amount: 70000 // $700 in cents
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: expect.stringContaining('/payment/success'),
        cancel_url: expect.stringContaining('/payment/cancel'),
        metadata: expect.objectContaining({
          userId: user.id,
          listingId: listing.id
        })
      })

      // Verify pending reservation was created
      const prisma = getTestPrismaClient()
      const reservation = await prisma.reservation.findFirst({
        where: { userId: user.id, listingId: listing.id }
      })

      expect(reservation).toBeTruthy()
      expect(reservation?.status).toBe('PENDING')
      expect(reservation?.totalPrice).toBe(700)
    })

    it('should reject unauthenticated requests', async () => {
      mockedGetServerSession.mockResolvedValue(null)

      const request = createMockRequest({
        method: 'POST',
        body: {
          listingId: listing.id,
          totalPrice: 700,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      })

      const response = await createCheckoutSession(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should prevent double booking', async () => {
      // Create existing reservation
      const prisma = getTestPrismaClient()
      await prisma.reservation.create({
        data: {
          userId: user.id,
          listingId: listing.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalPrice: 700,
          status: 'ACTIVE'
        }
      })

      const request = createMockRequest({
        method: 'POST',
        body: {
          listingId: listing.id,
          totalPrice: 700,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      })

      const response = await createCheckoutSession(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Listing is not available for these dates')
    })

    it('should validate required fields', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          listingId: listing.id,
          // Missing totalPrice, startDate, endDate
        }
      })

      const response = await createCheckoutSession(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    it('should reject unavailable listings', async () => {
      // Make listing unavailable
      const prisma = getTestPrismaClient()
      await prisma.listing.update({
        where: { id: listing.id },
        data: { available: false }
      })

      const request = createMockRequest({
        method: 'POST',
        body: {
          listingId: listing.id,
          totalPrice: 700,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      })

      const response = await createCheckoutSession(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Listing not found or not available')
    })
  })

  describe('Stripe Webhook Handler', () => {
    it('should update reservation to ACTIVE on successful payment', async () => {
      const prisma = getTestPrismaClient()
      
      // Create pending reservation
      const reservation = await prisma.reservation.create({
        data: {
          userId: user.id,
          listingId: listing.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalPrice: 700,
          status: 'PENDING'
        }
      })

      // Mock Stripe event
      const mockEvent = createMockStripeEvent('checkout.session.completed', {
        id: 'cs_test_123',
        payment_intent: 'pi_test_123',
        metadata: {
          userId: user.id,
          listingId: listing.id,
          reservationId: reservation.id
        }
      })

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent)

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature'
        },
        body: mockEvent
      })

      // Mock request.text() method
      (request as any).text = jest.fn().mockResolvedValue(JSON.stringify(mockEvent))

      const response = await handleStripeWebhook(request)

      expect(response.status).toBe(200)

      // Verify reservation was updated
      const updatedReservation = await prisma.reservation.findUnique({
        where: { id: reservation.id }
      })

      expect(updatedReservation?.status).toBe('ACTIVE')

      // Verify payment was created
      const payment = await prisma.payment.findFirst({
        where: { reservationId: reservation.id }
      })

      expect(payment).toBeTruthy()
      expect(payment?.status).toBe('SUCCEEDED')
      expect(payment?.stripeSessionId).toBe('cs_test_123')
      expect(payment?.stripePaymentIntentId).toBe('pi_test_123')
    })

    it('should reject webhook without valid signature', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid-signature'
        },
        body: {}
      })

      (request as any).text = jest.fn().mockResolvedValue('{}')

      const response = await handleStripeWebhook(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Webhook Error: Invalid signature')
    })

    it('should handle missing reservation gracefully', async () => {
      const mockEvent = createMockStripeEvent('checkout.session.completed', {
        id: 'cs_test_123',
        payment_intent: 'pi_test_123',
        metadata: {
          userId: user.id,
          listingId: listing.id,
          reservationId: 'non-existent-id'
        }
      })

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent)

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature'
        },
        body: mockEvent
      })

      (request as any).text = jest.fn().mockResolvedValue(JSON.stringify(mockEvent))

      const response = await handleStripeWebhook(request)

      expect(response.status).toBe(200) // Webhook should still succeed
    })

    it('should be idempotent for duplicate events', async () => {
      const prisma = getTestPrismaClient()
      
      // Create reservation and payment
      const reservation = await prisma.reservation.create({
        data: {
          userId: user.id,
          listingId: listing.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalPrice: 700,
          status: 'ACTIVE' // Already active
        }
      })

      await prisma.payment.create({
        data: {
          userId: user.id,
          listingId: listing.id,
          reservationId: reservation.id,
          stripeSessionId: 'cs_test_123',
          stripePaymentIntentId: 'pi_test_123',
          amount: 700,
          status: 'SUCCEEDED'
        }
      })

      const mockEvent = createMockStripeEvent('checkout.session.completed', {
        id: 'cs_test_123',
        payment_intent: 'pi_test_123',
        metadata: {
          userId: user.id,
          listingId: listing.id,
          reservationId: reservation.id
        }
      })

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent)

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'stripe-signature': 'test-signature'
        },
        body: mockEvent
      })

      (request as any).text = jest.fn().mockResolvedValue(JSON.stringify(mockEvent))

      const response = await handleStripeWebhook(request)

      expect(response.status).toBe(200)

      // Verify no duplicate payments were created
      const payments = await prisma.payment.findMany({
        where: { stripeSessionId: 'cs_test_123' }
      })

      expect(payments).toHaveLength(1)
    })
  })

  describe('Payment Status Check', () => {
    it('should return payment status for valid session', async () => {
      const prisma = getTestPrismaClient()
      
      // Create payment
      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          listingId: listing.id,
          reservationId: 'test-reservation-id',
          stripeSessionId: 'cs_test_123',
          stripePaymentIntentId: 'pi_test_123',
          amount: 700,
          status: 'SUCCEEDED'
        }
      })

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/payments/cs_test_123'
      })

      const response = await getPaymentStatus(request, { params: { sessionId: 'cs_test_123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('SUCCEEDED')
      expect(data.reservationId).toBe('test-reservation-id')
    })

    it('should return 404 for non-existent session', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/payments/non-existent'
      })

      const response = await getPaymentStatus(request, { params: { sessionId: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Payment not found')
    })
  })

  describe('Reservation Expiry', () => {
    it('should clean up expired pending reservations', async () => {
      const prisma = getTestPrismaClient()
      
      // Create expired pending reservation
      const expiredReservation = await prisma.reservation.create({
        data: {
          userId: user.id,
          listingId: listing.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalPrice: 700,
          status: 'PENDING',
          createdAt: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
        }
      })

      // Import and run the CRON job
      const { GET: expireReservations } = await import('@/app/api/cron/expire-reservations/route')
      
      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Cron-Secret': process.env.CRON_SECRET || 'test-cron-secret'
        }
      })

      const response = await expireReservations(request)

      expect(response.status).toBe(200)

      // Verify reservation was deleted
      const deletedReservation = await prisma.reservation.findUnique({
        where: { id: expiredReservation.id }
      })

      expect(deletedReservation).toBeNull()
    })
  })
})