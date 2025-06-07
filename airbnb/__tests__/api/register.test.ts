import { POST } from '@/app/api/register/route'
import { createMockRequest } from '@/__tests__/utils/mockHelpers'
import { cleanupDatabase, getTestPrismaClient, createTestUser } from '@/__tests__/utils/testDb'
import bcrypt from 'bcrypt'

describe('/api/register', () => {
  beforeEach(async () => {
    await cleanupDatabase()
  })

  afterAll(async () => {
    await cleanupDatabase()
    const prisma = getTestPrismaClient()
    await prisma.$disconnect()
  })

  describe('Input Validation', () => {
    it('should reject missing email', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          name: 'Test User',
          password: 'Test123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email, name, and password are required')
    })

    it('should reject missing name', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'Test123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email, name, and password are required')
    })

    it('should reject missing password', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'test@example.com',
          name: 'Test User'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email, name, and password are required')
    })

    it('should reject invalid email format', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'notanemail',
          name: 'Test User',
          password: 'Test123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid email format')
    })

    it('should reject short passwords', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'Test1!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number')
    })

    it('should reject password without uppercase', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'testtest123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number')
    })

    it('should reject password without lowercase', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'TESTTEST123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number')
    })

    it('should reject password without number', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'TestTestTest!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number')
    })

    it('should reject name too short', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'test@example.com',
          name: 'T',
          password: 'Test123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Name must be between 2 and 50 characters')
    })

    it('should reject name too long', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'test@example.com',
          name: 'A'.repeat(51),
          password: 'Test123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Name must be between 2 and 50 characters')
    })
  })

  describe('Registration Flow', () => {
    it('should successfully register a new user', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'newuser@example.com',
          name: 'New User',
          password: 'Test123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        email: 'newuser@example.com',
        name: 'New User',
        isAdmin: false
      })
      expect(data.id).toBeDefined()
      expect(data.hashedPassword).toBeUndefined()

      // Verify user was created in database
      const prisma = getTestPrismaClient()
      const user = await prisma.user.findUnique({
        where: { email: 'newuser@example.com' }
      })
      expect(user).toBeTruthy()
      expect(await bcrypt.compare('Test123!', user!.hashedPassword!)).toBe(true)
    })

    it('should normalize email to lowercase', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'TestUser@Example.COM',
          name: 'Test User',
          password: 'Test123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.email).toBe('testuser@example.com')
    })

    it('should reject duplicate email registration', async () => {
      // Create existing user
      await createTestUser({
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'Test123!'
      })

      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'existing@example.com',
          name: 'New User',
          password: 'Test123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('User with this email already exists')
      expect(data.code).toBe('USER_EXISTS')
    })

    it('should handle case-insensitive duplicate check', async () => {
      // Create existing user
      await createTestUser({
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'Test123!'
      })

      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'EXISTING@EXAMPLE.COM',
          name: 'New User',
          password: 'Test123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('User with this email already exists')
    })
  })

  describe('Security', () => {
    it('should not return hashedPassword in response', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'security@example.com',
          name: 'Security Test',
          password: 'Test123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.hashedPassword).toBeUndefined()
      expect(data.password).toBeUndefined()
    })

    it('should hash password with bcrypt', async () => {
      const plainPassword = 'Test123!'
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'hash@example.com',
          name: 'Hash Test',
          password: plainPassword
        }
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      const prisma = getTestPrismaClient()
      const user = await prisma.user.findUnique({
        where: { email: 'hash@example.com' }
      })

      expect(user?.hashedPassword).not.toBe(plainPassword)
      expect(user?.hashedPassword).toMatch(/^\$2[ayb]\$.{56}$/) // bcrypt hash pattern
      expect(await bcrypt.compare(plainPassword, user!.hashedPassword!)).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock prisma to throw an error
      const prisma = getTestPrismaClient()
      const originalCreate = prisma.user.create
      prisma.user.create = jest.fn().mockRejectedValue(new Error('Database error'))

      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'error@example.com',
          name: 'Error Test',
          password: 'Test123!'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
      expect(data.code).toBe('INTERNAL_ERROR')

      // Restore original method
      prisma.user.create = originalCreate
    })

    it('should handle malformed JSON gracefully', async () => {
      const request = new Request('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request body')
    })
  })
})