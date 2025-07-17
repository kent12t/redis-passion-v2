import { createClient, PostgrestError, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if environment variables are available
export const supabase: SupabaseClient | null = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Helper function to check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
}

export interface ActivityRecord {
  id?: number
  created_at?: string
  personality: string | null
  session_id: string | null
  completed: boolean
}

// Generate a unique session ID
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Create a new activity record
export async function createActivityRecord(sessionId: string): Promise<{ data: ActivityRecord | null, error: PostgrestError | null }> {
  if (!supabase) {
    // Don't log warnings in production or when Supabase is intentionally not configured
    if (process.env.NODE_ENV === 'development') {
      console.info('Supabase not configured - skipping activity record creation');
    }
    return { data: null, error: null }
  }
  
  try {
    const { data, error } = await supabase
      .from('activity_record')
      .insert([
        {
          session_id: sessionId,
          personality: null,
          completed: false
        }
      ])
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Error creating activity record:', error)
    return { data: null, error: null }
  }
}

// Update activity record with personality result
export async function updateActivityRecord(sessionId: string, personality: string): Promise<{ data: ActivityRecord | null, error: PostgrestError | null }> {
  if (!supabase) {
    if (process.env.NODE_ENV === 'development') {
      console.info('Supabase not configured - skipping activity record update');
    }
    return { data: null, error: null }
  }
  
  try {
    const { data, error } = await supabase
      .from('activity_record')
      .update({
        personality,
        completed: true
      })
      .eq('session_id', sessionId)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    console.error('Error updating activity record:', error)
    return { data: null, error: null }
  }
} 