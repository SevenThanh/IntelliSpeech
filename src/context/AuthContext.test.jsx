import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { supabase } from '../config/supabase'

vi.mock('../config/supabase')

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide authentication functions', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current).toHaveProperty('signIn')
    expect(result.current).toHaveProperty('signUp')
    expect(result.current).toHaveProperty('signOut')
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('loading')
  })

  it('should handle sign in with email', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ 
      data: { user: { id: '1', email: 'test@example.com' } }, 
      error: null 
    })
    supabase.auth.signInWithPassword = mockSignIn

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'password')
      expect(response.error).toBeNull()
    })
    
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
  })

  it('should handle sign in with username', async () => {
    const mockFromMethod = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { email: 'test@example.com' },
            error: null
          })
        })
      })
    })
    supabase.from = mockFromMethod
    
    const mockSignIn = vi.fn().mockResolvedValue({ 
      data: { user: { id: '1', email: 'test@example.com' } }, 
      error: null 
    })
    supabase.auth.signInWithPassword = mockSignIn

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.signIn('testuser', 'password')
    })
    
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
  })
}) 