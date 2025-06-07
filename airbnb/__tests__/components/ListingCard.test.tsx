import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListingCard from '@/components/listing/ListingCard'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

// Mock Next.js navigation
jest.mock('next/navigation')
const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn()
}
;(useRouter as jest.Mock).mockReturnValue(mockRouter)

// Mock HeartButton component
jest.mock('@/components/HeartButton', () => {
  return function MockHeartButton({ listingId, currentUser }: any) {
    return (
      <button 
        data-testid="heart-button"
        onClick={(e) => e.stopPropagation()}
      >
        Favorite
      </button>
    )
  }
})

describe('ListingCard Component', () => {
  const mockListing = {
    id: 'test-listing-id',
    title: 'Beautiful Violin',
    category: 'violin',
    imageSrc: ['https://example.com/violin.jpg'],
    price: 100,
    city: 'New York',
    state: 'NY',
    conditionRating: 8,
    experienceLevel: 3,
    userId: 'owner-id',
    createdAt: new Date().toISOString(),
    location: 'New York, NY',
    description: 'Test description',
    zipCode: '10001',
    latitude: 40.7128,
    longitude: -74.0060,
    available: true
  }

  const mockReservation = {
    id: 'reservation-id',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-07'),
    listingId: 'test-listing-id',
    userId: 'user-id',
    totalPrice: 700,
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString()
  }

  const mockCurrentUser = {
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emailVerified: null,
    image: null,
    isAdmin: false,
    favoriteIds: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render listing information correctly', () => {
    render(
      <ListingCard 
        data={mockListing}
      />
    )

    expect(screen.getByText('Beautiful Violin')).toBeInTheDocument()
    expect(screen.getByText('New York, NY')).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
    expect(screen.getByText(/night/)).toBeInTheDocument()
    expect(screen.getByText('Condition: 8/10')).toBeInTheDocument()
    expect(screen.getByText('Level: 3/5')).toBeInTheDocument()
  })

  it('should navigate to listing detail page on click', async () => {
    const user = userEvent.setup()
    
    render(
      <ListingCard 
        data={mockListing}
      />
    )

    const card = screen.getByRole('article')
    await user.click(card)

    expect(mockPush).toHaveBeenCalledWith('/listings/test-listing-id')
  })

  it('should display reservation dates when provided', () => {
    render(
      <ListingCard 
        data={mockListing}
        reservation={mockReservation}
      />
    )

    const formattedDate = format(new Date('2024-01-01'), 'PP')
    expect(screen.getByText(new RegExp(formattedDate))).toBeInTheDocument()
  })

  it('should show heart button when user is logged in', () => {
    render(
      <ListingCard 
        data={mockListing}
        currentUser={mockCurrentUser}
      />
    )

    expect(screen.getByTestId('heart-button')).toBeInTheDocument()
  })

  it('should not show heart button when user is not logged in', () => {
    render(
      <ListingCard 
        data={mockListing}
      />
    )

    expect(screen.queryByTestId('heart-button')).not.toBeInTheDocument()
  })

  it('should handle action button clicks', async () => {
    const mockAction = jest.fn()
    const user = userEvent.setup()

    render(
      <ListingCard 
        data={mockListing}
        actionLabel="Reserve"
        onAction={mockAction}
      />
    )

    const actionButton = screen.getByText('Reserve')
    await user.click(actionButton)

    expect(mockAction).toHaveBeenCalledWith('test-listing-id')
    expect(mockPush).not.toHaveBeenCalled() // Should not navigate when clicking action
  })

  it('should disable card and action when specified', () => {
    render(
      <ListingCard 
        data={mockListing}
        actionLabel="Reserve"
        onAction={jest.fn()}
        disabled
      />
    )

    const actionButton = screen.getByText('Reserve')
    expect(actionButton).toBeDisabled()
  })

  it('should display price correctly for different reservation durations', () => {
    const multiDayReservation = {
      ...mockReservation,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-10'), // 9 nights
      totalPrice: 900
    }

    render(
      <ListingCard 
        data={mockListing}
        reservation={multiDayReservation}
      />
    )

    expect(screen.getByText('$900')).toBeInTheDocument()
  })

  it('should handle image loading errors gracefully', () => {
    const listingWithBadImage = {
      ...mockListing,
      imageSrc: ['https://example.com/bad-image.jpg']
    }

    render(
      <ListingCard 
        data={listingWithBadImage}
      />
    )

    const image = screen.getByRole('img')
    fireEvent.error(image)

    // Component should still render without crashing
    expect(screen.getByText('Beautiful Violin')).toBeInTheDocument()
  })

  it('should prevent event bubbling on action button click', async () => {
    const mockAction = jest.fn()
    const user = userEvent.setup()

    render(
      <ListingCard 
        data={mockListing}
        actionLabel="Cancel"
        onAction={mockAction}
      />
    )

    const actionButton = screen.getByText('Cancel')
    await user.click(actionButton)

    expect(mockAction).toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should apply correct styling for disabled state', () => {
    const { container } = render(
      <ListingCard 
        data={mockListing}
        disabled
      />
    )

    const card = container.querySelector('[class*="opacity-"]')
    expect(card).toBeInTheDocument()
  })
})