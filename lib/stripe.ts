import Stripe from 'stripe'
import { supabase } from './supabase'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const getOrCreateCustomer = async (userId: string, email: string) => {
  const { data: existingCustomer } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (existingCustomer?.stripe_customer_id) {
    return existingCustomer.stripe_customer_id
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  })

  return customer.id
}

// Price IDs for subscription plans
export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
  yearly: process.env.STRIPE_YEARLY_PRICE_ID!,
}
