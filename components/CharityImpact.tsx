'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Heart, Users, Globe, GraduationCap, Trees, Home, ArrowRight } from 'lucide-react'

const impactStats = [
  { icon: Users, value: '50,000+', label: 'People Helped', color: 'neon-green' },
  { icon: Globe, value: '25', label: 'Countries', color: 'neon-cyan' },
  { icon: Heart, value: '$2.4M', label: 'Total Donated', color: 'neon-gold' },
]

const featuredCharities = [
  {
    name: 'Youth Golf Academy',
    description: 'Teaching underprivileged children golf and life skills',
    icon: GraduationCap,
    color: 'from-neon-green to-emerald-500',
    impact: '2,400 kids trained',
    percentage: 35,
  },
  {
    name: 'Green Course Initiative',
    description: 'Sustainable golf course development and environmental conservation',
    icon: Trees,
    color: 'from-neon-cyan to-blue-500',
    impact: '15,000 trees planted',
    percentage: 28,
  },
  {
    name: 'Housing for Heroes',
    description: 'Building homes for veterans through golf fundraisers',
    icon: Home,
    color: 'from-neon-gold to-orange-500',
    impact: '120 homes built',
    percentage: 37,
  },
]

export function CharityImpact() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })

  return (
    <section id="charity" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent">
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
            <Heart size={16} className="text-neon-cyan" />
            <span className="text-sm text-white/80">Making a Difference</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="gradient-text">Impact</span>
            <span className="text-white"> That Matters</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Every swing you take contributes to real change. See how our community is transforming lives 
            around the world through the power of golf.
          </p>
        </motion.div>

        {/* Impact Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {impactStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="glass-card p-8 rounded-2xl border border-white/10 text-center group hover:border-white/20 transition-colors"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-${stat.color}/20 flex items-center justify-center`}
              >
                <stat.icon size={32} className={`text-${stat.color}`} />
              </motion.div>
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Featured Charities */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {featuredCharities.map((charity, index) => (
            <motion.div
              key={charity.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="glass-card glass-card-hover p-6 rounded-2xl border border-white/10 group cursor-pointer"
            >
              {/* Icon */}
              <div className={`w-14 h-14 mb-4 rounded-xl bg-gradient-to-br ${charity.color} flex items-center justify-center shadow-lg`}>
                <charity.icon size={28} className="text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2">{charity.name}</h3>
              <p className="text-white/50 text-sm mb-4">{charity.description}</p>

              {/* Impact Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-sm text-white/70">
                <Heart size={14} className="text-neon-green" />
                {charity.impact}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/50">Funding Progress</span>
                  <span className="text-white">{charity.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${charity.percentage}%` } : {}}
                    transition={{ delay: 0.5 + index * 0.2, duration: 1, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${charity.color} rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <motion.button
            className="inline-flex items-center gap-2 px-8 py-4 glass-card rounded-full text-white font-medium group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Charities
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
