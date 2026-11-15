import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon, type IconName } from './components/Icon'
import { Avatar, Btn, Sheet, Toasts } from './components/ui'
import { CommandPalette } from './components/CommandPalette'
import { FOCUS_DAILY_CAP, FOCUS_XP, arcadePlayedToday, useApp } from './store'
import { ACHIEVEMENTS } from './lib/arcade'
import { useRoute, type Tab } from './lib/router'
import { LoginScreen } from './screens/Login'
import { DashboardScreen } from './screens/Dashboard'
import { CoursesScreen } from './screens/Courses'
import { FlashcardsScreen } from './screens/Flashcards'
import { CertificatesScreen } from './screens/Certificates'
import { NetworkScreen } from './screens/Network'
import { ProfileScreen } from './screens/Profile'
import { ArcadeScreen } from './screens/Arcade'
import { FactsScreen } from './screens/Facts'
import { VerifyScreen } from './screens/Verify'

const TABS: { id: Tab; label: string; icon: IconName; path: string }[] = [
  { id: 'home', label: 'Accueil', icon: 'home', path: '#/' },
  { id: 'courses', label: 'Cours', icon: 'book', path: '#/cours' },
  { id: 'cards', label: 'Révision', icon: 'cards', path: '#/revision' },
  { id: 'badges', label: 'Certifs', icon: 'award', path: '#/certifications' },
  { id: 'network', label: 'Réseau', icon: 'globe', path: '#/reseau' },
]

/* ------------------------- Session de concentration ------------------ */

const FOCUS_DURATIONS = [5, 15, 25] as const

function FocusSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, notify } = useApp()
  const [minutes, setMinutes] = useState<number>(25)
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!open) {
      setRunning(false)
      setFinished(false)
      setRemaining(minutes * 60)
    }
  }, [open, minutes])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(id)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => {
    if (remaining !== 0 || finished) return
    setRunning(false)
    setFinished(true)
    dispatch({ type: 'FOCUS_DONE' })
    const doneToday = state.focus.dates.filter((date) => date === new Date().toISOString().slice(0, 10)).length
    notify(
      doneToday + 1 > FOCUS_DAILY_CAP
        ? 'Session terminée. Plafond de 4 sessions par jour atteint : pas de XP supplémentaire.'
        : `Session de ${minutes} min terminée : +${FOCUS_XP} XP enregistrés.`,
    )
  }, [remaining, finished, dispatch, notify, minutes, state.focus.dates])

  const total = minutes * 60
  const ratio = total === 0 ? 0 : (total - remaining) / total
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const circumference = 2 * Math.PI * 52

  return (
    <Sheet open={open} onClose={onClose} title="Session de concentration">
      <div className="focus-sheet">
        <div className="focus-ring-wrap">
          <svg viewBox="0 0 120 120" className="focus-ring" aria-hidden="true">
            <circle cx="60" cy="60" r="52" className="focus-track" />
            <circle
              cx="60"
              cy="60"
              r="52"
              className="focus-value"
              strokeDasharray={`${circumference * ratio} ${circumference}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="focus-time" aria-live="polite">
            {mm}:{ss}
          </span>
        </div>

        <div className="segmented focus-durations">
          {FOCUS_DURATIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              className={minutes === duration ? 'active' : ''}
              disabled={running}
              onClick={() => {
                setMinutes(duration)
                setRemaining(duration * 60)
                setFinished(false)
              }}
            >
              {duration} min
            </button>
          ))}
        </div>

        <div className="focus-actions">
          <Btn
            variant={running ? 'soft' : 'primary'}
            icon={running ? 'pause' : 'play'}
            onClick={() => {
              if (finished) {
                setRemaining(minutes * 60)
                setFinished(false)
                return
              }
              setRunning((value) => !value)
            }}
          >
            {finished ? 'Nouvelle session' : running ? 'Mettre en pause' : remaining === total ? 'Démarrer' : 'Reprendre'}
          </Btn>
          <Btn
            variant="ghost"
            icon="close"
            onClick={() => {
              setRunning(false)
              setRemaining(minutes * 60)
              setFinished(false)
            }}
          >
            Réinitialiser
          </Btn>
        </div>

        <div className="focus-meta">
          <span>
            <Icon name="flame" size={14} /> {state.focus.dates.length} session{state.focus.dates.length > 1 ? 's' : ''} terminée
            {state.focus.dates.length > 1 ? 's' : ''}
          </span>
          <span>
            <Icon name="sparkles" size={14} /> +{FOCUS_XP} XP · plafond {FOCUS_DAILY_CAP}/jour
          </span>
        </div>

        <p className="disclaimer">
          <Icon name="shield" size={14} /> Le minuteur tourne dans votre navigateur ; la session n&apos;est comptée
          qu&apos;une fois le temps écoulé, et elle reste enregistrée après fermeture.
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
  const { state, dispatch, notify } = useApp()
  const [route, navigate] = useRoute()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [focusOpen, setFocusOpen] = useState(false)
  const contentRef = useRef<HTMLElement | null>(null)
  const seenAchievements = useRef<string[]>(state.arcade.achievements)

  useEffect(() => {
    const unlocked = state.arcade.achievements
    const fresh = unlocked.filter((id) => !seenAchievements.current.includes(id))
    seenAchievements.current = unlocked
    if (fresh.length === 0) return
    const titles = fresh
      .map((id) => ACHIEVEMENTS.find((item) => item.id === id)?.title)
      .filter(Boolean)
      .join(', ')
    notify(
      fresh.length === 1
        ? `Succès débloqué : ${titles} (+25 XP)`
        : `${fresh.length} succès débloqués : ${titles} (+${fresh.length * 25} XP)`,
    )
  }, [state.arcade.achievements, notify])

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
        return <DashboardScreen onNavigate={navigate} onOpenFocus={() => setFocusOpen(true)} />
      case 'courses':
        return (
          <CoursesScreen
            courseId={route.courseId ?? null}
            lessonId={route.lessonId ?? null}
            onOpenCourse={(id) => navigate(`#/cours/${id}`)}
            onOpenLesson={(courseId, lessonId) => navigate(`#/cours/${courseId}/${lessonId}`)}
            onBack={() => navigate('#/cours')}
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
      case 'arcade':
        return <ArcadeScreen onNavigate={navigate} />
      case 'facts':
        return <FactsScreen factId={route.factId} onNavigate={navigate} />
      case 'verify':
        return <VerifyScreen code={route.code} onHome={() => navigate('#/')} onVerify={(code) => navigate(`#/verifier/${code}`)} />
      default:
        return null
    }
  }, [account, route, navigate])

  if (route.tab === 'verify') {
    return (
      <div className="stage">
        <div className="device">
          <div className="viewport">
            <main className="content">
              <VerifyScreen
                code={route.code}
                onHome={() => navigate('#/')}
                onVerify={(code) => navigate(`#/verifier/${code}`)}
              />
            </main>
            <Toasts bottom={18} />
          </div>
        </div>
        <p className="stage-caption">
          Vérification publique · aucune donnée n’est lue dans le navigateur du visiteur
        </p>
      </div>
    )
  }

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
          Port web interactif · projet Android <strong>AfricaSkills</strong> (Kotlin/Compose)
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
                  className="icon-btn arcade-btn"
                  aria-label="Salle d’arcade"
                  onClick={() => {
                    navigate('#/arcade')
                    window.dispatchEvent(new Event('arcade:reset'))
                  }}
                >
                  <Icon name="gamepad" size={18} />
                  {(['quiz', 'vf', 'memory'] as const).some((game) => !arcadePlayedToday(state, game)) && (
                    <span className="arcade-dot" />
                  )}
                </button>
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
                  <Icon name={tab.icon} size={21} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          )}

          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={navigate} />

          <div id="sheet-root" className="sheet-root" />
          <FocusSheet open={focusOpen} onClose={() => setFocusOpen(false)} />
          <Toasts bottom={immersive ? 18 : 84} />
        </div>
      </div>
      <p className="stage-caption">
        Port web interactif · projet Android <strong>AfricaSkills</strong> (Kotlin/Compose) · données conservées
        dans le navigateur
      </p>
    </div>
  )
}
