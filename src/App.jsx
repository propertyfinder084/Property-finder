import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './supabase.js'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Analytics from './pages/Analytics.jsx'
import Listings from './pages/Listings.jsx'
import Dealers from './pages/Dealers.jsx'
import UserVerification from './pages/UserVerification.jsx'
import Complaints from './pages/Complaints.jsx'
import Support from './pages/Support.jsx'
import Payments from './pages/Payments.jsx'
import Users from './pages/Users.jsx'
import Visits from './pages/Visits.jsx'

export default function App() {
  const [state, setState] = useState({ loading: true, session: null, admin: false })

  async function check(session) {
    if (!session) return setState({ loading: false, session: null, admin: false })
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
    setState({ loading: false, session, admin: data?.role === 'admin' })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => check(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => check(session))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (state.loading) return <div className="center">Loading…</div>
  if (!state.session || !state.admin) return <Login notAdmin={!!state.session && !state.admin} />

  return (
    <Layout email={state.session.user.email}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/verify/users" element={<UserVerification />} />
        <Route path="/verify/brokers" element={<Dealers />} />
        <Route path="/verify/properties" element={<Listings />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/support" element={<Support />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/users" element={<Users />} />
        <Route path="/visits" element={<Visits />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
