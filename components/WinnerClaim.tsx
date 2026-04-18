'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Upload, CheckCircle, Clock, XCircle, DollarSign, Camera } from 'lucide-react'

interface Winner {
  id: string
  prize_amount: number
  match_count: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  proof_image_url?: string
  proof_uploaded_at?: string
  draw_id: string
  draws: {
    draw_date: string
    winning_numbers: number[]
  }
}

interface WinnerClaimProps {
  winners: Winner[]
  onUploadProof: (winnerId: string, file: File) => Promise<void>
}

export function WinnerClaim({ winners, onUploadProof }: WinnerClaimProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (winnerId: string, file: File) => {
    setUploadingId(winnerId)
    try {
      await onUploadProof(winnerId, file)
    } finally {
      setUploadingId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} className="text-neon-gold" />
      case 'approved':
        return <CheckCircle size={20} className="text-neon-green" />
      case 'rejected':
        return <XCircle size={20} className="text-red-400" />
      case 'paid':
        return <DollarSign size={20} className="text-neon-cyan" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Verification'
      case 'approved':
        return 'Approved - Payment Processing'
      case 'rejected':
        return 'Rejected - Contact Support'
      case 'paid':
        return 'Paid'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-neon-gold bg-neon-gold/10 border-neon-gold/30'
      case 'approved':
        return 'text-neon-green bg-neon-green/10 border-neon-green/30'
      case 'rejected':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'paid':
        return 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30'
      default:
        return 'text-white/50 bg-white/5 border-white/10'
    }
  }

  if (winners.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-white/10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <Trophy size={32} className="text-white/30" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Winnings Yet</h3>
        <p className="text-white/50">Enter draws for a chance to win!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {winners.map((winner, index) => (
        <motion.div
          key={winner.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-gold to-orange-500 flex items-center justify-center">
                <Trophy size={28} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neon-gold">
                  ${winner.prize_amount.toFixed(2)}
                </div>
                <div className="text-sm text-white/50">
                  {winner.match_count} numbers matched
                </div>
                <div className="text-xs text-white/30">
                  {new Date(winner.draws.draw_date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(winner.status)}`}>
              {getStatusIcon(winner.status)}
              {getStatusText(winner.status)}
            </div>
          </div>

          {/* Winning Numbers */}
          <div className="mb-4">
            <div className="text-xs text-white/30 mb-2">Winning Numbers</div>
            <div className="flex gap-2">
              {winner.draws.winning_numbers.map((num, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-sm font-medium text-white"
                >
                  {num.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>

          {/* Proof Upload Section */}
          {winner.status === 'pending' && (
            <div className="border-t border-white/10 pt-4">
              {!winner.proof_image_url ? (
                <div className="space-y-3">
                  <p className="text-sm text-white/50">
                    Upload a photo ID to claim your prize. This helps us verify your identity.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(winner.id, file)
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingId === winner.id}
                    className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/70 hover:text-white hover:border-neon-green/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploadingId === winner.id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-neon-green rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera size={20} />
                        Upload Proof of Identity
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-green/10 border border-neon-green/30">
                  <CheckCircle size={20} className="text-neon-green" />
                  <div className="flex-1">
                    <div className="text-sm text-white">Proof uploaded successfully</div>
                    <div className="text-xs text-white/50">
                      {winner.proof_uploaded_at && new Date(winner.proof_uploaded_at).toLocaleString()}
                    </div>
                  </div>
                  <a
                    href={winner.proof_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon-cyan text-sm hover:underline"
                  >
                    View
                  </a>
                </div>
              )}
            </div>
          )}

          {winner.status === 'approved' && (
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-green/10 border border-neon-green/30">
                <CheckCircle size={20} className="text-neon-green" />
                <div className="text-sm text-white">
                  Your prize has been approved! Payment will be processed within 5-7 business days.
                </div>
              </div>
            </div>
          )}

          {winner.status === 'paid' && (
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30">
                <DollarSign size={20} className="text-neon-cyan" />
                <div className="text-sm text-white">
                  Payment has been sent! Check your email for details.
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
