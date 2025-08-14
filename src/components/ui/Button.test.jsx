import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button Component', () => {
  it('should render with correct text and variant', () => {
    render(<Button variant="primary">Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-600', 'text-white')
  })

  it('should render secondary variant correctly', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    
    const button = screen.getByRole('button', { name: /secondary button/i })
    expect(button).toHaveClass('bg-white', 'text-blue-600', 'border-blue-600')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
  })
}) 