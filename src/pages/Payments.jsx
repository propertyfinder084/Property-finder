import { useEffect, useState } from 'react'
import { supabase, fmtDate, fmtMoney } from '../supabase.js'
import { Card, Tabs } from '../components/ui.jsx'

const TONE = { paid: 'ok', cash_received: 'ok', cash_pending: 'warn', pending: 'warn', failed: 'bad', refunded: 'info' }
const LABEL = { paid: 'paid (card)', cash_received: 'cash received', cash_pending: 'cash – waiting', pending: 'card – pending', failed: 'failed', refunded: 'refunded' }

export default function Payments() {
  const [tab, setTab] = useState('payments')
  const [rows, setRows] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const [p, pr] = await Promise.all([supabase.rpc('admin_payments'), supabase.from('payment_products').select('*').order('sort')])
    if (p.error) setError(p.error.message)
    else setRows(p.data)
    if (pr.data) setProducts(pr.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function mark(r, received) {
    if (!received && !confirm('Mark this cash payment as not received?')) return
    const { error } = await supabase.rpc('admin_mark_cash', { p_id: r.id, p_received: received })
    if (error) return alert(error.message)
    load()
  }

  async function saveProduct(p, patch) {
    const { error } = await supabase.from('payment_products').update(patch).eq('id', p.id)
    if (error) return alert(error.message)
    load()
  }

  const total = rows.filter((r) => r.status === 'paid' || r.status === 'cash_received').reduce((s, r) => s + Number(r.amount), 0)
  const waiting = rows.filter((r) => r.status === 'cash_pending').length

  if (error) return <div className="alert bad">{error}</div>

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Payments</h1>
          <p>Card payments through Moyasar and cash paid in hand. Confirm cash once you receive it.</p>
        </div>
        <div className="mini-stats">
          <div><b>{fmtMoney(total)} SAR</b><span>collected</span></div>
          <div><b>{waiting}</b><span>cash waiting</span></div>
        </div>
      </div>
      <Tabs value={tab} onChange={setTab} items={[['payments', 'Payments', rows.length], ['products', 'Products & prices']]} />

      {tab === 'payments' ? (
        <Card>
          {loading ? <div className="center">Loading…</div> : rows.length === 0 ? <div className="empty">No payments yet.</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>User</th><th>Product</th><th>Listing</th><th>Amount</th><th>Method</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{fmtDate(r.created_at)}</td>
                      <td><b>{r.user_name || '—'}</b><div className="sub">{r.user_phone}</div></td>
                      <td>{r.product}</td>
                      <td className="sub">{r.listing_ref || '—'}</td>
                      <td>{fmtMoney(r.amount)} {r.currency}</td>
                      <td>{r.method === 'cash' ? '🤝 In hand' : '💳 Card'}{r.moyasar_id && <div className="sub">{r.moyasar_id.slice(0, 8)}…</div>}</td>
                      <td><span className={`badge ${TONE[r.status]}`}>{LABEL[r.status] || r.status}</span></td>
                      <td className="row-actions">
                        {r.status === 'cash_pending' && (
                          <>
                            <button className="btn small primary" onClick={() => mark(r, true)}>Cash received</button>
                            <button className="btn small bad" onClick={() => mark(r, false)}>Not received</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card title="Products brokers can buy">
          <p className="sub" style={{ marginTop: 0 }}>Change the price or switch a product off. Prices are in SAR.</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Days</th><th>Price (SAR)</th><th>Active</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.name_en}</b><div className="sub">{p.description_en}</div></td>
                    <td>{p.days}</td>
                    <td>
                      <input
                        type="number" min="0" defaultValue={p.amount} className="num"
                        onBlur={(e) => Number(e.target.value) !== Number(p.amount) && saveProduct(p, { amount: Number(e.target.value) })}
                      />
                    </td>
                    <td><input type="checkbox" checked={p.active} onChange={(e) => saveProduct(p, { active: e.target.checked })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}
