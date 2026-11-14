import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase.js'

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'; o.frequency.value = 880
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    o.start(); o.stop(ctx.currentTime + 0.4)
  } catch { /* audio is optional */ }
}

/**
 * Live alerts for the admin: a pop-up inside the portal, a sound, and a desktop
 * notification when the browser allows it. `onEvent` lets the sidebar refresh its counts.
 */
export function useAlerts(userId, onEvent) {
  const [toasts, setToasts] = useState([])
  const [perm, setPerm] = useState(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)
  const seen = useRef(new Set())

  const notify = useCallback((title, body, to) => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t.slice(-3), { id, title, body, to }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 9000)
    beep()
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) {
      try { new Notification(title, { body }) } catch { /* ignore */ }
    }
    onEvent?.()
  }, [onEvent])

  useEffect(() => {
    if (!userId) return
    const once = (key, fn) => { if (!seen.current.has(key)) { seen.current.add(key); fn() } }

    const ch = supabase.channel('admin-alerts')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, ({ new: r }) => {
        if (r.dealer_status === 'pending') once('b' + r.id + r.company, () => notify('Broker to verify', `${r.company || r.full_name || 'A broker'} applied`, '/verify/brokers'))
        else if (r.identity_status === 'pending') once('u' + r.id + r.national_id, () => notify('User to verify', `${r.full_name || r.phone || 'A user'} sent an ID`, '/verify/users'))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'property_listings' }, ({ new: r }) => {
        if (r.status === 'pending') notify('Property to verify', r.title_en || 'New listing', '/verify/properties')
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'complaints' }, ({ new: r }) => {
        notify('New complaint', r.subject, '/complaints')
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, ({ new: r }) => {
        if (r.method === 'cash') notify('Cash payment waiting', `${r.amount} ${r.currency}`, '/payments')
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, async ({ new: m }) => {
        if (m.sender_id === userId) return
        const { data: c } = await supabase.from('conversations').select('listing_id,user_id').eq('id', m.conversation_id).maybeSingle()
        if (c?.listing_id === 'support' && c.user_id === m.sender_id) notify('Support message', m.body.slice(0, 90), '/support')
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visits' }, ({ new: r }) => {
        notify('New visit booking', r.property_title || 'A property', '/visits')
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [userId, notify])

  const enable = async () => {
    if (typeof Notification === 'undefined') return
    setPerm(await Notification.requestPermission())
  }

  return { toasts, dismiss: (id) => setToasts((t) => t.filter((x) => x.id !== id)), perm, enable }
}
