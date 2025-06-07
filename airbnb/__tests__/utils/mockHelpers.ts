import { NextRequest } from 'next/server'
import { Session } from 'next-auth'

// Mock NextRequest for API route testing
export const createMockRequest = (options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: any
  searchParams?: Record<string, string>
}): NextRequest => {
  const { 
    method = 'GET', 
    url = 'http://localhost:3000', 
    headers = {}, 
    body, 
    searchParams = {} 
  } = options
  
  const urlWithParams = new URL(url)
  Object.entries(searchParams).forEach(([key, value]) => {
    urlWithParams.searchParams.set(key, value)
  })
  
  const request = new NextRequest(urlWithParams.toString(), {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  })
  
  // Mock json() method
  if (body) {
    ;(request as any).json = async () => body
  }
  
  return request
}

// Mock session for authenticated requests
export const createMockSession = (overrides?: Partial<Session>): Session => {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      ...overrides?.user
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    ...overrides
  }
}

// Mock Stripe webhook event
export const createMockStripeEvent = (type: string, data: any) => {
  return {
    id: 'evt_test_' + Math.random().toString(36).substr(2, 9),
    object: 'event',
    type,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: data
    }
  }
}

// Mock form data for multipart requests
export const createMockFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach(item => formData.append(key, item))
    } else {
      formData.append(key, String(value))
    }
  })
  return formData
}

// Mock successful API response
export const mockSuccessResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

// Mock error API response
export const mockErrorResponse = (error: string, code: string, status = 400) => {
  return new Response(JSON.stringify({ error, code }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}