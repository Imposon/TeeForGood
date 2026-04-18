'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthModal } from './AuthModal'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireSubscription?: boolean
}

export function AuthGuard({ 
  children, 
  requireAuth = false,
  requireSubscription = false 
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      setShowAuthModal(true)
    }

    if (!isLoading && requireSubscription && isAuthenticated) {
      if (user?.subscriptionStatus !== 'active') {
        router.push('/pricing')
      }
    }
  }, [isLoading, requireAuth, requireSubscription, isAuthenticated, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <Loader2 size={40} className="animate-spin text-neon-cyan" />
      </div>
    )
  }

  // If auth is required but user is not authenticated, show modal
  if (requireAuth && !isAuthenticated) {
    return (
      <>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => {
            setShowAuthModal(false)
            // Redirect to home if they close the modal
            if (pathname !== '/') {
              router.push('/')
            }
          }}
          defaultView="login"
        />
      </>
    )
  }

  return (
    <>
      {children}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultView="login"
      />
    </>
  )
}
