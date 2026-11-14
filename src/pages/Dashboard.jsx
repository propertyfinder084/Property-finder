import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { supabase } from '../supabase.js'
import Icon from '../components/Icon.jsx'

const GREEN = '#0b8f4d'
const STATUS = {
  approved: { label: 'Active', color: '#0b8f4d' },
  pending: { label: 'Pending', color: '#a8dcc0' },
  rejected: { label: 'Rejected', color: '#ef4444' },
}
const shortDay = (d) => (d ? d.slice(5) : '')

/** Light home screen: four numbers and two charts. Everything else has its own page. */
export default function Dashboard() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  const [series, setSeries] = useState('signups')

  async function load() {
    const { data, error } = await supabase.rpc('admin_overview')
    if (error) setError(error.message)
    else setD(data)
  }
  useEffect(() => { load() }, [])

  if (error) return <div className="alert bad">Could not load the dashboard: {error}</div>
  if (!d) return <div className="center">Loading…</div>

  const ls = d.listings_by_status || {}
  const kpis = [
    { to: '/users', icon: 'users', tone: 'green', value: d.users, label: 'Users' },
    { to: '/verify/brokers', icon: 'shield', tone: 'blue', value: d.dealers, label: 'Approved dealers' },
    { to: '/analytics', icon: 'home', tone: 'green', value: d.listings, label: 'Properties' },
    { to: '/verify/properties', icon: 'hourglass', tone: 'amber', value: ls.pending || 0, label: 'Listings to review' },
  ]

  const key = { signups: 'signups_by_day', listings: 'listings_by_day', visits: 'visits_by_day' }[series]
  const activity = (d[key] || []).map((x) => ({ day: shortDay(x.day), value: x.value }))

  const totalListings = Object.values(ls).reduce((s, v) => s + Number(v), 0) || 1
  const donut = Object.entries(ls).map(([k, v]) => ({
    key: k, value: Number(v), label: STATUS[k]?.label || k, color: STATUS[k]?.color || '#94a3b8',
    pct: Math.round((Number(v) / totalListings) * 100),
  }))

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
        <button className="refresh" onClick={load}><Icon name="refresh" size={16} /> Refresh</button>
      </div>

      <div className="kpis">
        {kpis.map((k) => (
          <Link key={k.label} to={k.to} className="kpi">
            <div className={`kpi-icon ${k.tone}`}><Icon name={k.icon} size={26} /></div>
            <div className="kpi-value">{k.value ?? 0}</div>
            <div className="kpi-label">{k.label}</div>
            <i className="kpi-go"><Icon name="arrow" size={16} /></i>
          </Link>
        ))}
      </div>

      <div className="panels">
        <section className="panel">
          <header className="panel-head">
            <h3><Icon name="trend" size={18} /> Activity · last 30 days</h3>
            <div className="seg">
              {[['signups', 'Users'], ['listings', 'Listings'], ['visits', 'Visits']].map(([k, l]) => (
                <button key={k} className={series === k ? 'on' : ''} onClick={() => setSeries(k)}>{l}</button>
              ))}
            </div>
          </header>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={activity} margin={{ left: -18, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="act" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={GREEN} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8f0ec" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#7b8a94' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#7b8a94' }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2.5} fill="url(#act)" name={series} />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="panel">
          <header className="panel-head">
            <h3><Icon name="layers" size={18} /> Listings by status</h3>
          </header>
          <div className="donut-wrap">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={donut} dataKey="value" nameKey="label" innerRadius={58} outerRadius={92} paddingAngle={2} stroke="none">
                  {donut.map((r) => <Cell key={r.key} fill={r.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <ul className="legend">
              {donut.map((r) => (
                <li key={r.key}>
                  <i style={{ background: r.color }} />
                  <span>{r.label}</span>
                  <b>{r.pct}%</b>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  )
}
