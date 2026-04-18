import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'

// GET - List charities (public access for signup)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    let query = supabase
      .from('charities')
      .select('*')
      .eq('is_active', true)

    if (category) {
      query = query.eq('category', category)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    const { data: charities, error } = await query.order('is_featured', { ascending: false })

    if (error) throw error

    return NextResponse.json({ charities: charities || [] })
  } catch (error: any) {
    console.error('Get charities error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update user's charity selection
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { charityId, charityPercentage } = await req.json()

    if (!charityId) {
      return NextResponse.json({ error: 'Charity ID required' }, { status: 400 })
    }

    if (charityPercentage < 10 || charityPercentage > 100) {
      return NextResponse.json(
        { error: 'Charity percentage must be between 10 and 100' },
        { status: 400 }
      )
    }

    // Verify charity exists
    const { data: charity } = await supabase
      .from('charities')
      .select('id')
      .eq('id', charityId)
      .single()

    if (!charity) {
      return NextResponse.json({ error: 'Charity not found' }, { status: 404 })
    }

    const { data: userData, error } = await supabase
      .from('users')
      // @ts-ignore - Supabase type inference issue
      .update({
        charity_id: charityId,
        charity_percentage: charityPercentage,
      })
      .eq('id', user.userId)
      .select('*, charities(*)')
      .single()

    if (error) throw error

    const userRecord = userData as any
    return NextResponse.json({
      user: {
        charityId: userRecord.charity_id,
        charityPercentage: userRecord.charity_percentage,
        charity: userRecord.charities,
      },
    })
  } catch (error: any) {
    console.error('Update charity error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
