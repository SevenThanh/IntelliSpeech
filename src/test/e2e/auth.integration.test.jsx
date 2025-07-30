import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import Login from '../../components/auth/Login'
import ProtectedRoute from '../../components/ProtectedRoute'
import { supabase } from '../../config/supabase'

vi.mock('../../config/supabase')

const TestApp = () => (
  <BrowserRouter>
    <AuthProvider>
      <ProtectedRoute>
        <div>Protected Dashboard</div>
      </ProtectedRoute>
      <Login />
    </AuthProvider>
  </BrowserRouter>
)

describe('Authentication Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full authentication flow', async () => {
    // Mock successful authentication
    const mockUser = { id: '1', email: 'test@example.com' }
    
    supabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: null }
    })
    
    supabase.auth.onAuthStateChange = vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    
    supabase.auth.signInWithPassword = vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    render(<TestApp />)
    
    // Initially should show login form (protected route redirects)
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    
    // Fill login form
    const emailInput = screen.getByPlaceholderText(/enter your email or username/i)
    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    // Should call Supabase auth
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('should handle authentication errors gracefully', async () => {
    supabase.auth.signInWithPassword = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' }
    })

    render(<TestApp />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email or username/i)
    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument()
    })
  })
}) 