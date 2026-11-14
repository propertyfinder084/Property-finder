import { useEffect, useMemo, useState } from 'react'
import { supabase, fmtDate } from '../supabase.js'
import { Badge, Card, Modal, Tabs } from '../components/ui.jsx'

const STATUS_TONE = { open: 'warn', in_review: 'info', resolved: 'ok', rejected: 'muted' }

export default function Complaints() {
  const [rows, setRows] = useState([])
  const [tab, setTab] = useState('open')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_complaints')
    if (error) setError(error.message)
    else setRows(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const groups = useMemo(() => ({
    open: rows.filter((r) => r.status === 'open' || r.status === 'in_review'),
    done: rows.filter((r) => r.status === 'resolved' || r.status === 'rejected'),
  }), [rows])
  const shown = tab === 'open' ? groups.open : tab === 'done' ? groups.done : rows

  if (error) return <div className="alert bad">{error}</div>

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Complaints</h1>
          <p>Complaints from users and brokers. Your answer appears in their app.</p>
        </div>
      </div>
      <Tabs value={tab} onChange={setTab} items={[['open', 'To resolve', groups.open.length], ['done', 'Resolved', groups.done.length], ['all', 'All', rows.length]]} />
      <Card>
        {loading ? <div className="center">Loading…</div> : shown.length === 0 ? <div className="empty">No complaints.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>From</th><th>About</th><th>Subject</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id}>
                    <td>{fmtDate(c.created_at)}</td>
                    <td><b>{c.user_name || '—'}</b><div className="sub">{c.user_phone}</div></td>
                    <td className="cap">{c.target_type}{c.target_ref && <div className="sub">{c.target_ref}</div>}</td>
                    <td>{c.subject}<div className="sub clamp">{c.body}</div></td>
                    <td><span className={`badge ${STATUS_TONE[c.status]}`}>{c.status.replace('_', ' ')}</span></td>
                    <td><button className="btn small" onClick={() => setOpen(c)}>{c.status === 'open' || c.status === 'in_review' ? 'Resolve' : 'View'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {open && <ResolveModal c={open} onClose={() => setOpen(null)} onDone={() => { setOpen(null); load() }} />}
    </>
  )
}

function ResolveModal({ c, onClose, onDone }) {
  const [response, setResponse] = useState(c.admin_response || '')
  const [busy, setBusy] = useState(false)

  async function save(status) {
    if ((status === 'resolved' || status === 'rejected') && !response.trim()) return alert('Write a short answer for the user first.')
    setBusy(true)
    const { error } = await supabase.rpc('admin_resolve_complaint', { p_id: c.id, p_status: status, p_response: response.trim() || null })
    setBusy(false)
    if (error) return alert(error.message)
    onDone()
  }

  return (
    <Modal onClose={onClose}>
      <h2>{c.subject}</h2>
      <dl style={{ margin: '12px 0' }}>
        <dt>From</dt><dd>{c.user_name || '—'} {c.user_phone && `(${c.user_phone})`}</dd>
        <dt>About</dt><dd className="cap">{c.target_type}{c.target_ref ? ` · ${c.target_ref}` : ''}</dd>
        <dt>Sent</dt><dd>{fmtDate(c.created_at)}</dd>
        <dt>Status</dt><dd><span className={`badge ${STATUS_TONE[c.status]}`}>{c.status.replace('_', ' ')}</span></dd>
      </dl>
      <p className="desc" style={{ maxHeight: 160 }}>{c.body}</p>
      <label>Your answer (the user sees this)</label>
      <textarea rows="4" value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Explain what was done…" />
      <div className="actions">
        <button className="btn" disabled={busy} onClick={() => save('in_review')}>Mark in review</button>
        <button className="btn bad" disabled={busy} onClick={() => save('rejected')}>Close without action</button>
        <button className="btn primary" disabled={busy} onClick={() => save('resolved')}>Resolve</button>
      </div>
    </Modal>
  )
}
