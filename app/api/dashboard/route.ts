import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const user = await requireAuth()

    // Fetch all dashboard data in parallel
    const [
      scoresResult,
      subscriptionResult,
      donationsResult,
      drawEntriesResult,
      winningsResult,
      currentDrawResult,
      charityResult
    ] = await Promise.all([
      // Last 5 scores
      supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.userId)
        .order('played_date', { ascending: false })
        .limit(5),

      // Active subscription
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),

      // Total donations
      supabase
        .from('donations')
        .select('amount')
        .eq('user_id', user.userId)
        .eq('payment_status', 'completed'),

      // Draw entries count
      supabase
        .from('draw_entries')
        .select('id', { count: 'exact' })
        .eq('user_id', user.userId),

      // Winnings
      supabase
        .from('winnings')
        .select('*')
        .eq('user_id', user.userId)
        .order('created_at', { ascending: false }),

      // Current month draw
      supabase
        .from('draws')
        .select('*')
        .eq('year', new Date().getFullYear())
        .eq('month', new Date().getMonth() + 1)
        .single(),

      // User's charity
      supabase
        .from('users')
        .select('charity_id, charity_percentage, charities(*)')
        .eq('id', user.userId)
        .single()
    ])

    // Calculate statistics - cast to any due to Supabase type inference issues
    const scores = (scoresResult.data || []) as any[]
    const donations = (donationsResult.data || []) as any[]
    const winnings = (winningsResult.data || []) as any[]
    
    const totalDonated = donations.reduce((sum, d) => sum + (d.amount || 0), 0)
    const totalWinnings = winnings
      .filter(w => w.status === 'paid' || w.status === 'approved')
      .reduce((sum, w) => sum + (w.prize_amount || 0), 0)
    
    const bestScore = scores.length > 0 ? Math.min(...scores.map(s => s.score)) : null
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
      : null

    let hasEnteredCurrentDraw = false
    const currentDraw = (currentDrawResult as any).data
    if (currentDraw) {
      const drawId = currentDraw.id
      const entryResult = await (supabase as any)
        .from('draw_entries')
        .select('id')
        .eq('user_id', user.userId)
        .eq('draw_id', drawId)
        .single()
      hasEnteredCurrentDraw = !!(entryResult as any).data
    }

    return NextResponse.json({
      stats: {
        scores: {
          list: scores,
          count: scores.length,
          best: bestScore,
          average: averageScore
        },
        subscription: subscriptionResult.data || null,
        donations: {
          total: totalDonated,
          count: donations.length,
          percentage: (charityResult.data as any)?.charity_percentage || 10,
          charity: (charityResult.data as any)?.charities || null
        },
        draws: {
          totalEntries: drawEntriesResult.count || 0,
          hasEnteredCurrent: hasEnteredCurrentDraw,
          currentDraw: currentDrawResult.data || null
        },
        winnings: {
          total: totalWinnings,
          count: winnings.length,
          pending: winnings.filter((w: any) => w.status === 'pending').length,
          list: winnings.slice(0, 5)
        }
      }
    })

  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load dashboard' },
      { status: 500 }
    )
  }
}
