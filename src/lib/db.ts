import { supabase } from './supabase'

// ═══ PROFILES ═══

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertProfile(userId: string, profile: {
  email?: string; name?: string; language?: string; country?: string; belief?: string
}) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...profile, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

// ═══ CHILDREN ═══

export async function getChildren(userId: string) {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function addChild(userId: string, name: string, ageRange: string) {
  const { data, error } = await supabase
    .from('children')
    .insert({ user_id: userId, name, age_range: ageRange })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteChild(childId: string) {
  const { error } = await supabase
    .from('children')
    .delete()
    .eq('id', childId)
  if (error) throw error
}

// ═══ EXPLANATIONS ═══

export async function saveExplanation(userId: string, explanation: {
  child_id: string; question: string; triggers?: string[];
  trigger_detail?: string; layers: any; parent_tip: string;
  misinfo_tip: string; country?: string; belief?: string; language?: string
}) {
  const { data, error } = await supabase
    .from('explanations')
    .insert({ user_id: userId, ...explanation })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getSavedExplanations(userId: string) {
  const { data, error } = await supabase
    .from('explanations')
    .select('*, children(name, age_range)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function deleteExplanation(explanationId: string) {
  const { error } = await supabase
    .from('explanations')
    .delete()
    .eq('id', explanationId)
  if (error) throw error
}

// ═══ USAGE TRACKING ═══

export async function getUsageCount(userId: string): Promise<number> {
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  const { data, error } = await supabase
    .from('usage_tracking')
    .select('count')
    .eq('user_id', userId)
    .eq('month', month)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data?.count || 0
}

export async function incrementUsage(userId: string): Promise<number> {
  const month = new Date().toISOString().slice(0, 7)
  const current = await getUsageCount(userId)

  if (current === 0) {
    const { error } = await supabase
      .from('usage_tracking')
      .insert({ user_id: userId, month, count: 1 })
    if (error) throw error
    return 1
  } else {
    const { error } = await supabase
      .from('usage_tracking')
      .update({ count: current + 1 })
      .eq('user_id', userId)
      .eq('month', month)
    if (error) throw error
    return current + 1
  }
}

// ═══ SUBSCRIPTIONS ═══

export async function getSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}
