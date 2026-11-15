import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppProvider } from './store'
import './styles.css'
import './design-v4.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <AppProvider>
    <App />
  </AppProvider>,
)

// Hors-ligne : le service worker n'est enregistré qu'en production.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* l'aperçu reste fonctionnel sans cache hors-ligne */
    })
  })
}
