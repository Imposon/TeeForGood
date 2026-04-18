import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'
import { isValid, parseISO, format } from 'date-fns'

const scoreSchema = z.object({
  score: z.number().min(1, 'Score must be at least 1').max(45, 'Score must be at most 45'),
  courseName: z.string().max(100, 'Course name too long').optional(),
  playedDate: z.string().refine((val) => isValid(parseISO(val)), {
    message: 'Invalid date format. Use YYYY-MM-DD',
  }),
})

// GET - List user's scores (last 5, reverse chronological)
export async function GET() {
  try {
    const user = await requireAuth()

    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.userId)
      .order('played_date', { ascending: false })
      .limit(5)

    if (error) throw error

    return NextResponse.json({ scores: scores || [] })
  } catch (error: any) {
    console.error('Get scores error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Add new score (replaces oldest if > 5)
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const validated = scoreSchema.parse(body)

    // Check for duplicate date
    const { data: existingDate } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', user.userId)
      .eq('played_date', validated.playedDate)
      .single()

    if (existingDate) {
      return NextResponse.json(
        { error: 'Score already exists for this date' },
        { status: 400 }
      )
    }

    // Get current scores count
    const { data: currentScores } = await supabase
      .from('scores')
      .select('id, created_at')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: true })

    // If 5 scores exist, delete the oldest
    if (currentScores && currentScores.length >= 5) {
      const oldestScore = currentScores[0] as any
      await supabase.from('scores').delete().eq('id', oldestScore.id)
    }

    // Insert new score
    const { data: score, error } = await supabase
      .from('scores')
      .insert({
        user_id: user.userId,
        score: validated.score,
        course_name: validated.courseName || null,
        played_date: validated.playedDate,
      } as any)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ score })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Add score error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
