import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    await requireAdmin()

    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get total donations
    const { data: donations } = await supabaseAdmin
      .from('donations')
      .select('amount')

    const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

    // Get pending winners
    const { count: pendingWinners } = await supabaseAdmin
      .from('winners')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get current month pool
    const now = new Date()
    const { data: currentDraw } = await supabaseAdmin
      .from('draws')
      .select('total_pool')
      .gte('draw_date', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
      .lt('draw_date', new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString())
      .single()

    const stats = {
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      totalDonations,
      pendingWinners: pendingWinners || 0,
      currentMonthPool: currentDraw?.total_pool || 0,
    }

    return NextResponse.json({ stats })
  } catch (error: any) {
    console.error('Get admin stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
