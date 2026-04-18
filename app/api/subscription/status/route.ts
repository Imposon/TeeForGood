import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const user = await requireAuth()

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.userId)
      .order('payment_date', { ascending: false })
      .limit(5)

    return NextResponse.json({
      subscription,
      payments,
      status: subscription?.status || 'inactive',
    })
  } catch (error: any) {
    console.error('Get subscription status error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
