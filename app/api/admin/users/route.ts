import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - List all users (Admin only)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabaseAdmin
      .from('users')
      .select('*, charities(name), subscriptions(*)')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('subscription_status', status)
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error } = await query.limit(100)

    if (error) throw error

    return NextResponse.json({ users: users || [] })
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update user (Admin only)
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const { userId, updates } = await req.json()

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'User ID and updates required' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
