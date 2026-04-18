'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Sparkles, Star, Zap } from 'lucide-react'

export function CTASection() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-neon-green/10 via-neon-cyan/10 to-neon-gold/10 rounded-full blur-[150px]" />
      
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto relative"
      >
        <div className="glass-card p-8 sm:p-12 lg:p-16 rounded-3xl border border-white/10 text-center relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-32 h-32 bg-neon-green/20 rounded-full blur-[50px] animate-pulse-slow" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-neon-cyan/20 rounded-full blur-[60px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-10 w-24 h-24 bg-neon-gold/20 rounded-full blur-[40px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10"
            >
              <Sparkles size={16} className="text-neon-gold" />
              <span className="text-sm text-white/80">Join 15,000+ Members</span>
              <Star size={14} className="text-neon-gold" />
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              <span className="text-white">Ready to Make Your </span>
              <span className="gradient-text">Golf Game</span>
              <br className="hidden sm:block" />
              <span className="text-white"> Matter?</span>
            </motion.h2>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-white/50 mb-8 max-w-2xl mx-auto"
            >
              Subscribe today and transform every round into an opportunity to win rewards 
              and change lives. Your first month is risk-free.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-neon-green to-neon-cyan text-dark-bg font-bold rounded-full text-lg shadow-lg shadow-neon-green/20"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 40px rgba(0, 255, 136, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe Now - $19/month
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                className="flex items-center justify-center gap-2 px-8 py-4 glass-card rounded-full font-medium text-lg text-white/80 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap size={20} className="text-neon-cyan" />
                View Pricing Plans
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t border-white/10"
            >
              {[
                'Cancel Anytime',
                'Secure Payment',
                '24/7 Support',
                'Money Back Guarantee'
              ].map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-sm text-white/50">
                  <div className="w-2 h-2 rounded-full bg-neon-green" />
                  {badge}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
