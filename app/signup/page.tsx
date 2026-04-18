'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Signup() {
  const router = useRouter()
  const { signup } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })
      router.push('/pricing')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-dark-bg flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-dark-bg" />
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="glass-card p-8 rounded-2xl border border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full glass-card border border-neon-green/30">
              <Sparkles size={16} className="text-neon-green" />
              <span className="text-sm text-white/80">Join TeeForGood</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Your Account
            </h1>
            <p className="text-white/50">
              Start your journey to golf and giving
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/50 mb-2 block">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-green/50"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-2 block">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-green/50"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/50 mb-2 block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-green/50"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="text-sm text-white/50 mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-green/50"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 btn-neon rounded-xl font-semibold text-lg flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link href="/login" className="text-neon-cyan hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
