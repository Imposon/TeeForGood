'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Calendar, AlertCircle, CheckCircle, XCircle, RotateCcw } from 'lucide-react'

interface Subscription {
  id: string
  plan_type: 'monthly' | 'yearly'
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
}

interface Payment {
  id: string
  amount: number
  status: string
  payment_date: string
}

interface SubscriptionManagerProps {
  subscription: Subscription | null
  payments: Payment[]
  onCancel: () => Promise<void>
}

export function SubscriptionManager({ subscription, payments, onCancel }: SubscriptionManagerProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await onCancel()
      setShowConfirm(false)
    } catch (error) {
      console.error('Cancel failed:', error)
    } finally {
      setIsCancelling(false)
    }
  }

  if (!subscription) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <CreditCard size={32} className="text-white/30" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Active Subscription</h3>
        <p className="text-white/50 mb-4">Subscribe to start tracking scores and entering draws</p>
        <a href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 btn-neon rounded-xl font-medium">
          View Plans
        </a>
      </div>
    )
  }

  const isActive = subscription.status === 'active'
  const isCancelled = subscription.cancel_at_period_end
  const periodEnd = new Date(subscription.current_period_end)

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className={`glass-card p-6 rounded-2xl border ${
        isActive && !isCancelled
          ? 'border-neon-green/30 bg-neon-green/5'
          : 'border-neon-gold/30 bg-neon-gold/5'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isActive && !isCancelled
                ? 'bg-neon-green/20'
                : 'bg-neon-gold/20'
            }`}>
              {isActive && !isCancelled ? (
                <CheckCircle size={28} className="text-neon-green" />
              ) : (
                <AlertCircle size={28} className="text-neon-gold" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">
                  {subscription.plan_type === 'monthly' ? 'Monthly' : 'Yearly'} Plan
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isActive && !isCancelled
                    ? 'bg-neon-green/20 text-neon-green'
                    : 'bg-neon-gold/20 text-neon-gold'
                }`}>
                  {isCancelled ? 'Cancels Soon' : 'Active'}
                </span>
              </div>
              <p className="text-white/50 text-sm">
                {isCancelled
                  ? `Access until ${periodEnd.toLocaleDateString()}`
                  : `Renews on ${periodEnd.toLocaleDateString()}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              ${subscription.plan_type === 'monthly' ? '19' : '15'}
            </div>
            <div className="text-sm text-white/50">/month</div>
          </div>
        </div>

        {!isCancelled && isActive && (
          <div className="mt-6 pt-6 border-t border-white/10">
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="text-white/50 hover:text-white/70 text-sm flex items-center gap-2 transition-colors"
              >
                <XCircle size={16} />
                Cancel Subscription
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white/5 p-4 rounded-xl"
              >
                <p className="text-white/70 text-sm mb-3">
                  Are you sure? You'll lose access to all premium features at the end of your billing period.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:text-white text-sm"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm disabled:opacity-50"
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {isCancelled && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 text-neon-green hover:text-neon-green/80 text-sm"
            >
              <RotateCcw size={16} />
              Resubscribe
            </a>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="glass-card p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-neon-cyan" />
          Payment History
        </h3>
        
        {payments.length === 0 ? (
          <p className="text-white/30 text-sm">No payments yet</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5"
              >
                <div>
                  <div className="font-medium text-white">${payment.amount.toFixed(2)}</div>
                  <div className="text-xs text-white/50">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  payment.status === 'succeeded'
                    ? 'bg-neon-green/20 text-neon-green'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
