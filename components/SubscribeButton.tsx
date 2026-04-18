'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { CreditCard, Loader2, Crown, Zap, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthModal } from './AuthModal'

interface SubscribeButtonProps {
  plan?: 'monthly' | 'yearly'
  variant?: 'default' | 'small' | 'nav'
  className?: string
}

export function SubscribeButton({ 
  plan = 'monthly', 
  variant = 'default',
  className = '' 
}: SubscribeButtonProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSubscribe = async () => {
    // If not logged in, show auth modal
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    // If already subscribed, go to dashboard
    if (user?.subscriptionStatus === 'active') {
      router.push('/dashboard')
      return
    }

    // Start checkout
    setIsLoading(true)
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else if (data.error) {
        console.error('Checkout error:', data.error)
        alert(data.error)
      }
    } catch (error) {
      console.error('Failed to start checkout:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Determine button content based on user state
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Processing...</span>
        </>
      )
    }

    if (!isAuthenticated) {
      return (
        <>
          <CreditCard size={18} />
          <span>Subscribe Now</span>
        </>
      )
    }

    if (user?.subscriptionStatus === 'active') {
      return (
        <>
          <CheckCircle size={18} />
          <span>Subscribed</span>
        </>
      )
    }

    if (plan === 'yearly') {
      return (
        <>
          <Crown size={18} />
          <span>Get Yearly - Save 21%</span>
        </>
      )
    }

    return (
      <>
        <Zap size={18} />
        <span>Subscribe Now - $19/month</span>
      </>
    )
  }

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'small':
        return 'px-4 py-2 text-sm'
      case 'nav':
        return 'px-5 py-2.5 text-sm rounded-full'
      default:
        return 'px-8 py-4 text-lg rounded-xl'
    }
  }

  const isSubscribed = user?.subscriptionStatus === 'active'

  return (
    <>
      <motion.button
        onClick={handleSubscribe}
        disabled={isLoading || isSubscribed}
        className={`
          ${getVariantStyles()}
          ${isSubscribed 
            ? 'bg-neon-green/20 text-neon-green border border-neon-green/30 cursor-default' 
            : 'bg-gradient-to-r from-neon-gold to-orange-500 text-dark-bg font-semibold shadow-lg shadow-neon-gold/25 hover:shadow-neon-gold/40'
          }
          flex items-center justify-center gap-2 transition-all disabled:opacity-70
          ${className}
        `}
        whileHover={!isSubscribed ? { scale: 1.02 } : {}}
        whileTap={!isSubscribed ? { scale: 0.98 } : {}}
      >
        {getButtonContent()}
      </motion.button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultView="signup"
      />
    </>
  )
}

// Standalone component for pricing cards
export function PricingCard({ 
  plan, 
  price, 
  period, 
  features, 
  popular = false 
}: { 
  plan: 'monthly' | 'yearly'
  price: number
  period: string
  features: string[]
  popular?: boolean
}) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    if (user?.subscriptionStatus === 'active') {
      router.push('/dashboard')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isSubscribed = user?.subscriptionStatus === 'active'

  return (
    <>
      <div className={`glass-card p-8 rounded-2xl border ${popular ? 'border-neon-gold/50' : 'border-white/10'} relative`}>
        {popular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1 bg-gradient-to-r from-neon-gold to-orange-500 text-dark-bg text-sm font-bold rounded-full">
              Most Popular
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl ${plan === 'yearly' ? 'bg-neon-gold/20' : 'bg-neon-cyan/20'} flex items-center justify-center`}>
            {plan === 'yearly' ? <Crown size={24} className="text-neon-gold" /> : <Zap size={24} className="text-neon-cyan" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white capitalize">{plan}</h3>
            <p className="text-sm text-white/50">{plan === 'yearly' ? 'Save 21%' : 'Monthly billing'}</p>
          </div>
        </div>

        <div className="mb-6">
          <span className="text-4xl font-bold text-white">${price}</span>
          <span className="text-white/50">/{period}</span>
          {plan === 'yearly' && (
            <p className="text-neon-gold text-sm mt-1">$48 savings per year</p>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-white/70">
              <CheckCircle size={18} className="text-neon-green" />
              {feature}
            </li>
          ))}
        </ul>

        <motion.button
          onClick={handleSubscribe}
          disabled={isLoading || isSubscribed}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            isSubscribed
              ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
              : popular
                ? 'bg-gradient-to-r from-neon-gold to-orange-500 text-dark-bg'
                : 'glass-card border border-white/20 text-white hover:border-neon-cyan/50'
          } disabled:opacity-50`}
          whileHover={!isSubscribed ? { scale: 1.02 } : {}}
          whileTap={!isSubscribed ? { scale: 0.98 } : {}}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Processing...
            </span>
          ) : isSubscribed ? (
            'Already Subscribed'
          ) : (
            'Subscribe Now'
          )}
        </motion.button>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultView="signup"
      />
    </>
  )
}
