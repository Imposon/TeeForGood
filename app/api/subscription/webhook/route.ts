import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/client'
import { sendEmailByTemplate } from '@/lib/email'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, plan } = session.metadata!

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

        // Create or update subscription record
        ;(supabaseAdmin as any).from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          plan_type: plan,
          status: 'active',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })

        // Update user subscription status
        await (supabaseAdmin as any)
          .from('users')
          .update({ subscription_status: 'active' })
          .eq('id', userId)

        // Record payment
        await (supabaseAdmin as any).from('payments').insert({
          user_id: userId,
          stripe_payment_intent_id: session.payment_intent as string,
          amount: session.amount_total! / 100,
          currency: session.currency?.toUpperCase() || 'USD',
          status: 'succeeded',
        })

        // Send welcome email
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('email, first_name')
          .eq('id', userId)
          .single()

        if (userData) {
          const userRecord = userData as any
          await sendEmailByTemplate(
            userRecord.email,
            'subscriptionSuccess',
            userRecord.first_name,
            plan
          )
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
        
        await (supabaseAdmin as any)
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        await (supabaseAdmin as any)
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'cancelled',
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        // Update user status if cancelled
        if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
          const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

          if (sub) {
            const subRecord = sub as any
            await (supabaseAdmin as any)
              .from('users')
              .update({ subscription_status: subscription.status === 'canceled' ? 'expired' : 'cancelled' })
              .eq('id', subRecord.user_id)
          }
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        await (supabaseAdmin as any)
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('stripe_subscription_id', subscription.id)

        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (sub) {
          const subRecord = sub as any
          await (supabaseAdmin as any)
            .from('users')
            .update({ subscription_status: 'expired' })
            .eq('id', subRecord.user_id)
        }

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
