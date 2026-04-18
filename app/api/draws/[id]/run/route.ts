import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { drawAlgorithms } from '../../route'
import { sendEmailByTemplate } from '@/lib/email'

// POST - Run the draw (Admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { isSimulation = false } = await req.json()

    // Get draw
    const { data: draw } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!draw) {
      return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
    }

    if (draw.status === 'completed' && !isSimulation) {
      return NextResponse.json({ error: 'Draw already completed' }, { status: 400 })
    }

    // Generate winning numbers
    const winningNumbers = drawAlgorithms.random(5, 45)

    // Get all entries
    const { data: entries } = await supabaseAdmin
      .from('draw_entries')
      .select('*, users(email, first_name)')
      .eq('draw_id', params.id)

    if (!entries || entries.length === 0) {
      // No entries - rollover to next month
      await supabaseAdmin
        .from('draws')
        .update({
          winning_numbers: winningNumbers,
          status: isSimulation ? 'simulating' : 'completed',
          rollover_amount: draw.total_pool,
          is_simulation: isSimulation,
        })
        .eq('id', params.id)

      return NextResponse.json({
        winningNumbers,
        message: 'No entries - full amount rolled over',
        rollover: draw.total_pool,
      })
    }

    // Calculate matches
    const results = entries.map((entry: any) => {
      const matches = entry.numbers.filter((n: number) => winningNumbers.includes(n)).length
      return { ...entry, matches }
    })

    // Prize distribution
    const totalPool = draw.total_pool + draw.rollover_amount
    const fiveMatchPrize = totalPool * 0.40
    const fourMatchPrize = totalPool * 0.35
    const threeMatchPrize = totalPool * 0.25

    const fiveWinners = results.filter((r: any) => r.matches === 5)
    const fourWinners = results.filter((r: any) => r.matches === 4)
    const threeWinners = results.filter((r: any) => r.matches === 3)

    // Calculate individual prizes
    const fivePrize = fiveWinners.length > 0 ? fiveMatchPrize / fiveWinners.length : 0
    const fourPrize = fourWinners.length > 0 ? fourMatchPrize / fourWinners.length : 0
    const threePrize = threeWinners.length > 0 ? threeMatchPrize / threeWinners.length : 0

    const rollover = fiveWinners.length === 0 ? fiveMatchPrize : 0

    // Update entries with results
    for (const result of results) {
      let prize = 0
      if (result.matches === 5) prize = fivePrize
      else if (result.matches === 4) prize = fourPrize
      else if (result.matches === 3) prize = threePrize

      await supabaseAdmin
        .from('draw_entries')
        .update({
          matches: result.matches,
          prize_amount: prize,
          is_winner: prize > 0,
        })
        .eq('id', result.id)

      // Create winner record if won
      if (prize > 0 && !isSimulation) {
        await supabaseAdmin.from('winners').insert({
          draw_id: params.id,
          user_id: result.user_id,
          entry_id: result.id,
          prize_amount: prize,
          match_count: result.matches,
          status: 'pending',
        })

        // Send winner email
        await sendEmailByTemplate(
          result.users.email,
          'winnerNotification',
          result.users.first_name,
          `$${prize.toFixed(2)}`,
          format(new Date(draw.draw_date), 'MMMM d, yyyy')
        )
      }
    }

    // Update draw
    await supabaseAdmin
      .from('draws')
      .update({
        winning_numbers: winningNumbers,
        status: isSimulation ? 'simulating' : 'published',
        rollover_amount: rollover,
        is_simulation: isSimulation,
        published_at: isSimulation ? null : new Date().toISOString(),
      })
      .eq('id', params.id)

    return NextResponse.json({
      winningNumbers,
      totalEntries: entries.length,
      fiveWinners: fiveWinners.length,
      fourWinners: fourWinners.length,
      threeWinners: threeWinners.length,
      rollover,
      isSimulation,
    })
  } catch (error: any) {
    console.error('Run draw error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function format(date: Date, formatStr: string): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
