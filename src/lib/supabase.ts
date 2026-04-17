import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const missing = []
if (!supabaseUrl) missing.push('VITE_SUPABASE_URL')
if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY')

if (missing.length) {
  throw new Error(
    `[FinTrack] Missing env vars: ${missing.join(', ')}. ` +
    `Copy .env.example to .env and fill in your Supabase credentials.`
  )
}

try {
  new URL(supabaseUrl)
} catch {
  throw new Error(`[FinTrack] VITE_SUPABASE_URL is not a valid URL: ${supabaseUrl}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
