import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Expose runtime API URL without using import.meta inside test-loaded modules.
if (typeof window !== 'undefined') {
  window.__VITE_API_URL__ = import.meta.env.VITE_API_URL || 'http://localhost:5000'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
