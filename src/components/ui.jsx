export function Stat({ label, value, hint, tone = 'green', icon }) {
  return (
    <div className={`stat ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value ?? '–'}</div>
        <div className="stat-label">{label}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  )
}

export function Badge({ status }) {
  const map = {
    approved: 'ok', confirmed: 'ok', rescheduled: 'info', pending: 'warn', rejected: 'bad', declined: 'bad', cancelled: 'muted', none: 'muted',
    admin: 'info', dealer: 'ok', user: 'muted',
  }
  return <span className={`badge ${map[status] || 'muted'}`}>{status}</span>
}

export function Card({ title, action, children }) {
  return (
    <section className="card">
      {(title || action) && (
        <header className="card-head">
          <h3>{title}</h3>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function Modal({ onClose, children, wide }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} onMouseDown={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  )
}

export function Tabs({ value, onChange, items }) {
  return (
    <div className="tabs">
      {items.map(([k, label, count]) => (
        <button key={k} className={value === k ? 'tab active' : 'tab'} onClick={() => onChange(k)}>
          {label}{count != null && <em>{count}</em>}
        </button>
      ))}
    </div>
  )
}
