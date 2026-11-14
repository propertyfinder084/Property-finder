import { useEffect, useMemo, useState } from 'react'
import { supabase, fmtDate } from '../supabase.js'
import { Badge, Card, Modal, Tabs } from '../components/ui.jsx'
import DocsViewer from '../components/DocsViewer.jsx'

/** Identity approval for normal users: a Saudi person (ID / Iqama) or a UAE person (Emirates ID). */
export default function UserVerification() {
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_users')
    if (error) setError(error.message)
    else setUsers(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  // brokers are checked on their own tab
  const people = useMemo(() => users.filter((u) => u.role === 'user' && u.dealer_status === 'none' && u.identity_status !== 'none'), [users])
  const counts = (s) => people.filter((u) => u.identity_status === s).length
  const shown = people.filter((u) => u.identity_status === tab)

  async function decide(u, status) {
    let note = null
    if (status === 'rejected') {
      note = prompt('Reason for rejecting (shown to the user so they can fix it):')
      if (!note) return
    }
    const { error } = await supabase.rpc('admin_set_identity', { p_user: u.id, p_status: status, p_note: note })
    if (error) return alert(error.message)
    setOpen(null)
    load()
  }

  if (error) return <div className="alert bad">{error}</div>

  return (
    <>
      <div className="page-head">
        <div>
          <h1>User verification</h1>
          <p>Check each person's ID. The AI has already read it; you make the final decision.</p>
        </div>
      </div>
      <Tabs value={tab} onChange={setTab} items={[['pending', 'To review', counts('pending')], ['approved', 'Approved', counts('approved')], ['rejected', 'Rejected', counts('rejected')]]} />
      <Card>
        {loading ? <div className="center">Loading…</div> : shown.length === 0 ? <div className="empty">Nobody in this list.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Mobile</th><th>ID number</th><th>Registered</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {shown.map((u) => (
                  <tr key={u.id}>
                    <td><b>{u.full_name || '—'}</b></td>
                    <td>{u.phone || u.email}</td>
                    <td>{u.national_id || '—'}</td>
                    <td>{fmtDate(u.created_at)}</td>
                    <td><Badge status={u.identity_status} />{u.identity_note && <div className="sub">{u.identity_note}</div>}</td>
                    <td className="row-actions">
                      <button className="btn small" onClick={() => setOpen(u)}>Review</button>
                      {u.identity_status !== 'approved' && <button className="btn small primary" onClick={() => decide(u, 'approved')}>Approve</button>}
                      {u.identity_status !== 'rejected' && <button className="btn small bad" onClick={() => decide(u, 'rejected')}>Reject</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {open && (
        <Modal onClose={() => setOpen(null)} wide>
          <h2>{open.full_name || 'User'} <Badge status={open.identity_status} /></h2>
          <dl style={{ gridTemplateColumns: '150px 1fr', margin: '14px 0' }}>
            <dt>ID number entered</dt><dd>{open.national_id || '—'}</dd>
            <dt>Mobile</dt><dd>{open.phone || '—'}</dd>
            <dt>Joined</dt><dd>{fmtDate(open.created_at)}</dd>
          </dl>
          <h3 style={{ margin: '8px 0 12px' }}>ID documents</h3>
          <DocsViewer userId={open.id} portal="user" enteredId={open.national_id} enteredName={open.full_name} />
          <div className="actions">
            {open.identity_status !== 'rejected' && <button className="btn bad" onClick={() => decide(open, 'rejected')}>Reject</button>}
            {open.identity_status !== 'approved' && <button className="btn primary" onClick={() => decide(open, 'approved')}>Approve user</button>}
          </div>
        </Modal>
      )}
    </>
  )
}
