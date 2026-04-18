import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { requireAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.userId)
      .eq('status', 'active')
      .single()

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Update local record
    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('stripe_subscription_id', subscription.stripe_subscription_id)

    await supabase
      .from('users')
      .update({ subscription_status: 'cancelled' })
      .eq('id', user.userId)

    return NextResponse.json({ success: true, message: 'Subscription will cancel at period end' })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
