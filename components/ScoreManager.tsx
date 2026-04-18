'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Trophy, TrendingUp, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Score } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'

interface ScoreManagerProps {
  userId?: string
}

export function ScoreManager({ userId }: ScoreManagerProps = {}) {
  const { user: authUser } = useAuth()
  const [scores, setScores] = useState<Score[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    score: '',
    courseName: '',
    playedDate: '',
  })

  const targetUserId = userId || authUser?.id

  // Fetch scores
  const fetchScores = useCallback(async () => {
    if (!targetUserId) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', targetUserId)
        .order('played_date', { ascending: false })
        .limit(5)

      if (error) throw error
      setScores(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load scores')
    } finally {
      setIsLoading(false)
    }
  }, [targetUserId])

  // Initial load
  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  // Real-time subscription
  useEffect(() => {
    if (!targetUserId) return

    const subscription = supabase
      .channel(`scores:${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scores',
          filter: `user_id=eq.${targetUserId}`,
        },
        () => {
          fetchScores()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [targetUserId, fetchScores])

  // Add score
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUserId) return

    const scoreValue = parseInt(formData.score)
    
    // Validation
    if (scoreValue < 1 || scoreValue > 45) {
      setError('Score must be between 1 and 45')
      return
    }

    if (!formData.playedDate) {
      setError('Please select a date')
      return
    }

    // Check for duplicate date
    const duplicate = scores.find(s => s.played_date === formData.playedDate)
    if (duplicate) {
      setError('You already have a score for this date')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // The database trigger will auto-delete oldest if > 5
      const { error } = await (supabase as any)
        .from('scores')
        .insert({
          user_id: targetUserId,
          score: scoreValue,
          course_name: formData.courseName || null,
          played_date: formData.playedDate,
        })

      if (error) throw error

      // Reset form
      setFormData({ score: '', courseName: '', playedDate: '' })
      setIsAdding(false)
      
      // Refresh will happen via realtime subscription
      await fetchScores()
    } catch (err: any) {
      setError(err.message || 'Failed to save score')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update score
  const handleUpdate = async (scoreId: string) => {
    if (!targetUserId) return

    const scoreValue = parseInt(formData.score)
    
    if (scoreValue < 1 || scoreValue > 45) {
      setError('Score must be between 1 and 45')
      return
    }

    // Check for duplicate date (excluding current score)
    const duplicate = scores.find(s => s.played_date === formData.playedDate && s.id !== scoreId)
    if (duplicate) {
      setError('You already have a score for this date')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await (supabase as any)
        .from('scores')
        .update({
          score: scoreValue,
          course_name: formData.courseName || null,
          played_date: formData.playedDate,
        })
        .eq('id', scoreId)
        .eq('user_id', targetUserId)

      if (error) throw error

      setEditingId(null)
      await fetchScores()
    } catch (err: any) {
      setError(err.message || 'Failed to update score')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete score
  const handleDelete = async (scoreId: string) => {
    if (!targetUserId) return

    if (!confirm('Are you sure you want to delete this score?')) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('scores')
        .delete()
        .eq('id', scoreId)
        .eq('user_id', targetUserId)

      if (error) throw error

      await fetchScores()
    } catch (err: any) {
      setError(err.message || 'Failed to delete score')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (score: Score) => {
    if (editingId === score.id) {
      handleUpdate(score.id)
    } else {
      setEditingId(score.id)
      setFormData({
        score: score.score.toString(),
        courseName: score.course_name || '',
        playedDate: score.played_date,
      })
      setError(null)
    }
  }

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
    : 0

  const bestScore = scores.length > 0
    ? Math.min(...scores.map(s => s.score))
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-neon-cyan" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            <AlertCircle size={18} />
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl text-center">
          <Trophy size={20} className="text-neon-gold mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{bestScore || '-'}</div>
          <div className="text-xs text-white/50">Best Score</div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <TrendingUp size={20} className="text-neon-cyan mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{averageScore || '-'}</div>
          <div className="text-xs text-white/50">Average</div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <Calendar size={20} className="text-neon-green mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{scores.length}/5</div>
          <div className="text-xs text-white/50">Scores</div>
        </div>
      </div>

      {/* Add Button */}
      {!isAdding && scores.length < 5 && (
        <motion.button
          onClick={() => {
            setIsAdding(true)
            setError(null)
          }}
          disabled={isSubmitting}
          className="w-full py-4 glass-card rounded-xl border border-dashed border-white/20 text-white/70 hover:text-white hover:border-neon-green/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus size={20} />
          Add New Score
        </motion.button>
      )}

      {/* Max scores warning */}
      {scores.length >= 5 && !isAdding && (
        <div className="p-4 rounded-xl bg-neon-gold/10 border border-neon-gold/30 text-neon-gold text-sm text-center">
          Maximum 5 scores stored. New scores will replace the oldest.
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 rounded-xl border border-neon-green/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Add Score</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/50 mb-2 block">Score (1-45)</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  required
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl font-bold focus:outline-none focus:border-neon-green/50"
                />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-2 block">Course Name (optional)</label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-green/50"
                  placeholder="e.g., Pebble Beach"
                />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-2 block">Date Played</label>
                <input
                  type="date"
                  required
                  value={formData.playedDate}
                  onChange={(e) => setFormData({ ...formData, playedDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-green/50"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-dark-bg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Score'
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Scores List */}
      <div className="space-y-3">
        <AnimatePresence>
          {scores.map((score, index) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4 rounded-xl flex items-center justify-between group"
            >
              {editingId === score.id ? (
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center"
                  />
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                  <input
                    type="date"
                    value={formData.playedDate}
                    onChange={(e) => setFormData({ ...formData, playedDate: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{score.score}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {score.course_name || 'Unknown Course'}
                    </div>
                    <div className="text-sm text-white/50">
                      {new Date(score.played_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(score)}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                >
                  {editingId === score.id ? '✓' : <Edit2 size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(score.id)}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {scores.length === 0 && (
          <div className="text-center py-8 text-white/30">
            No scores yet. Add your first round!
          </div>
        )}
      </div>
    </div>
  )
}
