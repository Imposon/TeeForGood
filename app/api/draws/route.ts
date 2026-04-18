import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth } from 'date-fns'

// Draw algorithms
export const drawAlgorithms = {
  // Random generation
  random: (count: number = 5, max: number = 45): number[] => {
    const numbers = new Set<number>()
    while (numbers.size < count) {
      numbers.add(Math.floor(Math.random() * max) + 1)
    }
    return Array.from(numbers).sort((a, b) => a - b)
  },

  // Weighted based on user scores (lower scores = higher weight)
  weighted: async (userId: string, supabaseClient: any): Promise<number[]> => {
    const { data: scores } = await supabaseClient
      .from('scores')
      .select('score')
      .eq('user_id', userId)
      .order('played_date', { ascending: false })
      .limit(5)

    if (!scores || scores.length === 0) {
      return drawAlgorithms.random()
    }

    const avgScore = scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length
    
    // Generate numbers with bias toward lower numbers for better golfers
    const numbers = new Set<number>()
    const bias = Math.max(1, 10 - Math.floor(avgScore / 10)) // Lower score = lower number bias
    
    while (numbers.size < 5) {
      // Weighted random: better golfers get lower numbers
      const weightedRandom = Math.floor(Math.random() * (45 - bias + 1)) + bias
      numbers.add(Math.max(1, Math.min(45, weightedRandom)))
    }
    
    return Array.from(numbers).sort((a, b) => a - b)
  },
}

// GET - List draws
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('draws')
      .select('*')
      .order('draw_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: draws, error } = await query.limit(12)

    if (error) throw error

    return NextResponse.json({ draws: draws || [] })
  } catch (error: any) {
    console.error('Get draws error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create draw entry for current user
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { algorithm = 'random' } = await req.json()

    // Check if user has active subscription
    if (user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Active subscription required' },
        { status: 403 }
      )
    }

    // Get current month's draw
    const now = new Date()
    const { data: draw } = await supabaseAdmin
      .from('draws')
      .select('*')
      .gte('draw_date', startOfMonth(now).toISOString())
      .lte('draw_date', endOfMonth(now).toISOString())
      .eq('status', 'pending')
      .single()

    if (!draw) {
      return NextResponse.json(
        { error: 'No active draw for this month' },
        { status: 400 }
      )
    }

    // Check if already entered
    const { data: existing } = await supabase
      .from('draw_entries')
      .select('id')
      .eq('draw_id', draw.id)
      .eq('user_id', user.userId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already entered this draw' },
        { status: 400 }
      )
    }

    // Generate numbers
    const numbers = algorithm === 'weighted'
      ? await drawAlgorithms.weighted(user.userId, supabase)
      : drawAlgorithms.random()

    // Create entry
    const { data: entry, error } = await supabase
      .from('draw_entries')
      .insert({
        draw_id: draw.id,
        user_id: user.userId,
        numbers,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ entry })
  } catch (error: any) {
    console.error('Create draw entry error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
