'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Sparkles, RefreshCw, Info } from 'lucide-react'

interface DrawEntryProps {
  hasEntry: boolean
  entryNumbers?: number[]
  winningNumbers?: number[] | null
  matches?: number
  isWinner?: boolean
  prizeAmount?: number
  onEnter: (algorithm: 'random' | 'weighted') => Promise<void>
  isLoading?: boolean
}

export function DrawEntry({
  hasEntry,
  entryNumbers,
  winningNumbers,
  matches,
  isWinner,
  prizeAmount,
  onEnter,
  isLoading,
}: DrawEntryProps) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'random' | 'weighted'>('random')
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false)

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-gold to-orange-500 flex items-center justify-center">
          <Gift size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Monthly Draw</h3>
          <p className="text-sm text-white/50">
            {hasEntry ? 'Your numbers are in!' : 'Enter for a chance to win'}
          </p>
        </div>
      </div>

      {!hasEntry ? (
        <div className="space-y-4">
          {/* Algorithm Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/70">Number Generation Method</label>
              <button
                onClick={() => setShowAlgorithmInfo(!showAlgorithmInfo)}
                className="text-white/40 hover:text-white/60"
              >
                <Info size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedAlgorithm('random')}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedAlgorithm === 'random'
                    ? 'border-neon-cyan bg-neon-cyan/20 text-white'
                    : 'border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                <Sparkles size={16} className="mx-auto mb-1" />
                Random
              </button>
              <button
                onClick={() => setSelectedAlgorithm('weighted')}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedAlgorithm === 'weighted'
                    ? 'border-neon-green bg-neon-green/20 text-white'
                    : 'border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                <RefreshCw size={16} className="mx-auto mb-1" />
                Weighted
              </button>
            </div>

            {showAlgorithmInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-white/40 bg-white/5 p-3 rounded-lg"
              >
                <p className="mb-1"><strong>Random:</strong> Pure random number generation</p>
                <p><strong>Weighted:</strong> Better golfers (lower scores) get lower number bias</p>
              </motion.div>
            )}
          </div>

          <motion.button
            onClick={() => onEnter(selectedAlgorithm)}
            disabled={isLoading}
            className="w-full py-4 btn-neon rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <>
                <Sparkles size={20} />
                Enter Draw
              </>
            )}
          </motion.button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Entry Numbers */}
          <div>
            <label className="text-sm text-white/50 mb-3 block">Your Numbers</label>
            <div className="flex justify-center gap-3">
              {entryNumbers?.map((num, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-14 h-16 rounded-xl flex items-center justify-center text-xl font-bold ${
                    winningNumbers?.includes(num)
                      ? 'bg-gradient-to-b from-neon-gold to-orange-500 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {num.toString().padStart(2, '0')}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Winning Numbers (if available) */}
          {winningNumbers && (
            <div>
              <label className="text-sm text-white/50 mb-3 block">Winning Numbers</label>
              <div className="flex justify-center gap-3">
                {winningNumbers.map((num, index) => (
                  <div
                    key={index}
                    className="w-14 h-16 rounded-xl bg-gradient-to-b from-neon-green to-neon-cyan flex items-center justify-center text-xl font-bold text-white"
                  >
                    {num.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {matches !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl text-center ${
                isWinner
                  ? 'bg-neon-gold/20 border border-neon-gold/30'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="text-3xl font-bold text-white mb-1">
                {matches} {matches === 1 ? 'Match' : 'Matches'}
              </div>
              {isWinner && prizeAmount && (
                <div className="text-neon-gold text-lg font-semibold">
                  You won ${prizeAmount.toFixed(2)}!
                </div>
              )}
              {!isWinner && (
                <div className="text-white/50 text-sm">
                  Better luck next month!
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
