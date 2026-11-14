import { useEffect, useMemo, useState } from 'react'
import { supabase, fmtDate } from '../supabase.js'
import { Badge, Card, Stat, Tabs } from '../components/ui.jsx'

const sar = (n) => `${Math.round(Number(n || 0)).toLocaleString('en-US')} SAR`

export default function Deals() {
  const [rows, setRows] = useState([])
  const [tab, setTab] = useState('paid')
  const [fee, setFee] = useState(20)
  const [busy, setBusy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    const [d, s] = await Promise.all([
      supabase.rpc('admin_deals'),
      supabase.from('platform_settings').select('value').eq('key', 'platform_fee_pct').maybeSingle(),
    ])
    if (d.error) setError(d.error.message)
    else setRows(d.data || [])
    if (s.data) setFee(Number(s.data.value))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const sum = (f, k) => rows.filter(f).reduce((a, r) => a + Number(r[k] || 0), 0)
  const stats = useMemo(() => ({
    revenue: sum((r) => ['paid', 'settled'].includes(r.status), 'platform_fee'),
    volume: sum((r) => ['paid', 'settled'].includes(r.status), 'deal_amount'),
    brokerDue: rows.filter((r) => r.status === 'paid' && !r.broker_paid_out_at).reduce((a, r) => a + Number(r.broker_net), 0),
    ownerDue: rows.filter((r) => r.status === 'paid' && !r.owner_paid_out_at).reduce((a, r) => a + Number(r.owner_net), 0),
  }), [rows])
  const shown = tab === 'all' ? rows : rows.filter((r) => r.status === tab)

  const payout = async (id, party) => {
    if (!confirm(`Confirm you have transferred the money to the ${party}?`)) return
    setBusy(id + party)
    const { error: e } = await supabase.rpc('admin_mark_payout', { p_id: id, p_party: party })
    if (e) alert(e.message)
    await load(); setBusy(null)
  }
  const saveFee = async () => {
    const { error: e } = await supabase.rpc('admin_set_platform_fee', { p_pct: fee })
    alert(e ? e.message : 'Saved. It applies to new deals.')
  }

  if (error) return <div className="alert bad">{error}</div>

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Deals & payouts</h1>
          <p>The buyer pays the full price in the app. Commission goes to the broker, the platform keeps its fee, the rest is for the owner.</p>
        </div>
      </div>

      <div className="stats">
        <Stat label="Platform revenue" value={sar(stats.revenue)} tone="green" icon="💰" />
        <Stat label="Deal volume paid" value={sar(stats.volume)} tone="blue" icon="🏠" />
        <Stat label="Broker payouts due" value={sar(stats.brokerDue)} tone="orange" icon="👤" />
        <Stat label="Owner payouts due" value={sar(stats.ownerDue)} tone="orange" icon="🔑" />
      </div>

      <Card title="Platform fee">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '4px 4px 8px' }}>
          <span>Admin keeps</span>
          <input type="number" min="0" max="100" value={fee} onChange={(e) => setFee(e.target.value)} style={{ width: 80 }} />
          <span>% of each broker commission</span>
          <button className="btn primary small" onClick={saveFee}>Save</button>
        </div>
      </Card>

      <Tabs value={tab} onChange={setTab} items={[
        ['paid', 'Payouts due', rows.filter((r) => r.status === 'paid').length],
        ['awaiting_payment', 'Waiting for buyer', rows.filter((r) => r.status === 'awaiting_payment').length],
        ['settled', 'Settled', rows.filter((r) => r.status === 'settled').length],
        ['all', 'All', rows.length],
      ]} />
      <Card>
        {loading ? <div className="center">Loading…</div> : shown.length === 0 ? <div className="empty">No deals.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Deal</th><th>Buyer</th><th>Price</th><th>Commission</th><th>Platform fee</th><th>Broker gets</th><th>Owner gets</th><th>Status</th></tr></thead>
              <tbody>
                {shown.map((d) => (
                  <tr key={d.id}>
                    <td><b>{d.title}</b><div className="sub">{fmtDate(d.created_at)} · broker {d.broker_name}</div></td>
                    <td>{d.buyer_name || '—'}<div className="sub">{d.buyer_phone}</div></td>
                    <td>{sar(d.deal_amount)}</td>
                    <td>{sar(d.commission_amount)}<div className="sub">{d.commission_pct}%</div></td>
                    <td><b>{sar(d.platform_fee)}</b><div className="sub">{d.platform_fee_pct}%</div></td>
                    <td>
                      {sar(d.broker_net)}
                      {d.status !== 'awaiting_payment' && (d.broker_paid_out_at
                        ? <div className="sub">✓ paid {fmtDate(d.broker_paid_out_at)}</div>
                        : d.status === 'paid' && <div><button className="btn primary small" disabled={busy === d.id + 'broker'} onClick={() => payout(d.id, 'broker')}>Mark paid</button></div>)}
                    </td>
                    <td>
                      {sar(d.owner_net)}<div className="sub">{d.owner_name || ''} {d.owner_phone || ''}</div>
                      {d.status !== 'awaiting_payment' && (d.owner_paid_out_at
                        ? <div className="sub">✓ paid {fmtDate(d.owner_paid_out_at)}</div>
                        : d.status === 'paid' && <div><button className="btn primary small" disabled={busy === d.id + 'owner'} onClick={() => payout(d.id, 'owner')}>Mark paid</button></div>)}
                    </td>
                    <td><Badge status={d.status === 'paid' ? 'pending' : d.status === 'settled' ? 'approved' : d.status === 'cancelled' ? 'cancelled' : 'none'} /><div className="sub">{d.status.replace('_', ' ')}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
