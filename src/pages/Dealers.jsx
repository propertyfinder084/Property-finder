import { useEffect, useMemo, useState } from 'react'
import { supabase, fmtDate } from '../supabase.js'
import { Badge, Card, Modal, Tabs } from '../components/ui.jsx'
import DocsViewer from '../components/DocsViewer.jsx'

/** Broker verification: ID + licence / property documents, read by the AI, approved by an admin. */
export default function Dealers() {
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

  const apps = useMemo(() => users.filter((u) => u.dealer_status !== 'none'), [users])
  const counts = (s) => apps.filter((u) => u.dealer_status === s).length
  const shown = apps.filter((u) => u.dealer_status === tab)

  async function decide(u, status) {
    let note = null
    if (status === 'rejected') {
      note = prompt('Reason for rejecting (shown to the applicant so they can fix it):')
      if (!note) return
    }
    const { error } = await supabase.rpc('admin_set_dealer', { p_user: u.id, p_status: status, p_note: note })
    if (error) return alert(error.message)
    setOpen(null)
    load()
  }

  if (error) return <div className="alert bad">{error}</div>

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Broker verification</h1>
          <p>Check each broker's ID and property / licence documents, then accept or reject.</p>
        </div>
      </div>
      <Tabs value={tab} onChange={setTab} items={[['pending', 'To review', counts('pending')], ['approved', 'Approved brokers', counts('approved')], ['rejected', 'Rejected', counts('rejected')]]} />
      <Card>
        {loading ? <div className="center">Loading…</div> : shown.length === 0 ? <div className="empty">No applications in this list.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Company</th><th>Contact</th><th>ID number</th><th>Properties</th><th>Applied</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {shown.map((u) => (
                  <tr key={u.id}>
                    <td><b>{u.full_name || '—'}</b></td>
                    <td>{u.company || '—'}</td>
                    <td>{u.phone || u.email}</td>
                    <td>{u.broker_national_id || '—'}</td>
                    <td>{u.listings}</td>
                    <td>{fmtDate(u.created_at)}</td>
                    <td><Badge status={u.dealer_status} />{u.dealer_note && <div className="sub">{u.dealer_note}</div>}</td>
                    <td className="row-actions">
                      <button className="btn small" onClick={() => setOpen(u)}>Documents</button>
                      {u.dealer_status !== 'approved' && <button className="btn small primary" onClick={() => decide(u, 'approved')}>Accept</button>}
                      {u.dealer_status !== 'rejected' && <button className="btn small bad" onClick={() => decide(u, 'rejected')}>{u.dealer_status === 'approved' ? 'Revoke' : 'Reject'}</button>}
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
          <h2>{open.full_name || 'Applicant'} <Badge status={open.dealer_status} /></h2>
          <dl style={{ gridTemplateColumns: '130px 1fr', margin: '14px 0' }}>
            <dt>Company</dt><dd>{open.company || '—'}</dd>
            <dt>ID number</dt><dd>{open.broker_national_id || '—'}</dd>
            <dt>Mobile</dt><dd>{open.phone || '—'}</dd>
            <dt>Applied</dt><dd>{fmtDate(open.created_at)}</dd>
          </dl>
          <h3 style={{ margin: '8px 0 12px' }}>Uploaded documents</h3>
          <DocsViewer userId={open.id} portal="broker" enteredId={open.broker_national_id} />
          <div className="actions">
            {open.dealer_status !== 'rejected' && <button className="btn bad" onClick={() => decide(open, 'rejected')}>{open.dealer_status === 'approved' ? 'Revoke' : 'Reject'}</button>}
            {open.dealer_status !== 'approved' && <button className="btn primary" onClick={() => decide(open, 'approved')}>Accept broker</button>}
          </div>
        </Modal>
      )}
    </>
  )
}
