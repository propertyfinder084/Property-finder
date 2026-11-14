import { useCallback, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAlerts } from '../alerts.jsx'
import { supabase } from '../supabase.js'
import Icon from './Icon.jsx'

// [path, label, icon, key in admin_pending_counts]
const sections = [
  ['Overview', [
    ['/', 'Dashboard', 'grid'],
    ['/analytics', 'Analytics', 'chart'],
  ]],
  ['Verification', [
    ['/verify/users', 'User Verification', 'userCheck', 'users'],
    ['/verify/brokers', 'Broker Verification', 'briefcase', 'brokers'],
    ['/verify/properties', 'Property Verification', 'home', 'properties'],
  ]],
  ['Support', [
    ['/complaints', 'Complaints', 'flag', 'complaints'],
    ['/support', 'Support Chat', 'message', 'support'],
    ['/chats', 'All Chats', 'users'],
  ]],
  ['Business', [
    ['/payments', 'Payments', 'card', 'payments'],
    ['/deals', 'Deals & Payouts', 'card', 'deals'],
    ['/users', 'All Users', 'users'],
    ['/visits', 'Visit Bookings', 'calendar', 'visits'],
  ]],
]

export default function Layout({ email, children }) {
  const [counts, setCounts] = useState({})
  const [uid, setUid] = useState(null)
  const nav = useNavigate()
  const loadCounts = useCallback(() => supabase.rpc('admin_pending_counts').then(({ data }) => data && setCounts(data)), [])
  const { toasts, dismiss, perm, enable } = useAlerts(uid, loadCounts)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id))
    loadCounts()
    const t = setInterval(loadCounts, 15000)
    return () => clearInterval(t)
  }, [loadCounts])

  const total = Object.values(counts).reduce((s, v) => s + Number(v || 0), 0)

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo"><Icon name="home" size={26} stroke={2.2} /></div>
          <div className="brand-text">Property<br />Finder</div>
        </div>

        <nav>
          {sections.map(([title, links]) => (
            <div key={title}>
              <div className="nav-title">{title}</div>
              {links.map(([to, label, icon, key]) => (
                <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'nav active' : 'nav')}>
                  <Icon name={icon} size={20} />
                  <span className="nav-label">{label}</span>
                  {key && Number(counts[key]) > 0 && <em className="count">{counts[key]}</em>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="side-foot">
          {perm === 'default' && (
            <button className="alert-box" onClick={enable}>
              <Icon name="bell" size={22} />
              <span>Enable desktop alerts</span>
            </button>
          )}
          {total > 0 && (
            <div className="todo-box">
              <Icon name="bell" size={18} />
              <span>{total} item{total === 1 ? '' : 's'} need you</span>
            </div>
          )}
          <div className="user-card">
            <div className="avatar">{(email || 'A')[0].toUpperCase()}</div>
            <div className="user-meta">
              <b>Admin</b>
              <span>{email}</span>
            </div>
            <button className="icon-out" title="Sign out" onClick={() => supabase.auth.signOut()}>
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main">{children}<footer className="app-footer">© 2026 Damac Hills. All rights reserved.</footer></main>

      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast" onClick={() => { dismiss(t.id); nav(t.to) }}>
            <b>{t.title}</b>
            <span>{t.body}</span>
            <em onClick={(e) => { e.stopPropagation(); dismiss(t.id) }}>×</em>
          </div>
        ))}
      </div>
    </div>
  )
}
