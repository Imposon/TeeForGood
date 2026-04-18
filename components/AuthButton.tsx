'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, LogOut, Settings, Crown } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthModal } from './AuthModal'
import Link from 'next/link'

export function AuthButton() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-5 py-2.5 glass-card rounded-full font-medium text-white border border-white/20 hover:border-neon-cyan/50 hover:scale-105 active:scale-95 transition-all"
        >
          Sign In
        </button>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          defaultView="login"
        />
      </>
    )
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 glass-card rounded-full border border-white/20 hover:border-neon-cyan/50 hover:scale-102 active:scale-98 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-green flex items-center justify-center">
            <User size={16} className="text-dark-bg" />
          </div>
          <span className="text-white font-medium hidden sm:block">
            {user?.firstName}
          </span>
          {user?.subscriptionStatus === 'active' && (
            <Crown size={14} className="text-neon-gold" />
          )}
        </button>

        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl border border-white/10 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-white/10">
              <div className="font-medium text-white">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-white/50 truncate">{user?.email}</div>
            </div>
            
            <div className="p-2">
              <Link
                href="/dashboard"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings size={16} />
                Dashboard
              </Link>
              
              {user?.subscriptionStatus !== 'active' && (
                <Link
                  href="/pricing"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-neon-gold hover:bg-neon-gold/10 transition-colors"
                >
                  <Crown size={16} />
                  Upgrade
                </Link>
              )}
              
              <button
                onClick={() => {
                  logout()
                  setShowDropdown(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  )
}
