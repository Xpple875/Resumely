
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase keys missing. Auth will not work until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.')
}

// We initialize even if empty to prevent 'cannot read auth of null'
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

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
