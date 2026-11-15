import { useState } from 'react'
import { isAr, setLang } from '../i18n.js'

export default function LangButton() {
  const [ar, setAr] = useState(isAr())
  return (
    <button className="lang-btn" onClick={() => { setLang(!ar); setAr(!ar) }}>
      🌐 {ar ? 'English' : 'العربية'}
    </button>
  )
}
