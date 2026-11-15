import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppProvider } from './store'
import './styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <AppProvider>
    <App />
  </AppProvider>,
)
