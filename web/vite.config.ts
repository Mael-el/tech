import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le serveur doit accepter l'hôte de prévisualisation (proxy Arena)
// et écouter sur toutes les interfaces.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
})
