import { useState } from 'react'
import { supabase } from '../supabase.js'

export default function Login({ notAdmin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setBusy(false)
  }

  return (
    <div className="login-wrap">
      <form className="login" onSubmit={submit}>
        <div className="login-logo">🏡</div>
        <h1><span>Property</span> <b>Finder</b></h1>
        <p>Admin portal</p>
        {notAdmin && (
          <div className="alert bad">
            This account is not an admin. Ask the owner to set <code>role = 'admin'</code> for it.
            <button type="button" className="btn ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
          </div>
        )}
        {error && <div className="alert bad">{error}</div>}
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <footer className="app-footer login-footer">© 2026 Damac Hills. All rights reserved.</footer>
    </div>
  )
}
