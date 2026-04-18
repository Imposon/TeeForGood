import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('*, charities(*)')
      .eq('id', authUser.userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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
        charity: user.charities,
      },
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
