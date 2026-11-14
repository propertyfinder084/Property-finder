import { useEffect, useState } from 'react'
import { supabase, fmtDate } from '../supabase.js'
import { Badge, Card } from '../components/ui.jsx'

export default function Users() {
  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.rpc('admin_users').then(({ data, error }) => {
      if (error) setError(error.message)
      else setUsers(data)
      setLoading(false)
    })
  }, [])

  const shown = users.filter((u) => `${u.full_name} ${u.phone} ${u.email} ${u.company}`.toLowerCase().includes(q.toLowerCase()))

  if (error) return <div className="alert bad">{error}</div>

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p>{users.length} registered accounts.</p>
        </div>
        <input className="search" placeholder="Search name, phone, email…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Card>
        {loading ? <div className="center">Loading…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Contact</th><th>Role</th><th>Properties</th><th>Visits</th><th>Joined</th></tr></thead>
              <tbody>
                {shown.map((u) => (
                  <tr key={u.id}>
                    <td><b>{u.full_name || '—'}</b>{u.company && <div className="sub">{u.company}</div>}</td>
                    <td>{u.phone || '—'}<div className="sub">{u.email}</div></td>
                    <td><Badge status={u.role} /></td>
                    <td>{u.listings}</td>
                    <td>{u.visits}</td>
                    <td>{fmtDate(u.created_at)}</td>
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
