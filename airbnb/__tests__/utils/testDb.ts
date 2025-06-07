import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

// Create a singleton instance for tests
let prisma: PrismaClient

export const getTestPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

// Clean up database after tests
export const cleanupDatabase = async () => {
  const prisma = getTestPrismaClient()
  
  // Delete in correct order to respect foreign key constraints
  await prisma.message.deleteMany({})
  await prisma.conversation.deleteMany({})
  await prisma.payment.deleteMany({})
  await prisma.reservation.deleteMany({})
  await prisma.listing.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.user.deleteMany({})
}

// Create test user
export const createTestUser = async (overrides?: Partial<{
  email: string
  name: string
  password: string
  isAdmin: boolean
}>) => {
  const prisma = getTestPrismaClient()
  
  const defaultData = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'Test123!',
    isAdmin: false,
    ...overrides
  }
  
  const hashedPassword = await bcrypt.hash(defaultData.password, 12)
  
  return prisma.user.create({
    data: {
      email: defaultData.email,
      name: defaultData.name,
      hashedPassword,
      isAdmin: defaultData.isAdmin
    }
  })
}

// Create test listing
export const createTestListing = async (userId: string, overrides?: Partial<{
  title: string
  description: string
  category: string
  conditionRating: number
  experienceLevel: number
  price: number
  location: string
  city: string
  state: string
  zipCode: string
  latitude: number
  longitude: number
}>) => {
  const prisma = getTestPrismaClient()
  
  const defaultData = {
    title: 'Test Violin',
    description: 'A beautiful test violin',
    category: 'violin',
    conditionRating: 8,
    experienceLevel: 3,
    price: 100,
    location: 'New York, NY 10001',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    latitude: 40.7128,
    longitude: -74.0060,
    imageSrc: ['https://example.com/image.jpg'],
    available: true,
    ...overrides
  }
  
  return prisma.listing.create({
    data: {
      ...defaultData,
      userId
    }
  })
}

// Create test reservation
export const createTestReservation = async (userId: string, listingId: string, overrides?: Partial<{
  startDate: Date
  endDate: Date
  totalPrice: number
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELED'
}>) => {
  const prisma = getTestPrismaClient()
  
  const defaultData = {
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    totalPrice: 700,
    status: 'ACTIVE' as const,
    ...overrides
  }
  
  return prisma.reservation.create({
    data: {
      ...defaultData,
      userId,
      listingId
    }
  })
}

// Create test payment
export const createTestPayment = async (userId: string, listingId: string, reservationId: string, overrides?: Partial<{
  stripeSessionId: string
  stripePaymentIntentId: string
  amount: number
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED'
}>) => {
  const prisma = getTestPrismaClient()
  
  const defaultData = {
    stripeSessionId: 'cs_test_' + Math.random().toString(36).substr(2, 9),
    stripePaymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    amount: 700,
    status: 'SUCCEEDED' as const,
    ...overrides
  }
  
  return prisma.payment.create({
    data: {
      ...defaultData,
      userId,
      listingId,
      reservationId
    }
  })
}

// Disconnect database after all tests
export const disconnectDatabase = async () => {
  const prisma = getTestPrismaClient()
  await prisma.$disconnect()
}