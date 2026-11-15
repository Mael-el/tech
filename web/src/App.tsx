import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon, type IconName } from './components/Icon'
import { Avatar, Sheet, Toasts, scrollContentTop } from './components/ui'
import { useApp } from './store'
import { LoginScreen } from './screens/Login'
import { DashboardScreen } from './screens/Dashboard'
import { CoursesScreen } from './screens/Courses'
import { FlashcardsScreen } from './screens/Flashcards'
import { CertificatesScreen } from './screens/Certificates'
import { NetworkScreen } from './screens/Network'
import { ProfileScreen } from './screens/Profile'

type Tab = 'home' | 'courses' | 'cards' | 'badges' | 'network'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Accueil', icon: 'home' },
  { id: 'courses', label: 'Cours', icon: 'book' },
  { id: 'cards', label: 'Révision', icon: 'cards' },
  { id: 'badges', label: 'Certifs', icon: 'award' },
  { id: 'network', label: 'Réseau', icon: 'globe' },
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

/* ------------------------------- App -------------------------------- */

export default function App() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState<Tab>('home')
  const [profileOpen, setProfileOpen] = useState(false)
  const [immersive, setImmersive] = useState(false)
  const [courseToOpen, setCourseToOpen] = useState<string | null>(null)
  const [live, setLive] = useState<{ title: string; instructor: string } | null>(null)

  const account = state.account
  const contentRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 })
  }, [tab, profileOpen])

  const openCourse = (id: string) => {
    setCourseToOpen(id)
    setProfileOpen(false)
    setTab('courses')
  }

  const content = useMemo(() => {
    if (!account) return null
    if (profileOpen) return <ProfileScreen onBack={() => setProfileOpen(false)} />
    switch (tab) {
      case 'home':
        return (
          <DashboardScreen
            onNavigate={(next) => setTab(next)}
            onOpenCourse={openCourse}
            onOpenLive={() =>
              setLive({ title: 'Architecture Logicielle & Offline-First', instructor: 'Amina Diallo' })
            }
          />
        )
      case 'courses':
        return (
          <CoursesScreen
            openCourseId={courseToOpen}
            onCourseConsumed={() => setCourseToOpen(null)}
            onImmersive={setImmersive}
            onOpenLive={(title, instructor) => setLive({ title, instructor })}
          />
        )
      case 'cards':
        return <FlashcardsScreen />
      case 'badges':
        return <CertificatesScreen />
      case 'network':
        return <NetworkScreen />
      default:
        return null
    }
  }, [account, profileOpen, tab, courseToOpen])

  if (!account) {
    return (
      <div className="stage">
        <div className="device">
          <div className="viewport">
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

  return (
    <div className="stage">
      <div className="device">
        <div className="viewport">
          {!immersive && !profileOpen && (
            <header className="topbar">
              <button type="button" className="brand" onClick={() => setTab('home')}>
                <img src="/img/logo-192.jpg" alt="" />
                <span>
                  <strong>AfricaSkills</strong>
                  <small>Plateforme panafricaine</small>
                </span>
              </button>
              <div className="topbar-actions">
                <span className="streak-chip" title="Série d'apprentissage">
                  <Icon name="flame" size={15} filled /> {state.streak}
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Changer de thème"
                  onClick={() => dispatch({ type: 'THEME', theme: state.theme === 'light' ? 'dark' : 'light' })}
                >
                  <Icon name={state.theme === 'light' ? 'moon' : 'sun'} size={19} />
                </button>
                <button type="button" className="avatar-btn" onClick={() => setProfileOpen(true)} aria-label="Mon profil">
                  <Avatar name={account.name} size={36} />
                </button>
              </div>
            </header>
          )}

          <main ref={contentRef} className={`content ${immersive ? 'immersive' : ''}`}>{content}</main>

          {!immersive && !profileOpen && (
            <nav className="bottomnav" aria-label="Navigation principale">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={tab === t.id ? 'active' : ''}
                  onClick={() => {
                    setTab(t.id)
                    setCourseToOpen(null)
                  }}
                >
                  <Icon name={t.icon} size={21} filled={tab === t.id} />
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>
          )}

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
