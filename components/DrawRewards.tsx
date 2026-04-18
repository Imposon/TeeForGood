'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Gift, Sparkles, Clock, Users, Crown, Zap, RotateCcw } from 'lucide-react'

const prizes = [
  { amount: '$10,000', label: 'Grand Prize', color: 'neon-gold', icon: Crown, winners: 1 },
  { amount: '$2,500', label: 'Gold Tier', color: 'neon-cyan', icon: Sparkles, winners: 3 },
  { amount: '$500', label: 'Silver Tier', color: 'neon-green', icon: Zap, winners: 10 },
  { amount: '$100', label: 'Bronze Tier', color: 'neon-purple', icon: Gift, winners: 50 },
]

const recentWinners = [
  { name: 'Alex M.', amount: '$2,500', date: '2 days ago', avatar: 'AM' },
  { name: 'Sarah K.', amount: '$500', date: '4 days ago', avatar: 'SK' },
  { name: 'James R.', amount: '$10,000', date: '1 week ago', avatar: 'JR' },
]

// Animated number display
function AnimatedNumber({ value, isSpinning }: { value: number; isSpinning: boolean }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (isSpinning) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 99))
      }, 50)
      return () => clearInterval(interval)
    } else {
      setDisplayValue(value)
    }
  }, [isSpinning, value])

  return (
    <span className="font-mono text-4xl font-bold">
      {displayValue.toString().padStart(2, '0')}
    </span>
  )
}

export function DrawRewards() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawComplete, setDrawComplete] = useState(false)

  const triggerDraw = () => {
    setIsDrawing(true)
    setDrawComplete(false)
    setTimeout(() => {
      setIsDrawing(false)
      setDrawComplete(true)
    }, 3000)
  }

  return (
    <section id="rewards" className="relative py-24 px-4 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-gold/10 rounded-full blur-[150px]" />
      
      <div className="max-w-7xl mx-auto relative">
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
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass-card border border-neon-gold/30"
          >
            <Gift size={16} className="text-neon-gold" />
            <span className="text-sm text-white/80">Weekly Draws & Rewards</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">Play. </span>
            <span className="gradient-text">Win.</span>
            <span className="text-white"> Celebrate.</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Every round you play is a ticket to win. Our weekly draws reward skill, 
            consistency, and a bit of luck.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Prize Tiers */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Crown size={24} className="text-neon-gold" />
              Prize Tiers
            </h3>
            
            {prizes.map((prize, index) => (
              <motion.div
                key={prize.label}
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                className="glass-card glass-card-hover p-5 rounded-xl border border-white/10 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${prize.color}/20 flex items-center justify-center`}>
                    <prize.icon size={24} className={`text-${prize.color}`} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{prize.amount}</div>
                    <div className="text-sm text-white/50">{prize.label}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/50">{prize.winners} winners</div>
                  <div className={`text-xs text-${prize.color}`}>per week</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right - Draw Simulator & Recent Winners */}
          <div className="space-y-6">
            {/* Draw Simulator */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="glass-card p-8 rounded-2xl border border-neon-gold/20 relative overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-gold/5 to-transparent" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Sparkles size={24} className="text-neon-gold" />
                    Live Draw Simulator
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Clock size={16} />
                    Next draw in 2d 4h
                  </div>
                </div>

                {/* Number Display */}
                <div className="flex justify-center gap-4 mb-8">
                  {[42, 17, 89].map((num, index) => (
                    <motion.div
                      key={index}
                      className="w-20 h-24 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/20 flex items-center justify-center"
                      animate={isDrawing ? {
                        boxShadow: [
                          '0 0 20px rgba(255, 215, 0, 0.3)',
                          '0 0 40px rgba(255, 215, 0, 0.6)',
                          '0 0 20px rgba(255, 215, 0, 0.3)',
                        ]
                      } : {}}
                      transition={{ duration: 0.5, repeat: isDrawing ? Infinity : 0 }}
                    >
                      <span className={`text-4xl font-bold ${drawComplete && index === 2 ? 'text-neon-gold' : 'text-white'}`}>
                        <AnimatedNumber value={num} isSpinning={isDrawing} />
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Draw Button */}
                <button
                  onClick={triggerDraw}
                  disabled={isDrawing}
                  className="w-full py-4 btn-neon rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  {isDrawing ? (
                    <>
                      <RotateCcw size={20} className="animate-spin" />
                      Drawing...
                    </>
                  ) : drawComplete ? (
                    <>
                      <Sparkles size={20} />
                      You Won Entry #42!
                    </>
                  ) : (
                    <>
                      <Gift size={20} />
                      Test Your Luck
                    </>
                  )}
                </button>

                {/* Pool Info */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/50">
                    <Users size={16} />
                    <span className="text-sm">1,247 participants</span>
                  </div>
                  <div className="text-neon-gold font-semibold">$15,000 pool</div>
                </div>
              </div>
            </motion.div>

            {/* Recent Winners */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="glass-card p-6 rounded-2xl border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Winners</h3>
              <div className="space-y-3">
                {recentWinners.map((winner, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-green flex items-center justify-center text-sm font-bold text-white">
                        {winner.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-white">{winner.name}</div>
                        <div className="text-xs text-white/50">{winner.date}</div>
                      </div>
                    </div>
                    <div className="text-neon-gold font-semibold">{winner.amount}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
