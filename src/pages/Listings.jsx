import { useEffect, useMemo, useState } from 'react'
import { supabase, imgUrl, fmtMoney, fmtDate } from '../supabase.js'
import { Badge, Card, Modal, Tabs } from '../components/ui.jsx'
import DocsViewer from '../components/DocsViewer.jsx'

const isNew = (r) => r.imported_at && Date.now() - new Date(r.imported_at).getTime() < 7 * 86400000

/** Property verification: photos, ownership document, and the exact location on a map. */
export default function Listings() {
  const [rows, setRows] = useState([])
  const [owners, setOwners] = useState({})
  const [tab, setTab] = useState('pending')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const [l, u] = await Promise.all([
      supabase.from('property_listings').select('*').neq('source', 'aqar').order('imported_at', { ascending: false }).limit(1000),
      supabase.rpc('admin_users'),
    ])
    if (l.error) setError(l.error.message)
    else setRows(l.data)
    if (u.data) setOwners(Object.fromEntries(u.data.map((x) => [x.id, x])))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const counts = useMemo(() => {
    const c = { all: rows.length, pending: 0, approved: 0, rejected: 0 }
    rows.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1 })
    return c
  }, [rows])

  const shown = rows.filter((r) => {
    if (tab !== 'all' && r.status !== tab) return false
    if (!q.trim()) return true
    const hay = `${r.title_en} ${r.city_en} ${r.district_en} ${r.property_type_en} ${owners[r.owner_id]?.full_name || ''} ${owners[r.owner_id]?.company || ''}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  async function setStatus(r, status, reason) {
    const { error } = await supabase.rpc('admin_set_listing_status', { p_id: r.id, p_status: status, p_reason: reason ?? null })
    if (error) return alert(error.message)
    setOpen(null)
    load()
  }

  if (error) return <div className="alert bad">{error}</div>

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Property verification</h1>
          <p>Check the ownership document, the photos and the map location, then approve or reject.</p>
        </div>
        <input className="search" placeholder="Search city, district, broker…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[['pending', 'To review', counts.pending], ['approved', 'Approved', counts.approved], ['rejected', 'Rejected', counts.rejected], ['all', 'All', counts.all]]}
      />

      <Card>
        {loading ? <div className="center">Loading…</div> : shown.length === 0 ? <div className="empty">Nothing here.</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th></th><th>Property</th><th>Location</th><th>Price</th><th>Posted by</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td><img className="thumb" src={imgUrl(r.image_urls?.[0])} alt="" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} /></td>
                    <td>
                      <b>{r.title_en}</b> {isNew(r) && <span className="new-tag">NEW</span>}
                      <div className="sub">{r.property_type_en} · {r.area_sqm ?? '-'} m² · {r.image_urls?.length || 0} photos</div>
                    </td>
                    <td>{r.district_en}<div className="sub">{r.city_en}{r.latitude ? ' · 📍 pinned' : ' · no pin'}</div></td>
                    <td>{fmtMoney(r.price)} {r.currency}</td>
                    <td>{owners[r.owner_id]?.company || owners[r.owner_id]?.full_name || <span className="sub">{r.source}</span>}</td>
                    <td><Badge status={r.status} /></td>
                    <td><button className="btn small" onClick={() => setOpen(r)}>Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {open && <ReviewModal r={open} owner={owners[open.owner_id]} onClose={() => setOpen(null)} onSet={setStatus} />}
    </>
  )
}

function ReviewModal({ r, owner, onClose, onSet }) {
  const [idx, setIdx] = useState(0)
  const [reason, setReason] = useState(r.rejection_reason || '')
  const imgs = r.image_urls || []
  const hasPin = r.latitude != null && r.longitude != null
  const d = 0.006
  const mapSrc = hasPin
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${r.longitude - d}%2C${r.latitude - d}%2C${r.longitude + d}%2C${r.latitude + d}&layer=mapnik&marker=${r.latitude}%2C${r.longitude}`
    : null
  return (
    <Modal onClose={onClose} wide>
      <div className="review">
        <div className="gallery">
          {imgs.length ? <img className="big" src={imgUrl(imgs[idx])} alt="" /> : <div className="big empty">No photos</div>}
          <div className="thumbs">
            {imgs.map((u, i) => (
              <img key={i} src={imgUrl(u)} className={i === idx ? 'on' : ''} onClick={() => setIdx(i)} alt="" />
            ))}
          </div>
          <h3 style={{ margin: '18px 0 8px' }}>Location</h3>
          {hasPin ? (
            <>
              <iframe title="map" className="map" src={mapSrc} />
              <a className="sub" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`}>
                📍 {r.latitude.toFixed?.(5)}, {r.longitude.toFixed?.(5)} · open in Google Maps
              </a>
            </>
          ) : <div className="alert bad">This listing has no map pin.</div>}
        </div>
        <div className="detail">
          <Badge status={r.status} /> {isNew(r) && <span className="new-tag">NEW</span>}
          <h2>{r.title_en}</h2>
          <div className="price">{fmtMoney(r.price)} {r.currency}</div>
          <dl>
            <dt>Type</dt><dd>{r.property_type_en} · {r.listing_type_en}</dd>
            <dt>Area</dt><dd>{r.area_sqm ?? '-'} m²</dd>
            <dt>Location</dt><dd>{r.district_en}, {r.city_en}</dd>
            <dt>Posted by</dt><dd>{owner ? `${owner.company || owner.full_name || '—'} (${owner.phone || owner.email || ''})` : r.source}</dd>
            <dt>Broker status</dt><dd>{owner ? <Badge status={owner.dealer_status === 'approved' ? 'approved' : owner.role} /> : '—'}</dd>
            <dt>Submitted</dt><dd>{fmtDate(r.imported_at)}</dd>
          </dl>
          <p className="desc">{r.description_en}</p>
          {r.owner_id && (
            <>
              <h3 style={{ margin: '12px 0 8px' }}>Ownership document</h3>
              <DocsViewer userId={r.owner_id} listingRef={r.source_listing_id} portal="property" />
            </>
          )}
          {r.rejection_reason && <div className="alert bad">Rejected: {r.rejection_reason}</div>}
          <label>Rejection reason (shown to the broker)</label>
          <textarea rows="3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Deed does not match the location, photos unclear…" />
          <div className="actions">
            <button className="btn bad" onClick={() => reason.trim() ? onSet(r, 'rejected', reason.trim()) : alert('Write a short reason first.')}>Reject</button>
            <button className="btn primary" onClick={() => onSet(r, 'approved')}>Approve</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
