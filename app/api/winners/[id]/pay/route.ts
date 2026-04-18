import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// POST - Mark winner as paid (Admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { paymentMethod, paymentReference } = await req.json()

    const { data: winner } = await supabaseAdmin
      .from('winners')
      .select('id, status')
      .eq('id', params.id)
      .single()

    if (!winner) {
      return NextResponse.json({ error: 'Winner not found' }, { status: 404 })
    }

    if (winner.status !== 'approved') {
      return NextResponse.json(
        { error: 'Winner must be approved before payment' },
        { status: 400 }
      )
    }

    const { data: updatedWinner, error } = await supabaseAdmin
      .from('winners')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
        payment_reference: paymentReference,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      winner: updatedWinner,
      message: 'Winner marked as paid',
    })
  } catch (error: any) {
    console.error('Mark paid error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
