import { createClient } from '@supabase/supabase-js'

// The anon key is public by design; Row Level Security and the admin-only
// database functions protect the data.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

/** Sample listings store app asset paths; map them to files in /public/sample. */
export function imgUrl(u) {
  if (!u) return ''
  if (u.startsWith('http')) return u
  return '/sample/' + u.split('/').pop()
}

export const fmtMoney = (v) =>
  v == null ? '-' : Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })

export const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-')
