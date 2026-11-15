import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon, type IconName } from './components/Icon'
import { Avatar, Sheet, Toasts } from './components/ui'
import { CommandPalette } from './components/CommandPalette'
import { useApp } from './store'
import { useRoute, type Tab } from './lib/router'
import { LoginScreen } from './screens/Login'
import { DashboardScreen } from './screens/Dashboard'
import { CoursesScreen } from './screens/Courses'
import { FlashcardsScreen } from './screens/Flashcards'
import { CertificatesScreen } from './screens/Certificates'
import { NetworkScreen } from './screens/Network'
import { ProfileScreen } from './screens/Profile'

const TABS: { id: Tab; label: string; icon: IconName; path: string }[] = [
  { id: 'home', label: 'Accueil', icon: 'home', path: '#/' },
  { id: 'courses', label: 'Cours', icon: 'book', path: '#/cours' },
  { id: 'cards', label: 'Révision', icon: 'cards', path: '#/revision' },
  { id: 'badges', label: 'Certifs', icon: 'award', path: '#/certifications' },
  { id: 'network', label: 'Réseau', icon: 'globe', path: '#/reseau' },
]

/* --------------------------- Session live --------------------------- */

function LiveSheet({
  open,
  title,
  instructor,
  onClose,
}: {
  open: boolean
  title: string
  instructor: string
  onClose: () => void
}) {
  const { notify } = useApp()
  const [hand, setHand] = useState(false)
  const [muted, setMuted] = useState(true)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([
    { author: 'Amina Diallo (Mentor)', text: "Bienvenue à tous ! Aujourd'hui nous voyons l'architecture offline avec Room." },
    { author: 'Koffi Mensah', text: "N'hésitez pas à lever la main pour poser vos questions audio." },
    { author: 'Fatou Sow', text: 'Présente depuis Dakar.' },
    { author: 'David Osei', text: 'Hello from Accra! Ready for the session.' },
  ])

  return (
    <Sheet open={open} onClose={onClose} title="Classe virtuelle FATA">
      <div className="live-sheet">
        <div className="live-stage">
          <span className="live-badge"><span className="live-dot" /> EN DIRECT</span>
          <div className="live-stage-body">
            <div className="live-avatar">AD</div>
            <strong>{instructor}</strong>
            <p>{title}</p>
            <span className="live-viewers"><Icon name="users" size={14} /> 142 inscrits</span>
          </div>
          <div className="live-controls">
            <button type="button" className={`live-ctrl ${muted ? '' : 'on'}`} onClick={() => setMuted((v) => !v)}>
              <Icon name="phone" size={17} /> {muted ? 'Micro coupé' : 'Micro actif'}
            </button>
            <button
              type="button"
              className={`live-ctrl ${hand ? 'on' : ''}`}
              onClick={() => {
                setHand((v) => !v)
                notify(hand ? 'Main baissée.' : 'Main levée : le mentor a reçu votre demande.')
              }}
            >
              <Icon name="user" size={17} /> {hand ? 'Main levée' : 'Lever la main'}
            </button>
            <button type="button" className="live-ctrl danger" onClick={onClose}>
              <Icon name="close" size={17} /> Quitter
            </button>
          </div>
        </div>

        <div className="live-chat">
          {messages.map((m, i) => (
            <div key={`${m.author}-${i}`} className="live-message">
              <strong>{m.author}</strong>
              <span>{m.text}</span>
            </div>
          ))}
        </div>

        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            setMessages((list) => [...list, { author: 'Vous', text: draft.trim() }])
            setDraft('')
          }}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Poser une question écrite…" />
          <button type="submit" className="send-btn" aria-label="Envoyer">
            <Icon name="send" size={18} />
          </button>
        </form>

        <p className="disclaimer">
          <Icon name="shield" size={14} />
          Session simulée dans cet aperçu web : aucun flux audio/vidéo n'est diffusé.
        </p>
      </div>
    </Sheet>
  )
}

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const goOnline = () => setOffline(false)
    const goOffline = () => setOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
  if (!offline) return null
  return (
    <div className="offline-banner" role="status">
      <Icon name="shield" size={14} /> Hors-ligne · progression enregistrée localement
    </div>
  )
}

/* ------------------------------- App -------------------------------- */

export default function App() {
  const { state, dispatch } = useApp()
  const [route, navigate] = useRoute()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [live, setLive] = useState<{ title: string; instructor: string } | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  const account = state.account
  const immersive = route.tab === 'courses' && Boolean(route.lessonId)

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 })
  }, [route])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const content = useMemo(() => {
    if (!account) return null
    switch (route.tab) {
      case 'home':
        return <DashboardScreen onNavigate={navigate} onOpenLive={() => setLive({ title: 'Architecture Logicielle & Offline-First', instructor: 'Amina Diallo' })} />
      case 'courses':
        return (
          <CoursesScreen
            courseId={route.courseId ?? null}
            lessonId={route.lessonId ?? null}
            onOpenCourse={(id) => navigate(`#/cours/${id}`)}
            onOpenLesson={(courseId, lessonId) => navigate(`#/cours/${courseId}/${lessonId}`)}
            onBack={() => navigate('#/cours')}
            onOpenLive={(title, instructor) => setLive({ title, instructor })}
          />
        )
      case 'cards':
        return <FlashcardsScreen focusCardId={route.cardId ?? null} />
      case 'badges':
        return <CertificatesScreen />
      case 'network':
        return <NetworkScreen />
      case 'profile':
        return <ProfileScreen onBack={() => navigate('#/')} onNavigate={navigate} />
      default:
        return null
    }
  }, [account, route, navigate])

  if (!account) {
    return (
      <div className="stage">
        <div className="device">
          <div className="viewport">
            <OfflineBanner />
            <LoginScreen />
            <div id="sheet-root" className="sheet-root" />
            <Toasts bottom={18} />
          </div>
        </div>
        <p className="stage-caption">
          Aperçu web interactif · projet Android <strong>AfricaSkills</strong> (Kotlin/Compose)
        </p>
      </div>
    )
  }

  const showChrome = !immersive && route.tab !== 'profile'

  return (
    <div className="stage">
      <div className="device">
        <div className="viewport">
          <OfflineBanner />
          {showChrome && (
            <header className="topbar">
              <button type="button" className="brand" onClick={() => navigate('#/')}>
                <img src="/img/logo-192.jpg" alt="" />
                <span>
                  <strong>AfricaSkills</strong>
                  <small>Plateforme panafricaine</small>
                </span>
              </button>
              <div className="topbar-actions">
                <button
                  type="button"
                  className="icon-btn search-btn"
                  aria-label="Rechercher (Ctrl K)"
                  onClick={() => setPaletteOpen(true)}
                >
                  <Icon name="search" size={18} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Changer de thème"
                  onClick={() => dispatch({ type: 'THEME', theme: state.theme === 'light' ? 'dark' : 'light' })}
                >
                  <Icon name={state.theme === 'light' ? 'moon' : 'sun'} size={18} />
                </button>
                <button type="button" className="avatar-btn" onClick={() => navigate('#/profil')} aria-label="Mon profil">
                  <Avatar name={account.name} size={34} />
                </button>
              </div>
            </header>
          )}

          <main ref={contentRef} className={`content ${immersive ? 'immersive' : ''}`}>{content}</main>

          {showChrome && (
            <nav className="bottomnav" aria-label="Navigation principale">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={route.tab === tab.id ? 'active' : ''}
                  onClick={() => navigate(tab.path)}
                >
                  <Icon name={tab.icon} size={21} filled={route.tab === tab.id} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          )}

          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={navigate} />

          <div id="sheet-root" className="sheet-root" />
          <LiveSheet
            open={Boolean(live)}
            title={live?.title ?? ''}
            instructor={live?.instructor ?? ''}
            onClose={() => setLive(null)}
          />
          <Toasts bottom={immersive ? 18 : 84} />
        </div>
      </div>
      <p className="stage-caption">
        Aperçu web interactif · projet Android <strong>AfricaSkills</strong> (Kotlin/Compose) · paiements et
        attestations simulés
      </p>
    </div>
  )
}
