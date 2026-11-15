import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'
import LangButton from './components/LangButton.jsx'
import { startI18n } from './i18n.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <LangButton />
    </BrowserRouter>
  </React.StrictMode>,
)

startI18n()
