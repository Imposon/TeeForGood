import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmailByTemplate } from '@/lib/email'

// POST - Publish draw results (Admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { data: draw } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!draw) {
      return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
    }

    if (draw.status !== 'simulating') {
      return NextResponse.json(
        { error: 'Draw must be in simulation mode before publishing' },
        { status: 400 }
      )
    }

    // Get all entries with users
    const { data: entries } = await supabaseAdmin
      .from('draw_entries')
      .select('*, users(email, first_name)')
      .eq('draw_id', params.id)

    // Create winner records and send emails
    for (const entry of entries || []) {
      if (entry.is_winner) {
        await supabaseAdmin.from('winners').insert({
          draw_id: params.id,
          user_id: entry.user_id,
          entry_id: entry.id,
          prize_amount: entry.prize_amount,
          match_count: entry.matches,
          status: 'pending',
        })

        // Send winner notification
        await sendEmailByTemplate(
          entry.users.email,
          'winnerNotification',
          entry.users.first_name,
          `$${entry.prize_amount.toFixed(2)}`,
          new Date(draw.draw_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        )
      }

      // Send results email to all participants
      await sendEmailByTemplate(
        entry.users.email,
        'drawResults',
        entry.users.first_name,
        entry.matches,
        entry.is_winner,
        entry.is_winner ? `$${entry.prize_amount.toFixed(2)}` : undefined
      )
    }

    // Update draw to published
    await supabaseAdmin
      .from('draws')
      .update({
        status: 'published',
        is_simulation: false,
        published_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    return NextResponse.json({ success: true, message: 'Draw results published' })
  } catch (error: any) {
    console.error('Publish draw error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
