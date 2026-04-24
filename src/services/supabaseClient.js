
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase keys missing. Auth will not work until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

/** Save (upsert) a resume row for the given user. */
export async function syncResumeToCloud(userId, resumeData, isPaid) {
  const { data, error } = await supabase
    .from('resumes')
    .upsert({
      user_id: userId,
      resume_data: resumeData,
      is_paid: isPaid,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (error) throw error
  return data
}

/**
 * Load a user's resume row from Supabase.
 * Returns { resume_data, is_paid } or null if no row found.
 */
export async function loadResumeFromCloud(userId) {
  const { data, error } = await supabase
    .from('resumes')
    .select('resume_data, is_paid')
    .eq('user_id', userId)
    .single()

  if (error) {
    // PGRST116 = "no rows found" — not a real error
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data // { resume_data, is_paid }
}

/**
 * Mark a user as a paid customer in Supabase.
 * Called after Stripe payment is verified — this is the single source of truth
 * for premium status across all devices.
 */
export async function markUserAsPaid(userId) {
  const { error } = await supabase
    .from('resumes')
    .upsert({
      user_id: userId,
      is_paid: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (error) throw error
}

/** 
 * ==========================================
 * DASHBOARD / MULTI-RESUME SUPPORT
 * ==========================================
 */

export async function getUserDocuments(userId) {
  const { data, error } = await supabase
    .from('documents')
    .select('id, name, updated_at, views_count, template')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getDocumentById(docId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', docId)
    .single()

  if (error) throw error
  return data
}

export async function createDocument(userId, name, resumeData, template = 'classic') {
  const { data, error } = await supabase
    .from('documents')
    .insert([{
      user_id: userId,
      name,
      resume_data: resumeData,
      template,
      updated_at: new Date().toISOString()
    }])
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function duplicateDocument(docId, userId) {
  // 1. Fetch original
  const { data: original, error: fetchErr } = await supabase
    .from('documents')
    .select('*')
    .eq('id', docId)
    .single()
  
  if (fetchErr) throw fetchErr

  // 2. Insert copy
  const { data: copy, error: insertErr } = await supabase
    .from('documents')
    .insert([{
      user_id: userId,
      name: `${original.name || 'Untitled'} (Copy)`,
      resume_data: original.resume_data,
      template: original.template || 'classic',
      is_public: false, // Default to private for copies
      views_count: 0,   // Reset view count
      updated_at: new Date().toISOString()
    }])
    .select('id')
    .single()

  if (insertErr) throw insertErr
  return copy.id
}

export async function incrementViewCount(docId) {
  // We use an RPC or a direct update. Direct update is simpler for now.
  // Note: This is an optimistic increment.
  const { data, error } = await supabase.rpc('increment_document_views', { doc_id: docId })
  
  // If RPC doesn't exist, fallback to direct update (less atomic but works)
  if (error) {
     const { data: current } = await supabase.from('documents').select('views_count').eq('id', docId).single()
     await supabase.from('documents').update({ views_count: (current?.views_count || 0) + 1 }).eq('id', docId)
  }
}

export async function updateDocument(docId, name, resumeData, isPublic, template) {
  const payload = { updated_at: new Date().toISOString() }
  if (name !== undefined && name !== null) payload.name = name
  if (resumeData !== undefined) payload.resume_data = resumeData
  if (isPublic !== undefined) payload.is_public = isPublic
  if (template !== undefined) payload.template = template

  const { error } = await supabase
    .from('documents')
    .update(payload)
    .eq('id', docId)

  if (error) throw error
}

export async function deleteDocument(docId) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId)

  if (error) throw error
}

/** 
 * Purges all user data. 
 * If the 'delete_user_account' RPC is set up in Supabase, it will also delete the auth record.
 */
export async function deleteUserAccount(userId) {
  try {
     // 1. Delete all documents
     await supabase.from('documents').delete().eq('user_id', userId)
     
     // 2. Delete profile row
     await supabase.from('resumes').delete().eq('user_id', userId)

     // 3. Attempt to delete the Auth record via RPC
     const { error: rpcError } = await supabase.rpc('delete_user_account')
     if (rpcError) console.warn("RPC Deletion skipped or failed:", rpcError.message)

  } catch (err) {
     console.error("Data purge failed:", err)
     // We continue to sign out regardless to "soft delete" the session
  } finally {
     // 4. Finally, sign out
     await supabase.auth.signOut()
  }
}
