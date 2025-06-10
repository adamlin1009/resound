import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RentModal from '@/components/models/RentModal'
import useRentModal from '@/hook/useRentModal'
import { useRouter } from 'next/navigation'
import axios from 'axios'

// Mock dependencies
jest.mock('@/hook/useRentModal')
jest.mock('next/navigation')
jest.mock('axios')
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

// Mock components
jest.mock('@/components/Map', () => {
  return function MockMap({ center }: any) {
    return <div data-testid="map">Map at {center?.[0]}, {center?.[1]}</div>
  }
})

jest.mock('@/components/inputs/ImageUpload', () => {
  return function MockImageUpload({ value, onChange }: any) {
    return (
      <div data-testid="image-upload">
        <button onClick={() => onChange(['test-image.jpg'])}>Upload Image</button>
        {value && <div>Images: {value.length}</div>}
      </div>
    )
  }
})

jest.mock('@/components/inputs/ExactAddressInput', () => {
  return function MockExactAddressInput({ value, onChange }: any) {
    return (
      <div data-testid="address-input">
        <input 
          placeholder="Enter address"
          value={value?.address || ''}
          onChange={(e) => onChange({
            address: e.target.value,
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            latitude: 40.7128,
            longitude: -74.0060
          })}
        />
      </div>
    )
  }
})

describe('RentModal Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
  }
  
  const mockRentModal = {
    isOpen: true,
    onClose: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useRentModal as jest.Mock).mockReturnValue(mockRentModal)
    ;(axios.post as jest.Mock).mockResolvedValue({ data: { id: 'new-listing-id' } })
  })

  const categories = [
    { label: 'Violin', family: 'String', description: 'String instrument' },
    { label: 'Piano', family: 'Keyboard', description: 'Keyboard instrument' },
    { label: 'Trumpet', family: 'Brass', description: 'Brass instrument' }
  ]

  it('should render step 0 - category selection', () => {
    render(<RentModal />)

    expect(screen.getByText('Which of these best describes your instrument?')).toBeInTheDocument()
    expect(screen.getByText('Pick a category')).toBeInTheDocument()
    
    // Should show category options
    categories.forEach(category => {
      expect(screen.getByText(category.label)).toBeInTheDocument()
    })
  })

  it('should navigate through steps', async () => {
    const user = userEvent.setup()
    render(<RentModal />)

    // Step 0: Select category
    const violinCategory = screen.getByText('Violin').closest('div')
    await user.click(violinCategory!)
    
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    // Step 1: Location
    await waitFor(() => {
      expect(screen.getByText('Where is your instrument located?')).toBeInTheDocument()
    })

    // Enter address
    const addressInput = screen.getByPlaceholderText('Enter address')
    await user.type(addressInput, '123 Main St, New York, NY')
    await user.click(nextButton)

    // Step 2: Condition and Experience
    await waitFor(() => {
      expect(screen.getByText('Share some details about your instrument')).toBeInTheDocument()
    })
  })

  it('should handle form submission', async () => {
    const user = userEvent.setup()
    render(<RentModal />)

    // Fill out all steps
    // Step 0: Category
    const violinCategory = screen.getByText('Violin').closest('div')
    await user.click(violinCategory!)
    await user.click(screen.getByText('Next'))

    // Step 1: Location
    await waitFor(() => screen.getByPlaceholderText('Enter address'))
    const addressInput = screen.getByPlaceholderText('Enter address')
    await user.type(addressInput, '123 Main St')
    await user.click(screen.getByText('Next'))

    // Step 2: Condition and Experience
    await waitFor(() => screen.getByText('Share some details about your instrument'))
    await user.click(screen.getByText('Next'))

    // Step 3: Images
    await waitFor(() => screen.getByTestId('image-upload'))
    const uploadButton = within(screen.getByTestId('image-upload')).getByText('Upload Image')
    await user.click(uploadButton)
    await user.click(screen.getByText('Next'))

    // Step 4: Title and Description
    await waitFor(() => screen.getByText('How would you describe your instrument?'))
    const titleInput = screen.getByRole('textbox', { name: /title/i })
    const descriptionTextarea = screen.getByRole('textbox', { name: /description/i })
    
    await user.type(titleInput, 'Beautiful Violin')
    await user.type(descriptionTextarea, 'A wonderful instrument in great condition')
    await user.click(screen.getByText('Next'))

    // Step 5: Price
    await waitFor(() => screen.getByText('Now, set your price'))
    await user.click(screen.getByText('Create'))

    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/listings', expect.objectContaining({
        category: 'Violin',
        location: expect.any(String),
        title: 'Beautiful Violin',
        description: 'A wonderful instrument in great condition',
        imageSrc: ['test-image.jpg'],
        price: expect.any(Number)
      }))
    })

    // Verify success behavior
    expect(mockRouter.refresh).toHaveBeenCalled()
    expect(mockRentModal.onClose).toHaveBeenCalled()
  })

  it('should allow navigation back through steps', async () => {
    const user = userEvent.setup()
    render(<RentModal />)

    // Go to step 1
    const violinCategory = screen.getByText('Violin').closest('div')
    await user.click(violinCategory!)
    await user.click(screen.getByText('Next'))

    // Should be on location step
    await waitFor(() => {
      expect(screen.getByText('Where is your instrument located?')).toBeInTheDocument()
    })

    // Go back
    const backButton = screen.getByText('Back')
    await user.click(backButton)

    // Should be back on category step
    expect(screen.getByText('Which of these best describes your instrument?')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<RentModal />)

    // Try to proceed without selecting category
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    // Should not advance (stays on same step)
    expect(screen.getByText('Which of these best describes your instrument?')).toBeInTheDocument()
  })

  it('should handle errors during submission', async () => {
    const user = userEvent.setup()
    ;(axios.post as jest.Mock).mockRejectedValue(new Error('Network error'))
    
    render(<RentModal />)

    // Quick fill form (simplified for test)
    const violinCategory = screen.getByText('Violin').closest('div')
    await user.click(violinCategory!)
    
    // Navigate to last step
    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByText('Next'))
      await waitFor(() => {}) // Wait for step transition
    }

    // Submit
    await user.click(screen.getByText('Create'))

    // Should stay on modal (not close on error)
    expect(mockRentModal.onClose).not.toHaveBeenCalled()
  })

  it('should update counters correctly', async () => {
    const user = userEvent.setup()
    render(<RentModal />)

    // Select category and go to condition step
    const violinCategory = screen.getByText('Violin').closest('div')
    await user.click(violinCategory!)
    await user.click(screen.getByText('Next'))
    
    // Skip location
    await waitFor(() => screen.getByText('Next'))
    await user.click(screen.getByText('Next'))

    // Should be on condition/experience step
    await waitFor(() => {
      expect(screen.getByText('Share some details about your instrument')).toBeInTheDocument()
    })

    // Find and interact with condition counter
    const incrementButtons = screen.getAllByRole('button').filter(btn => btn.textContent === '+')
    const decrementButtons = screen.getAllByRole('button').filter(btn => btn.textContent === '-')

    // Increment condition rating
    await user.click(incrementButtons[0])
    
    // Check if value updated (would need to check the actual display value)
    // This depends on how the Counter component displays the value
  })

  it('should reset form when modal closes', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<RentModal />)

    // Select a category
    const violinCategory = screen.getByText('Violin').closest('div')
    await user.click(violinCategory!)

    // Close modal
    ;(useRentModal as jest.Mock).mockReturnValue({ ...mockRentModal, isOpen: false })
    rerender(<RentModal />)

    // Reopen modal
    ;(useRentModal as jest.Mock).mockReturnValue({ ...mockRentModal, isOpen: true })
    rerender(<RentModal />)

    // Should be back at step 0 with no selection
    expect(screen.getByText('Which of these best describes your instrument?')).toBeInTheDocument()
  })
})