import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  )
}

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display validation error for empty fields', async () => {
    const mockSignIn = vi.fn()
    useAuth.mockReturnValue({ signIn: mockSignIn })

    renderLogin()
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument()
    })
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('should call signIn with correct credentials', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ error: null })
    useAuth.mockReturnValue({ signIn: mockSignIn })

    renderLogin()
    
    const emailInput = screen.getByPlaceholderText(/enter your email or username/i)
    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should display error message when sign in fails', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ 
      error: { message: 'Invalid credentials' } 
    })
    useAuth.mockReturnValue({ signIn: mockSignIn })

    renderLogin()
    
    const emailInput = screen.getByPlaceholderText(/enter your email or username/i)
    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
}) 