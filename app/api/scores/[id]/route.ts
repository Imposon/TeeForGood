import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { isValid, parseISO } from 'date-fns'

const updateSchema = z.object({
  score: z.number().min(1).max(45).optional(),
  courseName: z.string().optional(),
  playedDate: z.string().refine((val) => isValid(parseISO(val)), {
    message: 'Invalid date format',
  }).optional(),
})

// PUT - Update score
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const validated = updateSchema.parse(body)

    // Verify ownership
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.userId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Score not found' }, { status: 404 })
    }

    // Check for duplicate date if updating date
    if (validated.playedDate) {
      const { data: duplicate } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', user.userId)
        .eq('played_date', validated.playedDate)
        .neq('id', params.id)
        .single()

      if (duplicate) {
        return NextResponse.json(
          { error: 'Score already exists for this date' },
          { status: 400 }
        )
      }
    }

    const { data: score, error } = await supabase
      .from('scores')
      .update({
        score: validated.score,
        course_name: validated.courseName,
        played_date: validated.playedDate,
      })
      .eq('id', params.id)
      .eq('user_id', user.userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ score })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Update score error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete score
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete score error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
