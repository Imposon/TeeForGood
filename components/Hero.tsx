'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Target, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Hero() {
  const router = useRouter()
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/20 rounded-full blur-[128px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass-card border border-neon-green/30"
            >
              <Sparkles size={16} className="text-neon-green" />
              <span className="text-sm text-white/80">New: Weekly Mega Draws</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-white">Track.</span>
              <br />
              <span className="text-white">Win.</span>
              <br />
              <span className="gradient-text">Change Lives.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg sm:text-xl text-white/60 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Transform your golf game into charitable impact. Every swing counts. 
              Every donation multiplies. Every win creates hope.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={() => router.push('/pricing')}
                className="group flex items-center justify-center gap-2 px-8 py-4 btn-neon rounded-full font-semibold text-lg hover:scale-105 active:scale-95 transition-transform"
              >
                Subscribe Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => router.push('/#rewards')}
                className="flex items-center justify-center gap-2 px-8 py-4 glass-card rounded-full font-medium text-lg text-white/80 hover:text-white hover:scale-105 active:scale-95 transition-all"
              >
                <Target size={20} />
                See How It Works
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start"
            >
              {[
                { value: '$2.4M+', label: 'Donated' },
                { value: '15K+', label: 'Members' },
                { value: '500+', label: 'Winners' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right content - 3D visual placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 right-0 p-4 glass-card rounded-xl border border-neon-green/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
                    <Heart size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Latest Donation</div>
                    <div className="text-lg font-semibold">$1,240</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-20 left-0 p-4 glass-card rounded-xl border border-neon-gold/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-gold to-orange-400 flex items-center justify-center">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Weekly Draw</div>
                    <div className="text-lg font-semibold">$5,000 Prize</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-1/2 right-10 p-4 glass-card rounded-xl border border-neon-cyan/20"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text">74</div>
                  <div className="text-sm text-white/60">Your Best Score</div>
                </div>
              </motion.div>

              {/* Center glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-gradient-to-r from-neon-green/30 via-neon-cyan/30 to-neon-gold/30 rounded-full blur-[60px] animate-pulse-slow" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
