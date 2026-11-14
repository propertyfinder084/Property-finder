import { useEffect, useMemo, useState } from 'react'
import { supabase, fmtDate } from '../supabase.js'
import { Badge, Card, Modal, Tabs } from '../components/ui.jsx'

const hhmm = (t) => String(t || '').slice(0, 5)

export default function Visits() {
  const [rows, setRows] = useState([])
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)
  const [propose, setPropose] = useState(null)
  const [pd, setPd] = useState('')
  const [pt, setPt] = useState('10:00')
  const [note, setNote] = useState('')

  const load = async () => {
    const { data, error: e } = await supabase.rpc('admin_visits')
    if (e) setError(e.message)
    else setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const counts = useMemo(() => {
    const c = { all: rows.length }
    rows.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1 })
    return c
  }, [rows])
  const shown = tab === 'all' ? rows : rows.filter((r) => r.status === tab)

  const approve = async (v) => {
    setBusy(v.id)
    const { error: e } = await supabase.from('visits').update({ status: 'confirmed' }).eq('id', v.id)
    if (e) alert(e.message)
    await load(); setBusy(null)
  }
  const decline = async (v) => {
    if (!confirm('Decline this visit request?')) return
    setBusy(v.id)
    const { error: e } = await supabase.from('visits').update({ status: 'declined' }).eq('id', v.id)
    if (e) alert(e.message)
    await load(); setBusy(null)
  }
  const sendProposal = async () => {
    if (!pd) return alert('Choose a date')
    setBusy(propose.id)
    const { error: e } = await supabase.rpc('propose_visit_time', { p_id: propose.id, p_date: pd, p_time: pt, p_note: note || null })
    if (e) alert(e.message)
    else { setPropose(null); setPd(''); setNote('') }
    await load(); setBusy(null)
  }

  if (error) return <div className="alert bad">{error}</div>

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Visit bookings</h1>
          <p>Visit requests from buyers. Broker listings are approved by the broker; sample listings are approved here by the Property Finder team.</p>
        </div>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[['pending', 'Requests', counts.pending || 0], ['rescheduled', 'New time suggested', counts.rescheduled || 0], ['confirmed', 'Approved', counts.confirmed || 0], ['declined', 'Declined', counts.declined || 0], ['cancelled', 'Cancelled', counts.cancelled || 0], ['all', 'All', counts.all]]}
      />
      <Card>
        {loading ? <div className="center">Loading…</div> : shown.length === 0 ? <div className="empty">No visits.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Requested time</th><th>Property</th><th>Visitor</th><th>Handled by</th><th>Status</th><th>Verified by</th><th></th></tr></thead>
              <tbody>
                {shown.map((v) => {
                  const mine = v.handled_by === 'team'
                  const open = v.status === 'pending' || v.status === 'rescheduled' || v.status === 'confirmed'
                  return (
                    <tr key={v.id}>
                      <td>
                        <b>{fmtDate(v.visit_date)}</b> · {hhmm(v.visit_time)}
                        {v.status === 'rescheduled' && v.proposed_date && (
                          <div className="sub">Suggested: {fmtDate(v.proposed_date)} · {hhmm(v.proposed_time)}</div>
                        )}
                      </td>
                      <td>
                        {v.property_title}
                        {v.property_lat != null && (
                          <div className="sub"><a href={`https://www.google.com/maps?q=${v.property_lat},${v.property_lng}`} target="_blank" rel="noreferrer">{v.property_address || 'Open map'}</a></div>
                        )}
                      </td>
                      <td>{v.visitor_name || '—'}<div className="sub">{v.visitor_phone || ''}</div></td>
                      <td>{mine ? <span className="badge info">Property Finder team</span> : <>{v.broker_name || 'Broker'}<div className="sub">broker</div></>}</td>
                      <td><Badge status={v.status} /></td>
                      <td>
                        {v.status === 'confirmed' && v.verified_by_name
                          ? <>✓ {v.verified_by_name}<div className="sub">{v.verified_by_role === 'admin' ? 'Admin team' : 'Broker'}</div></>
                          : <span className="sub">—</span>}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {mine && open && (
                          <>
                            {v.status === 'pending' && <button className="btn primary small" disabled={busy === v.id} onClick={() => approve(v)}>Approve</button>}{' '}
                            <button className="btn ghost small" disabled={busy === v.id} onClick={() => { setPropose(v); setPd(''); setNote('') }}>Other time</button>{' '}
                            {v.status !== 'confirmed' && <button className="btn bad small" disabled={busy === v.id} onClick={() => decline(v)}>Decline</button>}
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {propose && (
        <Modal onClose={() => setPropose(null)}>
          <h3>Suggest another time</h3>
          <p className="sub">{propose.property_title} · asked {fmtDate(propose.visit_date)} {hhmm(propose.visit_time)}</p>
          <label className="field">Date<input type="date" value={pd} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setPd(e.target.value)} /></label>
          <label className="field">Time<input type="time" value={pt} onChange={(e) => setPt(e.target.value)} /></label>
          <label className="field">Note (optional)<input value={note} onChange={(e) => setNote(e.target.value)} placeholder="We are not available then" /></label>
          <button className="btn primary small" disabled={busy === propose.id} onClick={sendProposal}>Send to visitor</button>
        </Modal>
      )}
    </>
  )
}
