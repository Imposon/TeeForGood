import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = loginSchema.parse(body)

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', validated.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(validated.password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate token and set cookie
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscription_status,
    })
    setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        subscriptionStatus: user.subscription_status,
        charityId: user.charity_id,
        charityPercentage: user.charity_percentage,
      },
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Login error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
