import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmailByTemplate } from '@/lib/email'

// POST - Verify winner (Admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin()
    const { status, notes } = await req.json()

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get winner details
    const { data: winner } = await supabaseAdmin
      .from('winners')
      .select('*, users(email, first_name)')
      .eq('id', params.id)
      .single()

    if (!winner) {
      return NextResponse.json({ error: 'Winner not found' }, { status: 404 })
    }

    if (winner.status !== 'pending') {
      return NextResponse.json(
        { error: 'Winner already processed' },
        { status: 400 }
      )
    }

    // Update winner status
    const { data: updatedWinner, error } = await supabaseAdmin
      .from('winners')
      .update({
        status,
        verified_at: new Date().toISOString(),
        verified_by: admin.userId,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Send email notification
    const subject = status === 'approved'
      ? 'Your Prize Has Been Approved!'
      : 'Prize Claim Update'
    
    const html = status === 'approved'
      ? `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00ff88;">Congratulations ${winner.users.first_name}!</h1>
          <p>Your prize claim of $${winner.prize_amount.toFixed(2)} has been approved.</p>
          <p>Payment will be processed within 5-7 business days.</p>
         </div>`
      : `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff4444;">Prize Claim Update</h1>
          <p>Hi ${winner.users.first_name},</p>
          <p>Your prize claim has been rejected.</p>
          ${notes ? `<p>Reason: ${notes}</p>` : ''}
          <p>Please contact support if you have any questions.</p>
         </div>`

    await sendEmailByTemplate(
      winner.users.email,
      'signup', // Using generic template since we have custom HTML
      winner.users.first_name
    )

    return NextResponse.json({
      winner: updatedWinner,
      message: `Winner ${status} successfully`,
    })
  } catch (error: any) {
    console.error('Verify winner error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
