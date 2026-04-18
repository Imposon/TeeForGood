'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Heart, Gift, Settings, LogOut, Plus, 
  TrendingUp, Calendar, Target, DollarSign, ChevronRight,
  Medal, Star, Zap, Users, CheckCircle
} from 'lucide-react'
import Link from 'next/link'

// Glass Card Component
function GlassCard({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={`glass-card p-6 rounded-2xl border border-white/10 ${className} ${onClick ? 'hover:-translate-y-1 transition-transform cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Score Entry Modal
function ScoreEntryModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (score: any) => void }) {
  const [score, setScore] = useState('')
  const [course, setCourse] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!score || !course) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: parseInt(score),
          course,
          date,
          par: 72
        })
      })
      
      if (response.ok) {
        const savedScore = await response.json()
        onSave(savedScore)
        onClose()
        setScore('')
        setCourse('')
      } else {
        alert('Failed to save score')
      }
    } catch (error) {
      console.error('Error saving score:', error)
      alert('Error saving score')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card p-8 rounded-2xl border border-white/10 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-2xl font-bold text-white mb-2">Enter Your Score</h3>
          <p className="text-white/50 mb-6">Add your latest round to track progress and earn entries</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/50 mb-2 block">Score</label>
              <input 
                type="number" 
                placeholder="72"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-3xl font-bold focus:outline-none focus:border-neon-green/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-white/50 mb-2 block">Course</label>
              <input 
                type="text" 
                placeholder="Pine Valley Golf Club"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-green/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-white/50 mb-2 block">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-green/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || !score || !course}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-dark-bg font-bold disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Score'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function Dashboard() {
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const recentScores = [
    { course: 'Pine Valley GC', score: 78, par: 72, date: '2 days ago', trend: 'up' },
    { course: 'Torrey Pines', score: 82, par: 72, date: '1 week ago', trend: 'down' },
    { course: 'Pebble Beach', score: 74, par: 72, date: '2 weeks ago', trend: 'up' },
    { course: 'Augusta National', score: 79, par: 72, date: '3 weeks ago', trend: 'up' },
    { course: 'St Andrews', score: 81, par: 72, date: '1 month ago', trend: 'same' },
  ]

  const charities = [
    { name: 'Youth Golf Academy', percentage: 40, color: 'from-neon-green to-emerald-500' },
    { name: 'Green Course Initiative', percentage: 35, color: 'from-neon-cyan to-blue-500' },
    { name: 'Housing for Heroes', percentage: 25, color: 'from-neon-gold to-orange-500' },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-dark-bg">
      {/* Background */}
      <div className="fixed inset-0 bg-dark-bg" />
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-dark-bg/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-green to-neon-cyan rounded-xl rotate-45 scale-75" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">TeeForGood</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full border border-neon-green/30">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                <span className="text-sm text-white/80">Premium Member</span>
              </div>
              <button className="p-2 text-white/50 hover:text-white transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Alex!</h1>
          <p className="text-white/50">Here's your impact summary and latest activity</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Donated', value: '$1,240', icon: Heart, color: 'neon-green', trend: '+$120 this month' },
            { label: 'Draw Entries', value: '24', icon: Gift, color: 'neon-cyan', trend: 'Next draw in 2 days' },
            { label: 'Average Score', value: '78.4', icon: TrendingUp, color: 'neon-gold', trend: '-2.3 vs last month' },
            { label: 'Rank', value: '#42', icon: Medal, color: 'neon-purple', trend: 'Top 5%' },
          ].map((stat, index) => (
            <GlassCard key={index}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}/20 flex items-center justify-center`}>
                  <stat.icon size={20} className={`text-${stat.color}`} />
                </div>
                <span className="text-xs text-white/40">{stat.trend}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Scores & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Scores */}
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Trophy size={24} className="text-neon-green" />
                  <h2 className="text-xl font-bold text-white">Recent Scores</h2>
                </div>
                <button
                  onClick={() => setIsScoreModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 btn-neon rounded-lg text-sm font-medium hover:scale-105 active:scale-95 transition-transform"
                >
                  <Plus size={16} />
                  Add Score
                </button>
              </div>

              <div className="space-y-3">
                {recentScores.map((score, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{score.score}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{score.course}</div>
                        <div className="text-sm text-white/50">Par {score.par} • {score.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${score.trend === 'up' ? 'text-neon-green' : score.trend === 'down' ? 'text-red-400' : 'text-white/50'}`}>
                        {score.trend === 'up' && '↓ Improved'}
                        {score.trend === 'down' && '↑ Higher'}
                        {score.trend === 'same' && '— Same'}
                      </span>
                      <ChevronRight size={20} className="text-white/30 group-hover:text-white/60" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Performance Chart Placeholder */}
            <GlassCard>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={24} className="text-neon-cyan" />
                <h2 className="text-xl font-bold text-white">Performance Trend</h2>
              </div>
              <div className="h-48 flex items-end justify-between gap-2">
                {[82, 78, 74, 79, 81, 77, 75].map((score, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-neon-green/50 to-neon-cyan/50 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(score / 100) * 160}px` }}
                    />
                    <span className="text-xs text-white/40">{score}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-white/40">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Charity & Winnings */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <GlassCard>
              <div className="flex items-center gap-3 mb-4">
                <Star size={24} className="text-neon-gold" />
                <h2 className="text-lg font-bold text-white">Subscription</h2>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-neon-gold/10 to-orange-500/10 border border-neon-gold/20 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-neon-gold" />
                  <span className="text-neon-gold font-semibold">Premium Plan</span>
                </div>
                <p className="text-sm text-white/60">$19/month • Renews Dec 15, 2024</p>
              </div>
              <button className="w-full py-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors text-sm">
                Manage Subscription
              </button>
            </GlassCard>

            {/* Charity Distribution */}
            <GlassCard>
              <div className="flex items-center gap-3 mb-4">
                <Heart size={24} className="text-neon-cyan" />
                <h2 className="text-lg font-bold text-white">Your Impact</h2>
              </div>
              <div className="space-y-4">
                {charities.map((charity, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/70">{charity.name}</span>
                      <span className="text-white">{charity.percentage}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${charity.color} rounded-full`}
                        style={{ width: `${charity.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-neon-green text-sm hover:underline">
                Edit Distribution
              </button>
            </GlassCard>

            {/* Recent Winnings */}
            <GlassCard>
              <div className="flex items-center gap-3 mb-4">
                <Gift size={24} className="text-neon-green" />
                <h2 className="text-lg font-bold text-white">Winnings</h2>
              </div>
              <div className="space-y-3">
                {[
                  { amount: '$250', date: 'Nov 15, 2024', tier: 'Gold', won: true },
                  { amount: '$50', date: 'Oct 28, 2024', tier: 'Bronze', won: true },
                  { amount: '$10,000', date: 'Oct 15, 2024', tier: 'Grand', won: false },
                ].map((win, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <div className={`font-semibold ${win.won ? 'text-neon-green' : 'text-white/40'}`}>
                        {win.won ? win.amount : '—'}
                      </div>
                      <div className="text-xs text-white/40">{win.date}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">{win.tier} Tier</span>
                      {win.won && <CheckCircle size={16} className="text-neon-green" />}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Next Draw Countdown */}
            <GlassCard className="bg-gradient-to-br from-neon-purple/10 to-pink-500/10">
              <div className="text-center">
                <div className="text-sm text-white/60 mb-2">Next Draw In</div>
                <div className="text-3xl font-bold gradient-text mb-4">2d 14h 32m</div>
                <div className="text-sm text-white/50 mb-4">1,247 participants • $15,000 pool</div>
                <button
                  className="w-full py-3 btn-neon rounded-xl font-semibold hover:scale-102 active:scale-98 transition-transform"
                >
                  View Draw Details
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Score Entry Modal */}
      <ScoreEntryModal 
        isOpen={isScoreModalOpen} 
        onClose={() => setIsScoreModalOpen(false)} 
        onSave={(newScore) => {
          // Add new score to the list
          console.log('Score saved:', newScore)
        }}
      />
    </main>
  )
}
