'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Monthly',
    price: 19,
    period: 'month',
    description: 'Perfect for getting started',
    icon: Zap,
    color: 'neon-cyan',
    features: [
      'Track up to 5 golf scores',
      'Enter monthly draws',
      'Choose your charity',
      'Win real cash prizes',
      'Cancel anytime',
    ],
    priceId: 'monthly',
  },
  {
    name: 'Yearly',
    price: 15,
    period: 'month',
    description: 'Best value - Save 21%',
    icon: Crown,
    color: 'neon-gold',
    popular: true,
    features: [
      'Track up to 5 golf scores',
      'Enter monthly draws',
      'Choose your charity',
      'Win real cash prizes',
      'Priority support',
      'Early access to new features',
    ],
    priceId: 'yearly',
    savings: '$48/year',
  },
]

export default function Pricing() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (planType: string) => {
    setIsLoading(planType)
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planType }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-dark-bg">
      {/* Background */}
      <div className="fixed inset-0 bg-dark-bg" />
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-gold/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass-card border border-neon-gold/30"
          >
            <Sparkles size={16} className="text-neon-gold" />
            <span className="text-sm text-white/80">Simple, transparent pricing</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            <span className="text-white">Choose Your </span>
            <span className="gradient-text">Plan</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/50 max-w-2xl mx-auto"
          >
            Every subscription supports charities worldwide. Track your golf scores, enter draws, and make a difference.
          </motion.p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`glass-card rounded-2xl p-8 border ${
                plan.popular ? 'border-neon-gold/50' : 'border-white/10'
              } relative`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-neon-gold to-orange-500 text-dark-bg text-sm font-bold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${plan.color}/20 flex items-center justify-center`}>
                  <plan.icon size={24} className={`text-${plan.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-white/50">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-white/50">/{plan.period}</span>
                {plan.savings && (
                  <p className="text-neon-gold text-sm mt-1">Save {plan.savings}</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <Check size={18} className="text-neon-green" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={isLoading === plan.priceId}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  plan.popular
                    ? 'bg-gradient-to-r from-neon-gold to-orange-500 text-dark-bg'
                    : 'glass-card border border-white/20 text-white hover:border-neon-cyan/50'
                } disabled:opacity-50`}
              >
                {isLoading === plan.priceId ? 'Loading...' : 'Subscribe Now'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-white/50">
            Already have an account?{' '}
            <Link href="/login" className="text-neon-cyan hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
