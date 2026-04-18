'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
  subscriptionStatus: string
  charityId?: string
  charityPercentage?: number
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await response.json()
    setState({
      user: data.user,
      isLoading: false,
      isAuthenticated: true,
    })
    return data.user
  }

  const signup = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    charityId?: string
    charityPercentage?: number
  }) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Signup failed')
    }

    const data = await response.json()
    setState({
      user: data.user,
      isLoading: false,
      isAuthenticated: true,
    })
    return data.user
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
    router.push('/')
  }

  return {
    ...state,
    login,
    signup,
    logout,
    refetch: fetchUser,
  }
}
