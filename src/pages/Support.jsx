import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase.js'
import { Card } from '../components/ui.jsx'

const ago = (v) => {
  const m = Math.round((Date.now() - new Date(v).getTime()) / 60000)
  return m < 1 ? 'now' : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`
}

/** Users and brokers chat with the admin here. */
export default function Support() {
  const [chats, setChats] = useState([])
  const [sel, setSel] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')
  const bottom = useRef(null)

  const loadChats = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_support_chats')
    if (error) setError(error.message)
    else setChats(data)
  }, [])

  const loadMsgs = useCallback(async (id) => {
    if (!id) return
    const { data } = await supabase.from('chat_messages').select('*').eq('conversation_id', id).order('created_at')
    setMsgs(data || [])
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id))
    loadChats()
    const t = setInterval(() => { loadChats(); if (sel) loadMsgs(sel.id) }, 5000)
    return () => clearInterval(t)
  }, [loadChats, loadMsgs, sel])

  useEffect(() => { loadMsgs(sel?.id) }, [sel, loadMsgs])
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send(e) {
    e.preventDefault()
    const body = text.trim()
    if (!body || !sel) return
    setText('')
    const { error } = await supabase.from('chat_messages').insert({ conversation_id: sel.id, body })
    if (error) alert(error.message)
    loadMsgs(sel.id)
    loadChats()
  }

  if (error) return <div className="alert bad">{error}</div>

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Support chat</h1>
          <p>Messages from users and brokers who tapped “Chat with Support”.</p>
        </div>
      </div>
      <Card>
        <div className="chat">
          <div className="chat-list">
            {chats.length === 0 && <div className="empty">No support chats yet.</div>}
            {chats.map((c) => (
              <div key={c.id} className={`chat-item ${sel?.id === c.id ? 'on' : ''}`} onClick={() => setSel(c)}>
                <div className="chat-top">
                  <b>{c.user_name || c.user_phone || 'User'}</b>
                  <span className="sub">{ago(c.last_at)}</span>
                </div>
                <div className="sub clamp">{c.last_body || '—'}</div>
                <div>
                  <span className={`badge ${c.user_role === 'dealer' ? 'ok' : 'muted'}`}>{c.user_role}</span>{' '}
                  {c.waiting && <span className="badge warn">waiting for reply</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="chat-thread">
            {!sel ? <div className="empty">Choose a conversation.</div> : (
              <>
                <div className="chat-head"><b>{sel.user_name || sel.user_phone}</b> <span className="sub">{sel.user_phone}</span></div>
                <div className="chat-msgs">
                  {msgs.map((m) => (
                    <div key={m.id} className={`bubble ${m.sender_id === me ? 'me' : ''}`}>{m.body}</div>
                  ))}
                  <div ref={bottom} />
                </div>
                <form className="chat-input" onSubmit={send}>
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply…" />
                  <button className="btn primary">Send</button>
                </form>
              </>
            )}
          </div>
        </div>
      </Card>
    </>
  )
}
