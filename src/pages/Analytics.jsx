import { useEffect, useState } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { supabase } from '../supabase.js'
import Icon from '../components/Icon.jsx'
import { Card } from '../components/ui.jsx'

const GREEN = '#0b8f4d'
const COLORS = ['#0b8f4d', '#2fbf78', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6', '#64748b']
const STATUS_COLOR = { approved: '#0b8f4d', pending: '#f59e0b', rejected: '#ef4444', confirmed: '#0b8f4d', declined: '#ef4444', cancelled: '#94a3b8' }
const toRows = (o) => Object.entries(o || {}).map(([name, value]) => ({ name, value }))
const shortDay = (d) => (d ? d.slice(5) : '')

/** The detailed numbers, kept off the home screen. */
export default function Analytics() {
  const [d, setD] = useState(null)
  const [rev, setRev] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    const [o, r] = await Promise.all([supabase.rpc('admin_overview'), supabase.rpc('admin_revenue')])
    if (o.error) setError(o.error.message)
    else setD(o.data)
    if (r.data) setRev(r.data)
  }
  useEffect(() => { load() }, [])

  if (error) return <div className="alert bad">{error}</div>
  if (!d) return <div className="center">Loading…</div>

  const vs = d.visits_by_status || {}
  const stats = [
    ['calendar', 'Visit bookings', d.visits],
    ['message', 'Conversations', d.conversations],
    ['card', 'Collected (SAR)', rev ? Number(rev.total).toLocaleString('en-US') : '–'],
    ['briefcase', 'Brokers waiting', d.pending_dealers],
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Analytics</h1>
          <p>Detailed numbers about properties, visits and money.</p>
        </div>
        <button className="refresh" onClick={load}><Icon name="refresh" size={16} /> Refresh</button>
      </div>

      <div className="kpis small">
        {stats.map(([icon, label, value]) => (
          <div key={label} className="kpi static">
            <div className="kpi-icon green"><Icon name={icon} size={22} /></div>
            <div className="kpi-value">{value ?? 0}</div>
            <div className="kpi-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-3">
        <Card title="Properties by city">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.listings_by_city || []} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8f0ec" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill={GREEN} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Properties by type">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={d.listings_by_type || []} dataKey="value" nameKey="name" outerRadius={95} label>
                {(d.listings_by_type || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Visit bookings by status">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={toRows(vs)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8f0ec" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {toRows(vs).map((r) => <Cell key={r.name} fill={STATUS_COLOR[r.name] || '#64748b'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {rev && (
        <Card title="Revenue · last 30 days (SAR)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={(rev.by_day || []).map((x) => ({ day: shortDay(x.day), Revenue: Number(x.value) }))}>
              <defs>
                <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8f0ec" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={3} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="Revenue" stroke="#f59e0b" strokeWidth={2.5} fill="url(#rv)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
    </>
  )
}
