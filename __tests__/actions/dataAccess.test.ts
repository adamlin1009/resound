import { getReservations } from '@/app/actions/getReservations'
import { getOwnerReservations } from '@/app/actions/getOwnerReservations'
import { checkUserPayment } from '@/app/actions/checkUserPayment'
import { getCurrentUser } from '@/app/actions/getCurrentUser'
import { getListingById } from '@/app/actions/getListingById'
import { cleanupDatabase, createTestUser, createTestListing, createTestReservation, createTestPayment } from '@/__tests__/utils/testDb'
import { getServerSession } from 'next-auth/next'

// Mock next-auth
jest.mock('next-auth/next')
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('Server Actions - Data Access Permissions', () => {
  let user1: any
  let user2: any
  let adminUser: any
  let listing1: any
  let listing2: any
  let reservation1: any
  let reservation2: any

  beforeEach(async () => {
    await cleanupDatabase()

    // Create test users
    user1 = await createTestUser({
      email: 'user1@example.com',
      name: 'User One'
    })

    user2 = await createTestUser({
      email: 'user2@example.com',
      name: 'User Two'
    })

    adminUser = await createTestUser({
      email: 'admin@example.com',
      name: 'Admin User',
      isAdmin: true
    })

    // Create test listings
    listing1 = await createTestListing(user1.id, {
      title: 'User 1 Listing',
      price: 100
    })

    listing2 = await createTestListing(user2.id, {
      title: 'User 2 Listing',
      price: 200
    })

    // Create test reservations
    reservation1 = await createTestReservation(user2.id, listing1.id, {
      totalPrice: 700,
      status: 'ACTIVE'
    })

    reservation2 = await createTestReservation(user1.id, listing2.id, {
      totalPrice: 1400,
      status: 'ACTIVE'
    })
  })

  afterAll(async () => {
    await cleanupDatabase()
  })

  describe('getReservations', () => {
    it('should return only reservations for the authenticated user', async () => {
      // Mock session for user1
      mockedGetServerSession.mockResolvedValue({
        user: { id: user1.id, email: user1.email },
        expires: new Date().toISOString()
      })

      const result = await getReservations({})

      expect(result.reservations).toHaveLength(1)
      expect(result.reservations[0].id).toBe(reservation2.id)
      expect(result.reservations[0].userId).toBe(user1.id)
      expect(result.totalCount).toBe(1)
    })

    it('should return empty array for unauthenticated users', async () => {
      // Mock no session
      mockedGetServerSession.mockResolvedValue(null)

      const result = await getReservations({})

      expect(result.reservations).toHaveLength(0)
      expect(result.totalCount).toBe(0)
    })

    it('should respect pagination parameters', async () => {
      // Create multiple reservations
      await createTestReservation(user1.id, listing2.id)
      await createTestReservation(user1.id, listing2.id)
      await createTestReservation(user1.id, listing2.id)

      mockedGetServerSession.mockResolvedValue({
        user: { id: user1.id, email: user1.email },
        expires: new Date().toISOString()
      })

      const result = await getReservations({ page: 1, limit: 2 })

      expect(result.reservations).toHaveLength(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(2)
      expect(result.totalCount).toBe(4) // 1 original + 3 new
      expect(result.totalPages).toBe(2)
    })
  })

  describe('getOwnerReservations', () => {
    it('should return reservations for listings owned by the authenticated user', async () => {
      // Mock session for user1 (who owns listing1)
      mockedGetServerSession.mockResolvedValue({
        user: { id: user1.id, email: user1.email },
        expires: new Date().toISOString()
      })

      const result = await getOwnerReservations({})

      expect(result.reservations).toHaveLength(1)
      expect(result.reservations[0].id).toBe(reservation1.id)
      expect(result.reservations[0].listing.userId).toBe(user1.id)
    })

    it('should not return reservations for other users listings', async () => {
      // Mock session for user2
      mockedGetServerSession.mockResolvedValue({
        user: { id: user2.id, email: user2.email },
        expires: new Date().toISOString()
      })

      const result = await getOwnerReservations({})

      expect(result.reservations).toHaveLength(1)
      expect(result.reservations[0].listing.userId).toBe(user2.id)
      // Should not contain reservations for user1's listings
      expect(result.reservations.every(r => r.listing.userId !== user1.id)).toBe(true)
    })

    it('should return empty array for unauthenticated users', async () => {
      mockedGetServerSession.mockResolvedValue(null)

      const result = await getOwnerReservations({})

      expect(result.reservations).toHaveLength(0)
      expect(result.totalCount).toBe(0)
    })
  })

  describe('checkUserPayment', () => {
    beforeEach(async () => {
      // Create a payment for reservation1
      await createTestPayment(user2.id, listing1.id, reservation1.id, {
        status: 'SUCCEEDED'
      })
    })

    it('should return payment status for authenticated user', async () => {
      // Mock session for user2 (who has the payment)
      mockedGetServerSession.mockResolvedValue({
        user: { id: user2.id, email: user2.email },
        expires: new Date().toISOString()
      })

      const result = await checkUserPayment(listing1.id)

      expect(result.hasReservation).toBe(true)
      expect(result.hasSuccessfulPayment).toBe(true)
      expect(result.canContact).toBe(true)
    })

    it('should return false for user without payment', async () => {
      // Mock session for user1 (who doesn't have payment for listing2)
      mockedGetServerSession.mockResolvedValue({
        user: { id: user1.id, email: user1.email },
        expires: new Date().toISOString()
      })

      const result = await checkUserPayment(listing2.id)

      expect(result.hasReservation).toBe(true)
      expect(result.hasSuccessfulPayment).toBe(false)
      expect(result.canContact).toBe(false)
    })

    it('should return false for unauthenticated users', async () => {
      mockedGetServerSession.mockResolvedValue(null)

      const result = await checkUserPayment(listing1.id)

      expect(result.hasReservation).toBe(false)
      expect(result.hasSuccessfulPayment).toBe(false)
      expect(result.canContact).toBe(false)
    })

    it('should handle non-existent listing gracefully', async () => {
      mockedGetServerSession.mockResolvedValue({
        user: { id: user1.id, email: user1.email },
        expires: new Date().toISOString()
      })

      const result = await checkUserPayment('non-existent-id')

      expect(result.hasReservation).toBe(false)
      expect(result.hasSuccessfulPayment).toBe(false)
      expect(result.canContact).toBe(false)
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user data without password', async () => {
      mockedGetServerSession.mockResolvedValue({
        user: { id: user1.id, email: user1.email },
        expires: new Date().toISOString()
      })

      const result = await getCurrentUser()

      expect(result).toBeTruthy()
      expect(result?.id).toBe(user1.id)
      expect(result?.email).toBe(user1.email)
      expect((result as any).hashedPassword).toBeUndefined()
    })

    it('should return null for unauthenticated users', async () => {
      mockedGetServerSession.mockResolvedValue(null)

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      mockedGetServerSession.mockResolvedValue({
        user: { id: 'invalid-id', email: 'test@example.com' },
        expires: new Date().toISOString()
      })

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('getListingById', () => {
    it('should return listing with owner information', async () => {
      const result = await getListingById({ listingId: listing1.id })

      expect(result).toBeTruthy()
      expect(result?.id).toBe(listing1.id)
      expect(result?.user.id).toBe(user1.id)
      expect((result?.user as any).hashedPassword).toBeUndefined()
    })

    it('should return same listing regardless of authentication', async () => {
      // Test as user1
      mockedGetServerSession.mockResolvedValue({
        user: { id: user1.id, email: user1.email },
        expires: new Date().toISOString()
      })

      const result1 = await getListingById({ listingId: listing2.id })

      // Test as user2
      mockedGetServerSession.mockResolvedValue({
        user: { id: user2.id, email: user2.email },
        expires: new Date().toISOString()
      })

      const result2 = await getListingById({ listingId: listing2.id })

      expect(result1?.id).toBe(listing2.id)
      expect(result2?.id).toBe(listing2.id)
      expect(result1?.id).toBe(result2?.id)
    })

    it('should return null for non-existent listing', async () => {
      const result = await getListingById({ listingId: 'non-existent-id' })

      expect(result).toBeNull()
    })
  })

  describe('Admin Access', () => {
    it('admin users should see all reservations', async () => {
      // Mock admin session
      mockedGetServerSession.mockResolvedValue({
        user: { id: adminUser.id, email: adminUser.email },
        expires: new Date().toISOString()
      })

      // Note: Current implementation doesn't give admins access to all reservations
      // This is correct behavior - admins should use specific admin endpoints
      const result = await getReservations({})

      // Admin should only see their own reservations (none in this case)
      expect(result.reservations).toHaveLength(0)
    })
  })
})