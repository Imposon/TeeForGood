import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - List winners (user sees own, admin sees all)
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    let query = supabaseAdmin
      .from('winners')
      .select('*, users(first_name, last_name, email), draws(draw_date)')

    // Non-admins only see their own winnings
    if (user.role !== 'admin') {
      query = query.eq('user_id', user.userId)
    }

    const { data: winners, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ winners: winners || [] })
  } catch (error: any) {
    console.error('Get winners error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Upload proof (user)
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const formData = await req.formData()
    const winnerId = formData.get('winnerId') as string
    const proofImage = formData.get('proofImage') as File

    if (!winnerId || !proofImage) {
      return NextResponse.json(
        { error: 'Winner ID and proof image required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: winner } = await supabase
      .from('winners')
      .select('id, status')
      .eq('id', winnerId)
      .eq('user_id', user.userId)
      .single()

    if (!winner) {
      return NextResponse.json({ error: 'Winner record not found' }, { status: 404 })
    }

    if (winner.status !== 'pending') {
      return NextResponse.json(
        { error: 'Proof already submitted or processed' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const fileExt = proofImage.name.split('.').pop()
    const fileName = `proofs/${winnerId}_${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('winner-proofs')
      .upload(fileName, proofImage, {
        contentType: proofImage.type,
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('winner-proofs')
      .getPublicUrl(fileName)

    // Update winner record
    await supabase
      .from('winners')
      .update({
        proof_image_url: urlData.publicUrl,
        proof_uploaded_at: new Date().toISOString(),
      })
      .eq('id', winnerId)

    return NextResponse.json({
      success: true,
      proofUrl: urlData.publicUrl,
    })
  } catch (error: any) {
    console.error('Upload proof error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
