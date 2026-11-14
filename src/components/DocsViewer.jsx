import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'

export const DOC_LABEL = {
  id_front: 'ID card – front',
  id_back: 'ID card – back',
  selfie: 'Selfie / photo',
  property_deed: 'Property / ownership document',
  broker_license: 'Real estate licence (FAL)',
  commercial_reg: 'Commercial registration',
  other: 'Other',
}

const digits = (v) => String(v || '').replace(/\D/g, '')

/** Shows a person's (or a listing's) uploaded documents with the AI reading next to each one. */
const TABLE = { user: 'user_documents', broker: 'broker_documents', property: 'property_documents' }

/** portal: 'user' | 'broker' | 'property' - each portal has its own table and bucket. */
export default function DocsViewer({ userId, listingRef, portal, enteredId, enteredName }) {
  const [docs, setDocs] = useState(null)
  const [zoom, setZoom] = useState(null)

  useEffect(() => {
    let live = true
    ;(async () => {
      let q = supabase.from(TABLE[portal]).select('*').eq('user_id', userId).order('created_at')
      if (portal === 'property') q = q.eq('listing_ref', listingRef)
      const { data, error } = await q
      if (error || !live) return setDocs([])
      // the bucket is private: ask for short-lived links
      const withUrls = await Promise.all(
        data.map(async (d) => {
          const { data: s } = await supabase.storage.from(`${portal}-documents`).createSignedUrl(d.file_path, 900)
          return { ...d, url: s?.signedUrl }
        }),
      )
      if (live) setDocs(withUrls)
    })()
    return () => { live = false }
  }, [userId, listingRef, portal])

  if (docs === null) return <div className="center">Loading documents…</div>
  if (docs.length === 0) return <div className="empty">No documents uploaded.</div>

  return (
    <>
      <div className="docs">
        {docs.map((d) => {
          const r = d.ai_result || {}
          const idMismatch = enteredId && r.id_number && digits(r.id_number) && digits(r.id_number) !== digits(enteredId)
          return (
            <figure key={d.id}>
              <div onClick={() => d.url && setZoom(d)} className="zoomable">
                {d.url ? <img src={d.url} alt={d.doc_type} /> : <div className="noimg">Cannot load</div>}
              </div>
              <figcaption>
                <b>{DOC_LABEL[d.doc_type] || d.doc_type}</b>
                <div className={`ai ${d.ai_status}`}>
                  {d.ai_status === 'match' && '✓ AI: correct document'}
                  {d.ai_status === 'mismatch' && '✗ AI: wrong document'}
                  {d.ai_status === 'unreadable' && '✗ AI: unreadable'}
                  {d.ai_status === 'error' && '• AI check unavailable'}
                  {d.ai_status === 'unchecked' && '• Not checked yet'}
                </div>
                {r.document_type && <div className="sub">Read as: {String(r.document_type).replaceAll('_', ' ')}{r.country ? ` · ${r.country}` : ''}</div>}
                {r.full_name && <div className="sub">Name: {r.full_name}</div>}
                {r.id_number && <div className="sub">Number: {r.id_number}</div>}
                {r.expiry_date && <div className="sub">Expires: {r.expiry_date}</div>}
                {r.looks_edited && <div className="warn">⚠ Looks like a photo of a screen or edited</div>}
                {idMismatch && <div className="warn">⚠ Number on the card differs from the one entered ({enteredId})</div>}
                {r.message && d.ai_status !== 'match' && <div className="sub">{r.message}</div>}
              </figcaption>
            </figure>
          )
        })}
      </div>
      {zoom && (
        <div className="overlay" style={{ zIndex: 80 }} onMouseDown={() => setZoom(null)}>
          <img className="zoom" src={zoom.url} alt="" />
        </div>
      )}
    </>
  )
}
