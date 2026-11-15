import React, { useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Avatar, Btn, Card } from '../components/ui'
import {
  ENGLISH_LEVELS,
  STORAGE_KEY,
  coursesCompleted,
  currentTier,
  domainById,
  lessonsFor,
  seed,
  streakOf,
  todayXp,
  useApp,
} from '../store'
import { activityWindow, accuracy, totalXp } from '../lib/progress'
import type { Persist } from '../store'

function intensity(xp: number): number {
  if (!xp) return 0
  if (xp < 25) return 1
  if (xp < 50) return 2
  if (xp < 80) return 3
  return 4
}

function Heatmap({ activity }: { activity: Record<string, number> }) {
  const days = activityWindow(activity, 84)
  const weeks = useMemo(() => {
    const chunks: typeof days[] = []
    for (let i = 0; i < days.length; i += 7) chunks.push(days.slice(i, i + 7))
    return chunks
  }, [days])

  return (
    <div className="heatmap-wrap">
      <div className="heatmap" role="img" aria-label="Activité d'apprentissage des 12 dernières semaines">
        {weeks.map((week, wi) => (
          <div className="heatmap-week" key={wi}>
            {week.map((day) => (
              <span
                key={day.key}
                className={`heat-cell level-${intensity(day.xp)}`}
                title={`${day.key} · ${day.xp} XP`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Moins</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`heat-cell level-${level}`} />
        ))}
        <span>Plus</span>
      </div>
    </div>
  )
}

export function ProfileScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (path: string) => void }) {
  const { state, dispatch, notify, logout } = useApp()
  const account = state.account
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(account?.name ?? '')
  const [city, setCity] = useState(account?.city ?? '')
  const [phone, setPhone] = useState(account?.phone ?? '')
  const [bio, setBio] = useState(account?.bio ?? '')
  const [level, setLevel] = useState(account?.englishLevel ?? 'A1')
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  if (!account) return null

  const tier = currentTier(state)
  const streak = streakOf(state)
  const certificateCount = Object.keys(state.certificates).length
  const week = activityWindow(state.activity, 7)
  const activeDays = activityWindow(state.activity, 28).filter((d) => d.xp > 0).length
  const quizAccuracy = accuracy(state.quiz)
  const finishedCount = coursesCompleted(state)

  const enrolledCourses = seed.courses
    .filter((c) => state.enrolled.includes(c.id))
    .map((c) => ({
      ...c,
      progress: state.progress[c.id] ?? 0,
      done: lessonsFor(c.id).filter((l) => state.completedLessons.includes(l.id)).length,
      total: lessonsFor(c.id).length,
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5)

  const save = () => {
    dispatch({ type: 'UPDATE_PROFILE', patch: { name: name.trim() || account.name, city, phone, bio, englishLevel: level } })
    setEditing(false)
    notify('Profil mis à jour.')
  }

  const exportState = () => {
    const payload = JSON.stringify({ app: 'africaskills', version: 2, exportedAt: new Date().toISOString(), state }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `africaskills-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    notify('Sauvegarde exportée.')
  }

  const importState = async (file: File) => {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as { state?: Persist } & Partial<Persist>
      const candidate = (parsed.state ?? parsed) as Partial<Persist>
      if (!candidate || typeof candidate.points !== 'number' || !candidate.activity) {
        notify('Fichier de sauvegarde invalide.', true)
        return
      }
      dispatch({
        type: 'IMPORT',
        state: {
          ...state,
          ...candidate,
          version: 3,
          account: state.account,
        } as Persist,
      })
      notify('Sauvegarde restaurée.')
    } catch {
      notify('Impossible de lire ce fichier JSON.', true)
    }
  }

  return (
    <div className="screen profile">
      <div className="profile-head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Retour">
          <Icon name="back" size={20} />
        </button>
        <strong>Mon profil</strong>
        <button type="button" className="link" onClick={() => setEditing((v) => !v)}>
          {editing ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      <div className="profile-hero">
        <Avatar name={account.name} size={74} />
        <h1>{account.name}</h1>
        <p>{account.role}</p>
        <div className="profile-meta">
          <span><Icon name="pin" size={14} /> {account.city}</span>
          <span><Icon name="mail" size={14} /> {account.email}</span>
        </div>
        <span className="tier-pill" style={{ background: `${tier?.color}1f`, color: tier?.color, borderColor: `${tier?.color}55` }}>
          <Icon name="award" size={14} /> Badge {tier?.label ?? '—'}
        </span>
        <small className="profile-local"><Icon name="lock" size={12} /> Compte local · ce navigateur</small>
      </div>

      <div className="stats-grid">
        <div className="stat"><span className="stat-icon" style={{ color: '#C2410C' }}><Icon name="sparkles" size={18} /></span><strong>{state.points.toLocaleString('fr-FR')}</strong><span>XP</span></div>
        <div className="stat"><span className="stat-icon" style={{ color: '#EA580C' }}><Icon name="flame" size={18} /></span><strong>{streak} j</strong><span>série</span></div>
        <div className="stat"><span className="stat-icon" style={{ color: '#1D4ED8' }}><Icon name="book" size={18} /></span><strong>{coursesCompleted(state)}</strong><span>cours</span></div>
        <div className="stat"><span className="stat-icon" style={{ color: '#059669' }}><Icon name="award" size={18} /></span><strong>{certificateCount}/{finishedCount}</strong><span>certificats</span></div>
      </div>

      <Card className="profile-arcade" onClick={() => onNavigate('#/arcade')}>
        <span className="arcade-cta-icon"><Icon name="gamepad" size={20} /></span>
        <div className="profile-arcade-copy">
          <strong>Salle d&apos;arcade</strong>
          <small>
            {state.arcade.achievements.length}/7 succès · Records : quiz{' '}
            {state.arcade.best.quiz ? `${state.arcade.best.quiz}/10` : '—'} · vrai-faux{' '}
            {state.arcade.best.vf ? `${state.arcade.best.vf}/8` : '—'} · mémoire{' '}
            {state.arcade.best.memoryMoves ? `${state.arcade.best.memoryMoves} coups` : '—'}
          </small>
        </div>
        <Icon name="next" size={16} />
      </Card>

      {editing ? (
        <Card className="form">
          <label className="field">
            <span>Nom complet</span>
            <div className="input-wrap"><Icon name="user" size={17} /><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          </label>
          <label className="field">
            <span>Ville</span>
            <div className="input-wrap"><Icon name="pin" size={17} /><input value={city} onChange={(e) => setCity(e.target.value)} /></div>
          </label>
          <label className="field">
            <span>Téléphone</span>
            <div className="input-wrap"><Icon name="phone" size={17} /><input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </label>
          <label className="field">
            <span>Niveau d’anglais</span>
            <div className="select-wrap">
              <Icon name="globe" size={17} />
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                {ENGLISH_LEVELS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="field">
            <span>Bio</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </label>
          <Btn full icon="check" onClick={save}>Enregistrer</Btn>
        </Card>
      ) : (
        <Card>
          <span className="eyebrow">À propos</span>
          <p className="muted">{account.bio || 'Aucune bio pour l’instant. Utilisez « Modifier » pour vous présenter.'}</p>
          <div className="about-grid">
            <span><Icon name="phone" size={14} /> {account.phone}</span>
            <span><Icon name="mail" size={14} /> {account.email}</span>
            <span><Icon name="pin" size={14} /> {account.city}</span>
            <span><Icon name="globe" size={14} /> Anglais {account.englishLevel}</span>
          </div>
        </Card>
      )}

      <Card>
        <div className="row-between">
          <span className="eyebrow">Activité d'apprentissage</span>
          <span className="muted small">{activeDays}/28 jours actifs</span>
        </div>
        <Heatmap activity={state.activity} />
        <div className="activity-stats">
          <span><strong>{todayXp(state)}</strong> XP aujourd'hui</span>
          <span><strong>{week.reduce((sum, d) => sum + d.xp, 0)}</strong> XP sur 7 jours</span>
          <span><strong>{totalXp(state.activity).toLocaleString('fr-FR')}</strong> XP suivis</span>
        </div>
      </Card>

      <Card>
        <div className="row-between">
          <span className="eyebrow">Précision aux quiz</span>
          <strong className="accuracy-value">{quizAccuracy} %</strong>
        </div>
        <div className="progress"><div className="progress-fill" style={{ width: `${quizAccuracy}%` }} /></div>
        <p className="muted small">
          {state.quiz.correct} bonnes réponses sur {state.quiz.attempts} tentatives. Les quiz ratés ne font pas
          perdre de points : ils indiquent où réviser.
        </p>
      </Card>

      {enrolledCourses.length > 0 && (
        <Card>
          <span className="eyebrow">Progression par cours</span>
          <div className="domain-progress">
            {enrolledCourses.map((course) => (
              <button key={course.id} type="button" className="domain-progress-row" onClick={() => onNavigate(`#/cours/${course.id}`)}>
                <span className="domain-progress-label">
                  <span className="domain-dot" style={{ background: domainById(course.domainId).color }} />
                  <span>
                    <strong>{course.title}</strong>
                    <small>{course.done}/{course.total} leçons · {course.progress}%</small>
                  </span>
                </span>
                <span className="mini-bar">
                  <i style={{ width: `${course.progress}%`, background: domainById(course.domainId).color }} />
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="settings">
        <div className="setting-row">
          <div>
            <strong>Apparence</strong>
            <p>Thème clair ou sombre</p>
          </div>
          <div className="theme-toggle">
            <button type="button" className={state.theme === 'light' ? 'active' : ''} onClick={() => dispatch({ type: 'THEME', theme: 'light' })}>
              <Icon name="sun" size={15} /> Clair
            </button>
            <button type="button" className={state.theme === 'dark' ? 'active' : ''} onClick={() => dispatch({ type: 'THEME', theme: 'dark' })}>
              <Icon name="moon" size={15} /> Sombre
            </button>
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>Objectif quotidien</strong>
            <p>XP visés chaque jour</p>
          </div>
          <div className="goal-choices" role="group" aria-label="Objectif quotidien">
            {[30, 60, 100].map((goal) => (
              <button
                key={goal}
                type="button"
                className={state.dailyGoal === goal ? 'active' : ''}
                onClick={() => {
                  dispatch({ type: 'SET_GOAL', goal })
                  notify(`Objectif quotidien : ${goal} XP.`)
                }}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>Sessions de concentration</strong>
            <p>{state.focus.dates.length} session{state.focus.dates.length > 1 ? 's' : ''} terminée{state.focus.dates.length > 1 ? 's' : ''} · 20 XP chacune</p>
          </div>
          <span className="focus-count-pill"><Icon name="clock" size={14} /> {state.focus.dates.length}</span>
        </div>
      </Card>

      <Card className="settings">
        <div className="setting-row">
          <div>
            <strong>Sauvegarde</strong>
            <p>Exporter ou restaurer la progression locale</p>
          </div>
          <div className="backup-actions">
            <button type="button" className="icon-btn" aria-label="Exporter la sauvegarde" onClick={exportState}>
              <Icon name="download" size={17} />
            </button>
            <button type="button" className="icon-btn" aria-label="Importer une sauvegarde" onClick={() => fileRef.current?.click()}>
              <Icon name="refresh" size={17} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void importState(file)
                e.target.value = ''
              }}
            />
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>Réinitialiser mes données</strong>
            <p>Efface XP, notes, cartes, candidatures et certificats de ce compte (irréversible)</p>
          </div>
          {confirmReset ? (
            <div className="reset-confirm">
              <Btn
                variant="ghost"
                icon="close"
                onClick={() => setConfirmReset(false)}
              >
                Annuler
              </Btn>
              <Btn
                variant="ghost"
                icon="trash"
                onClick={() => {
                  dispatch({ type: 'RESET' })
                  setConfirmReset(false)
                  notify('Données effacées. Vous repartez de zéro.')
                }}
              >
                Confirmer
              </Btn>
            </div>
          ) : (
            <Btn variant="ghost" icon="refresh" onClick={() => setConfirmReset(true)}>
              Réinitialiser
            </Btn>
          )}
        </div>
      </Card>

      <div className="favorites-summary">
        <button type="button" className="favorite-pill" onClick={() => onNavigate('#/cours')}>
          <Icon name="star" size={14} /> {state.favorites.courses.length} cours favoris
        </button>
        <button type="button" className="favorite-pill" onClick={() => onNavigate('#/revision')}>
          <Icon name="star" size={14} /> {state.favorites.cards.length} cartes favorites
        </button>
      </div>

      <Btn variant="soft" full icon="logout" onClick={logout}>
        Se déconnecter
      </Btn>

      <p className="build-note">
        AfricaSkills · aperçu web du projet Android<br />
        Kotlin 2.2.10 · Jetpack Compose · Room 2.7 · minSdk 24<br />
        <span className="mono">{STORAGE_KEY}</span>
      </p>
    </div>
  )
}
