import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../context/AuthContext'

vi.mock('../context/AuthContext')

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ProtectedRoute Component', () => {
  it('should show loading when auth is loading', () => {
    useAuth.mockReturnValue({ user: null, loading: true })
    
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should render children when user is authenticated', () => {
    useAuth.mockReturnValue({ 
      user: { id: '1', email: 'test@example.com' }, 
      loading: false 
    })
    
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText(/protected content/i)).toBeInTheDocument()
  })

  it('should redirect to login when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null, loading: false })
    
    // Mock useNavigate would be needed for full test
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
  })
}) 