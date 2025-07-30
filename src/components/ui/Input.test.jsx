import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Input from './Input'

describe('Input Component', () => {
  it('should render with label and placeholder', () => {
    render(
      <Input 
        label="Email" 
        placeholder="Enter your email" 
        value="" 
        onChange={vi.fn()} 
      />
    )
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
  })

  it('should display error message when error prop is provided', () => {
    render(
      <Input 
        label="Email" 
        value="" 
        onChange={vi.fn()} 
        error="Email is required" 
      />
    )
    
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toHaveClass('border-red-300')
  })

  it('should call onChange when input value changes', () => {
    const handleChange = vi.fn()
    render(<Input value="" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('should render different input types correctly', () => {
    render(<Input type="password" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'password')
  })
}) 