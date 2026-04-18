'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { TrendingUp, Heart, Gift, Calendar, Trophy, ArrowUpRight } from 'lucide-react'

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

const cards = [
  {
    title: 'Latest Scores',
    icon: TrendingUp,
    color: 'neon-green',
    gradient: 'from-neon-green to-neon-cyan',
    stats: [
      { label: 'Last Round', value: 78 },
      { label: 'Best Score', value: 74 },
      { label: 'Avg Score', value: 81 },
    ],
    trend: '+3 better',
  },
  {
    title: 'Charity Impact',
    icon: Heart,
    color: 'neon-cyan',
    gradient: 'from-neon-cyan to-blue-500',
    stats: [
      { label: 'Total Donated', value: '$1,240', isAnimated: true },
      { label: 'Charities', value: 4 },
      { label: 'Lives Impacted', value: '50+', isAnimated: true },
    ],
    trend: 'This month: $120',
  },
  {
    title: 'Draw Participation',
    icon: Gift,
    color: 'neon-gold',
    gradient: 'from-neon-gold to-orange-500',
    stats: [
      { label: 'Entries', value: 24 },
      { label: 'Win Rate', value: '12%' },
      { label: 'Winnings', value: '$350', isAnimated: true },
    ],
    trend: 'Next draw: 2 days',
  },
]

export function DashboardPreview() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })

  return (
    <section id="dashboard" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass-card border border-neon-cyan/30"
          >
            <Calendar size={16} className="text-neon-cyan" />
            <span className="text-sm text-white/80">Your Dashboard Preview</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">Your </span>
            <span className="gradient-text">Performance</span>
            <span className="text-white">, Visualized</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Track your golf scores, see your charitable impact, and monitor your draw participation 
            all in one beautiful, intuitive dashboard.
          </p>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="glass-card glass-card-hover p-6 rounded-2xl border border-white/10 group cursor-pointer"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                    <card.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <p className="text-sm text-white/50">{card.trend}</p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 45 }}
                  className="text-white/30 group-hover:text-white/60 transition-colors"
                >
                  <ArrowUpRight size={20} />
                </motion.div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                {card.stats.map((stat, statIndex) => (
                  <div key={statIndex} className="text-center">
                    <div className={`text-2xl font-bold text-${card.color}`}>
                      {stat.isAnimated ? (
                        <AnimatedCounter 
                          value={typeof stat.value === 'string' ? parseInt(stat.value.replace(/[^0-9]/g, '')) || 0 : stat.value} 
                          suffix={typeof stat.value === 'string' && stat.value.includes('+') ? '+' : typeof stat.value === 'string' && stat.value.includes('%') ? '%' : ''}
                        />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${70 + index * 10}%` } : {}}
                    transition={{ delay: index * 0.2 + 0.5, duration: 1, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${card.gradient} rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 glass-card p-6 rounded-2xl border border-white/10"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center">
                <Trophy size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Weekly Leaderboard</h3>
                <p className="text-white/50">You're ranked #42 out of 1,250 players</p>
              </div>
            </div>
            <motion.button
              className="px-6 py-3 btn-neon rounded-xl font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enter Score
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
