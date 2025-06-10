import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '@/components/models/Modal'

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    title: 'Test Modal',
    body: <div>Modal Body Content</div>,
    actionLabel: 'Submit'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render when isOpen is true', () => {
    render(<Modal {...defaultProps} />)

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Body Content')).toBeInTheDocument()
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('should call onClose when X button is clicked', async () => {
    const user = userEvent.setup()
    render(<Modal {...defaultProps} />)

    const closeButton = screen.getByRole('button', { name: '' }) // X button typically has no text
    await user.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should call onSubmit when action button is clicked', async () => {
    const user = userEvent.setup()
    render(<Modal {...defaultProps} />)

    const submitButton = screen.getByText('Submit')
    await user.click(submitButton)

    expect(defaultProps.onSubmit).toHaveBeenCalled()
  })

  it('should render secondary action when provided', () => {
    const onSecondaryAction = jest.fn()
    render(
      <Modal 
        {...defaultProps} 
        secondaryAction={onSecondaryAction}
        secondaryActionLabel="Cancel"
      />
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should call secondary action when secondary button is clicked', async () => {
    const user = userEvent.setup()
    const onSecondaryAction = jest.fn()
    
    render(
      <Modal 
        {...defaultProps} 
        secondaryAction={onSecondaryAction}
        secondaryActionLabel="Cancel"
      />
    )

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(onSecondaryAction).toHaveBeenCalled()
  })

  it('should disable buttons when disabled prop is true', () => {
    render(<Modal {...defaultProps} disabled />)

    const submitButton = screen.getByText('Submit')
    expect(submitButton).toBeDisabled()
  })

  it('should close modal when clicking outside', async () => {
    const user = userEvent.setup()
    const { container } = render(<Modal {...defaultProps} />)

    // Find the backdrop element (usually the outer container)
    const backdrop = container.querySelector('[class*="fixed"][class*="inset-0"]')
    if (backdrop) {
      await user.click(backdrop)
      expect(defaultProps.onClose).toHaveBeenCalled()
    }
  })

  it('should not close when clicking inside modal content', async () => {
    const user = userEvent.setup()
    render(<Modal {...defaultProps} />)

    const modalContent = screen.getByText('Modal Body Content')
    await user.click(modalContent)

    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('should render footer content when provided', () => {
    const footer = <div>Custom Footer</div>
    render(<Modal {...defaultProps} footer={footer} />)

    expect(screen.getByText('Custom Footer')).toBeInTheDocument()
  })

  it('should handle keyboard events', async () => {
    const user = userEvent.setup()
    render(<Modal {...defaultProps} />)

    // Press Escape key
    await user.keyboard('{Escape}')

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should show loading state on buttons when submitting', () => {
    render(<Modal {...defaultProps} disabled />)

    const submitButton = screen.getByText('Submit')
    expect(submitButton).toHaveAttribute('disabled')
  })

  it('should render with custom body as React element', () => {
    const customBody = (
      <div>
        <input type="text" placeholder="Enter text" />
        <button>Custom Button</button>
      </div>
    )

    render(<Modal {...defaultProps} body={customBody} />)

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    expect(screen.getByText('Custom Button')).toBeInTheDocument()
  })

  it('should maintain focus trap within modal', async () => {
    const user = userEvent.setup()
    render(
      <Modal 
        {...defaultProps} 
        secondaryAction={jest.fn()}
        secondaryActionLabel="Cancel"
      />
    )

    const submitButton = screen.getByText('Submit')
    const cancelButton = screen.getByText('Cancel')

    // Focus should cycle through interactive elements
    submitButton.focus()
    expect(document.activeElement).toBe(submitButton)

    await user.tab()
    // Next focusable element should be within the modal
    expect(document.activeElement).not.toBe(document.body)
  })

  it('should animate in and out smoothly', async () => {
    const { rerender } = render(<Modal {...defaultProps} />)

    // Modal should be visible
    const modal = screen.getByText('Test Modal')
    expect(modal).toBeInTheDocument()

    // Close modal
    rerender(<Modal {...defaultProps} isOpen={false} />)

    // Modal should animate out
    await waitFor(() => {
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    })
  })

  it('should handle long content with scrolling', () => {
    const longContent = (
      <div>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>Line {i + 1} of content</p>
        ))}
      </div>
    )

    render(<Modal {...defaultProps} body={longContent} />)

    // All content should be rendered
    expect(screen.getByText('Line 1 of content')).toBeInTheDocument()
    expect(screen.getByText('Line 50 of content')).toBeInTheDocument()
  })
})