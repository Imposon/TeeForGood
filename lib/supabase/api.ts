import { supabase, supabaseAdmin, User, Score, Draw, DrawEntry, Charity, Winnings, Subscription } from './client'

// ============================================================
// USER API
// ============================================================

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data, error } = await supabase
    .from('users')
    .select('*, charities(*)')
    .eq('id', authUser.id)
    .single()

  if (error) throw error
  return data
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const { data, error } = await (supabase as any)
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
// SCORES API (Last 5 Only)
// ============================================================

export async function getUserScores(userId: string): Promise<Score[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_date', { ascending: false })
    .limit(5)

  if (error) throw error
  return data || []
}

export async function addScore(scoreData: Omit<Score, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await (supabase as any)
    .from('scores')
    .insert(scoreData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateScore(scoreId: string, updates: Partial<Score>) {
  const { data, error } = await (supabase as any)
    .from('scores')
    .update(updates)
    .eq('id', scoreId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteScore(scoreId: string) {
  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', scoreId)

  if (error) throw error
}

// ============================================================
// CHARITIES API
// ============================================================

export async function getCharities(options?: { 
  featured?: boolean
  category?: string
  search?: string 
}): Promise<Charity[]> {
  let query = supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)

  if (options?.featured) {
    query = query.eq('is_featured', true)
  }

  if (options?.category) {
    query = query.eq('category', options.category)
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
  }

  const { data, error } = await query.order('is_featured', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getCharityBySlug(slug: string): Promise<Charity | null> {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data
}

// ============================================================
// DRAWS API
// ============================================================

export async function getCurrentDraw(): Promise<Draw | null> {
  const now = new Date()
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('year', now.getFullYear())
    .eq('month', now.getMonth() + 1)
    .single()

  if (error) return null
  return data
}

export async function getDraws(status?: Draw['status']): Promise<Draw[]> {
  let query = supabase
    .from('draws')
    .select('*')
    .order('draw_date', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.limit(12)

  if (error) throw error
  return data || []
}

export async function getDrawEntries(drawId: string): Promise<DrawEntry[]> {
  const { data, error } = await supabase
    .from('draw_entries')
    .select('*, users(first_name, last_name)')
    .eq('draw_id', drawId)

  if (error) throw error
  return data || []
}

export async function getUserDrawEntry(userId: string, drawId: string): Promise<DrawEntry | null> {
  const { data, error } = await supabase
    .from('draw_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('draw_id', drawId)
    .single()

  if (error) return null
  return data
}

export async function enterDraw(
  drawId: string, 
  userId: string, 
  numbers: number[],
  method: 'random' | 'weighted' | 'manual' = 'random'
) {
  const { data, error } = await (supabase as any)
    .from('draw_entries')
    .insert({
      draw_id: drawId,
      user_id: userId,
      numbers,
      entry_method: method,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
// WINNINGS API
// ============================================================

export async function getUserWinnings(userId: string): Promise<Winnings[]> {
  const { data, error } = await supabase
    .from('winnings')
    .select('*, draws(draw_date, winning_numbers)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function uploadWinningProof(winningId: string, imageUrl: string) {
  const { data, error } = await (supabase as any)
    .from('winnings')
    .update({
      proof_image_url: imageUrl,
      proof_uploaded_at: new Date().toISOString(),
      status: 'proof_submitted',
    })
    .eq('id', winningId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
// SUBSCRIPTIONS API
// ============================================================

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data
}

// ============================================================
// ADMIN API (requires service role)
// ============================================================

export async function adminGetAllUsers() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*, subscriptions(*), charities(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function adminUpdateDraw(drawId: string, updates: Partial<Draw>) {
  const { data, error } = await (supabaseAdmin as any)
    .from('draws')
    .update(updates)
    .eq('id', drawId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function adminGetPendingWinnings() {
  const { data, error } = await supabaseAdmin
    .from('winnings')
    .select('*, users(first_name, last_name, email), draws(draw_date)')
    .eq('status', 'proof_submitted')
    .order('proof_uploaded_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function adminVerifyWinning(
  winningId: string, 
  status: 'approved' | 'rejected',
  adminId: string,
  notes?: string
) {
  const { data, error } = await (supabaseAdmin as any)
    .from('winnings')
    .update({
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
    })
    .eq('id', winningId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================

export function subscribeToUserScores(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`scores:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'scores',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}

export function subscribeToDrawResults(drawId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`draw:${drawId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'draws',
        filter: `id=eq.${drawId}`,
      },
      callback
    )
    .subscribe()
}
