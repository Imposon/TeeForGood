'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Heart, Gift, TrendingUp, Calendar, 
  DollarSign, Target, Zap, Crown, ChevronRight,
  Loader2, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { ScoreManager } from './ScoreManager'
import { WinnerClaim } from './WinnerClaim'
import { CharitySelector } from './CharitySelector'
import { DrawEntry } from './DrawEntry'
import { SubscribeButton } from './SubscribeButton'

interface DashboardStats {
  scores: {
    list: any[]
    count: number
    best: number | null
    average: number | null
  }
  subscription: any
  donations: {
    total: number
    count: number
    percentage: number
    charity: any
  }
  draws: {
    totalEntries: number
    hasEnteredCurrent: boolean
    currentDraw: any
  }
  winnings: {
    total: number
    count: number
    pending: number
    list: any[]
  }
}

export function UserDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'draws' | 'charity' | 'winnings'>('overview')

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated, fetchDashboardData])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please sign in</h2>
          <Link href="/login" className="btn-neon px-6 py-3 rounded-xl">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-neon-cyan" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl text-center max-w-md">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-white/50 mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="btn-neon px-6 py-3 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const isSubscribed = user?.subscriptionStatus === 'active'

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, {user?.firstName}
              </h1>
              <p className="text-white/50">
                {isSubscribed 
                  ? 'Your subscription is active. Keep tracking scores and entering draws!'
                  : 'Subscribe to start tracking scores and entering draws.'}
              </p>
            </div>
            {!isSubscribed && (
              <SubscribeButton plan="monthly" variant="default" />
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatCard
              icon={Trophy}
              label="Best Score"
              value={stats?.scores.best?.toString() || '-'}
              color="neon-gold"
            />
            <StatCard
              icon={Gift}
              label="Draws Entered"
              value={stats?.draws.totalEntries.toString() || '0'}
              color="neon-cyan"
            />
            <StatCard
              icon={Heart}
              label="Donated"
              value={`$${stats?.donations.total.toFixed(0) || '0'}`}
              color="neon-green"
            />
            <StatCard
              icon={DollarSign}
              label="Winnings"
              value={`$${stats?.winnings.total.toFixed(0) || '0'}`}
              color="neongold"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'scores', label: 'My Scores', icon: Target },
            { id: 'draws', label: 'Draws', icon: Gift },
            { id: 'charity', label: 'Charity', icon: Heart },
            { id: 'winnings', label: 'Winnings', icon: Trophy },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                  : 'glass-card text-white/50 hover:text-white border border-white/10'
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab stats={stats} isSubscribed={isSubscribed} />
            )}
            {activeTab === 'scores' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">My Scores</h2>
                <ScoreManager />
              </div>
            )}
            {activeTab === 'draws' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Monthly Draws</h2>
                {stats?.draws.currentDraw ? (
                  <DrawEntry 
                    hasEntry={stats.draws.hasEnteredCurrent}
                    onEnter={async (algorithm) => {
                      // TODO: Implement draw entry API call
                      console.log('Enter draw with algorithm:', algorithm)
                    }}
                  />
                ) : (
                  <div className="glass-card p-8 rounded-2xl text-center">
                    <Clock size={48} className="text-white/30 mx-auto mb-4" />
                    <p className="text-white/50">No active draw at the moment.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'charity' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">My Charity</h2>
                {stats?.donations.charity ? (
                  <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-neon-green/20 flex items-center justify-center">
                        <Heart size={32} className="text-neon-green" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{stats.donations.charity.name}</h3>
                        <p className="text-neon-cyan">{stats.donations.percentage}% of subscription</p>
                      </div>
                    </div>
                    <p className="text-white/50 mb-4">{stats.donations.charity.description}</p>
                    <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/20">
                      <p className="text-sm text-white/70">
                        You've contributed <span className="text-neon-green font-bold">${stats.donations.total.toFixed(2)}</span> to this charity.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-8 rounded-2xl text-center">
                    <Heart size={48} className="text-white/30 mx-auto mb-4" />
                    <p className="text-white/50 mb-4">You haven't selected a charity yet.</p>
                    <Link 
                      href="/charities" 
                      className="inline-flex items-center gap-2 text-neon-cyan hover:underline"
                    >
                      Choose a charity <ChevronRight size={16} />
                    </Link>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'winnings' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">My Winnings</h2>
                {stats?.winnings.count ? (
                  <WinnerClaim 
                    winners={stats.winnings.list}
                    onUploadProof={async (winnerId: string, file: File) => {
                      // Upload proof implementation
                      const formData = new FormData()
                      formData.append('file', file)
                      formData.append('winnerId', winnerId)
                      
                      const response = await fetch('/api/winners', {
                        method: 'POST',
                        body: formData,
                      })
                      
                      if (!response.ok) throw new Error('Upload failed')
                      fetchDashboardData()
                    }}
                  />
                ) : (
                  <div className="glass-card p-8 rounded-2xl text-center">
                    <Trophy size={48} className="text-white/30 mx-auto mb-4" />
                    <p className="text-white/50">No winnings yet. Enter draws to win!</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ stats, isSubscribed }: { stats: DashboardStats | null; isSubscribed: boolean }) {
  return (
    <div className="space-y-8">
      {/* Subscription Status */}
      {!isSubscribed && (
        <div className="glass-card p-6 rounded-2xl border border-neon-gold/30 bg-neon-gold/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neon-gold/20 flex items-center justify-center">
                <Crown size={24} className="text-neon-gold" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Unlock Full Access</h3>
                <p className="text-white/50">Subscribe to track scores, enter draws, and win prizes.</p>
              </div>
            </div>
            <SubscribeButton plan="monthly" variant="small" />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Scores */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target size={20} className="text-neon-green" />
              Recent Scores
            </h3>
            <Link href="/dashboard?tab=scores" className="text-neon-cyan text-sm hover:underline">
              View all
            </Link>
          </div>
          {stats?.scores.list.length ? (
            <div className="space-y-3">
              {stats.scores.list.slice(0, 3).map((score) => (
                <div 
                  key={score.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                      <span className="font-bold text-white">{score.score}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{score.course_name || 'Course'}</p>
                      <p className="text-white/50 text-sm">{new Date(score.played_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-center py-8">No scores yet</p>
          )}
        </div>

        {/* Current Draw */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gift size={20} className="text-neon-cyan" />
              Current Draw
            </h3>
            {stats?.draws.hasEnteredCurrent && (
              <span className="px-3 py-1 rounded-full bg-neon-green/20 text-neon-green text-sm">
                <CheckCircle2 size={14} className="inline mr-1" />
                Entered
              </span>
            )}
          </div>
          {stats?.draws.currentDraw ? (
            <div>
              <p className="text-white/50 mb-4">
                Draw closes {new Date(stats.draws.currentDraw.draw_date).toLocaleDateString()}
              </p>
              <div className="flex gap-2 mb-4">
                {stats.draws.currentDraw.winning_numbers?.map((num: number, i: number) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center text-white font-bold"
                  >
                    {num}
                  </div>
                )) || (
                  <p className="text-white/30">Numbers will be drawn soon</p>
                )}
              </div>
              {!stats.draws.hasEnteredCurrent && isSubscribed && (
                <Link 
                  href="/dashboard?tab=draws"
                  className="w-full py-3 rounded-xl bg-neon-cyan/20 text-neon-cyan font-semibold text-center block hover:bg-neon-cyan/30 transition-colors"
                >
                  Enter This Draw
                </Link>
              )}
            </div>
          ) : (
            <p className="text-white/30 text-center py-8">No active draw</p>
          )}
        </div>

        {/* Charity Impact */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Heart size={20} className="text-neon-green" />
            Charity Impact
          </h3>
          {stats?.donations.charity ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
                  <Heart size={24} className="text-neon-green" />
                </div>
                <div>
                  <p className="text-white font-medium">{stats.donations.charity.name}</p>
                  <p className="text-neon-cyan text-sm">{stats.donations.percentage}% contribution</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-2xl font-bold text-neon-green">${stats.donations.total.toFixed(2)}</p>
                <p className="text-white/50 text-sm">Total donated</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/50 mb-4">No charity selected</p>
              <Link 
                href="/dashboard?tab=charity" 
                className="text-neon-cyan hover:underline"
              >
                Choose a charity
              </Link>
            </div>
          )}
        </div>

        {/* Recent Winnings */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-neon-gold" />
            Recent Winnings
          </h3>
          {stats?.winnings.list.length ? (
            <div className="space-y-3">
              {stats.winnings.list.slice(0, 3).map((winning) => (
                <div 
                  key={winning.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-gold/20 flex items-center justify-center">
                      <DollarSign size={18} className="text-neon-gold" />
                    </div>
                    <div>
                      <p className="text-white font-medium">${winning.prize_amount.toFixed(2)}</p>
                      <p className="text-white/50 text-sm">{winning.match_count} numbers matched</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    winning.status === 'paid' 
                      ? 'bg-neon-green/20 text-neon-green'
                      : 'bg-neon-gold/20 text-neon-gold'
                  }`}>
                    {winning.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-center py-8">No winnings yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any
  label: string
  value: string
  color: string
}) {
  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg bg-${color}/20 flex items-center justify-center`}>
          <Icon size={20} className={`text-${color}`} />
        </div>
        <p className="text-white/50 text-sm">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
