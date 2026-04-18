import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { sendEmailByTemplate } from '@/lib/email'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  charityId: z.string().uuid().optional(),
  charityPercentage: z.number().min(10).max(100).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = signupSchema.parse(body)

    // Check if email exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', validated.email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: validated.email,
        password_hash: passwordHash,
        first_name: validated.firstName,
        last_name: validated.lastName,
        charity_id: validated.charityId || null,
        charity_percentage: validated.charityPercentage || 10,
      } as any)
      .select()
      .single()

    if (error) throw error

    // Type assertion needed due to Supabase type inference issue
    const userData = user as any

    // Generate token and set cookie
    const token = generateToken({
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      subscriptionStatus: userData.subscription_status,
    })
    setAuthCookie(token)

    // Send welcome email
    await sendEmailByTemplate(userData.email, 'signup', userData.first_name)

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        subscriptionStatus: userData.subscription_status,
      },
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Signup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
