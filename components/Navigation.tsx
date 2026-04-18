'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Trophy, Heart, Gift, BarChart3 } from 'lucide-react'
import { AuthButton } from './AuthButton'
import { SubscribeButton } from './SubscribeButton'
import Link from 'next/link'

const navItems = [
  { label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
  { label: 'Impact', icon: Heart, href: '/#charity' },
  { label: 'Rewards', icon: Gift, href: '/#rewards' },
  { label: 'Winners', icon: Trophy, href: '/#winners' },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3 bg-dark-bg/80 backdrop-blur-xl border-b border-white/5'
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-green to-neon-cyan rounded-xl rotate-45 scale-75" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                </div>
                <span className="text-xl font-bold gradient-text hidden sm:block">
                  TeeForGood
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <motion.div
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Auth Button */}
            <div className="hidden md:block">
              <AuthButton />
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-white/70 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[72px] z-40 md:hidden"
          >
            <div className="mx-4 p-4 glass-card rounded-2xl border border-white/10">
              <div className="flex flex-col gap-2">
                {navItems.map((item, index) => (
                  <Link key={item.label} href={item.href}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon size={20} className="text-neon-green" />
                      {item.label}
                    </motion.div>
                  </Link>
                ))}
                <div className="mt-2 px-4">
                  <AuthButton />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
