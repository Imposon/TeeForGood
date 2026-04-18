import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_IDS, getOrCreateCustomer } from '@/lib/stripe'
import { requireAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { plan } = await req.json()

    if (!['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Type assertion for user data
    const userRecord = userData as any

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(user.userId, userRecord.email)

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.userId,
        plan,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
