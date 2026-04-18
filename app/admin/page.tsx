'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Trophy, Gift, Heart, DollarSign, 
  Play, Eye, CheckCircle, XCircle,
  BarChart3, ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  totalDonations: number
  pendingWinners: number
  currentMonthPool: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalDonations: 0,
    pendingWinners: 0,
    currentMonthPool: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const modules = [
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: Users,
      color: 'neon-cyan',
      href: '/admin/users',
      stat: `${stats.totalUsers} users`,
    },
    {
      title: 'Draw Control',
      description: 'Run draws and view results',
      icon: Gift,
      color: 'neon-gold',
      href: '/admin/draws',
      stat: '$' + stats.currentMonthPool.toLocaleString() + ' pool',
    },
    {
      title: 'Winner Verification',
      description: 'Review winner proofs',
      icon: Trophy,
      color: 'neon-green',
      href: '/admin/winners',
      stat: stats.pendingWinners + ' pending',
    },
    {
      title: 'Charity Management',
      description: 'Manage charity partners',
      icon: Heart,
      color: 'neon-purple',
      href: '/admin/charities',
      stat: '$' + stats.totalDonations.toLocaleString() + ' donated',
    },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-dark-bg">
      {/* Background */}
      <div className="fixed inset-0 bg-dark-bg" />
      <div className="fixed inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-neon-purple/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/50">Manage your TeeForGood platform</p>
          </div>
          <Link href="/" className="text-neon-cyan hover:underline">
            Back to Site
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'neon-cyan' },
            { label: 'Active Subs', value: stats.activeSubscriptions, icon: DollarSign, color: 'neon-green' },
            { label: 'Total Donated', value: '$' + stats.totalDonations.toLocaleString(), icon: Heart, color: 'neon-gold' },
            { label: 'Pending Winners', value: stats.pendingWinners, icon: Trophy, color: 'neon-purple' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 rounded-xl border border-white/10"
            >
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}/20 flex items-center justify-center mb-3`}>
                <stat.icon size={20} className={`text-${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{isLoading ? '-' : stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 rounded-xl border border-white/10 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/draws/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-gold/20 text-neon-gold border border-neon-gold/30 hover:bg-neon-gold/30 transition-colors"
            >
              <Play size={18} />
              Run New Draw
            </Link>
            <Link
              href="/admin/winners"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-colors"
            >
              <CheckCircle size={18} />
              Verify Winners
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-colors"
            >
              <BarChart3 size={18} />
              View Reports
            </Link>
          </div>
        </div>

        {/* Management Modules */}
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link
                href={module.href}
                className="glass-card glass-card-hover p-6 rounded-xl border border-white/10 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${module.color} to-${module.color}/50 flex items-center justify-center`}>
                    <module.icon size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                    <p className="text-sm text-white/50">{module.description}</p>
                    <p className={`text-sm text-${module.color} mt-1`}>{module.stat}</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-white/30 group-hover:text-white/60 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
