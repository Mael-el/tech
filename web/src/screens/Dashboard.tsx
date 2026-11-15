import React from 'react'
import { Icon } from '../components/Icon'
import { Card, Progress, SectionTitle, Stat } from '../components/ui'
import {
  coursesCompleted,
  currentTier,
  domainById,
  lessonsFor,
  nextTier,
  seed,
  streakOf,
  todayXp,
  useApp,
  FOCUS_XP,
} from '../store'
import { activityWindow, accuracy } from '../lib/progress'
import { isDue } from '../lib/sm2'
import { factOfTheDay, themeById } from '../lib/facts'

function GoalRing({ value, goal }: { value: number; goal: number }) {
  const radius = 27
  const circumference = 2 * Math.PI * radius
  const ratio = Math.max(0, Math.min(1, value / goal))
  return (
    <span className="goal-ring">
      <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <circle cx="32" cy="32" r={radius} className="goal-track" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          className="goal-value"
          strokeDasharray={`${circumference * ratio} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="goal-text">
        <strong>{Math.min(value, goal)}</strong>
        <small>/ {goal} XP</small>
      </span>
    </span>
  )
}

export function DashboardScreen({
  onNavigate,
  onOpenFocus,
}: {
  onNavigate: (path: string) => void
  onOpenFocus: () => void
}) {
  const { state } = useApp()
  const account = state.account
  if (!account) return null

  const tier = currentTier(state)
  const upcoming = nextTier(state)
  const done = coursesCompleted(state)
  const progressToNext = upcoming ? Math.min(100, Math.round((state.points / upcoming.minPoints) * 100)) : 100
  const streak = streakOf(state)
  const today = todayXp(state)

  const enrolled = seed.courses
    .filter((c) => state.enrolled.includes(c.id) && (state.progress[c.id] ?? 0) < 100)
    .sort((a, b) => (state.progress[b.id] ?? 0) - (state.progress[a.id] ?? 0))
  const resume = enrolled[0]
  const nextLesson = resume ? lessonsFor(resume.id).find((l) => !state.completedLessons.includes(l.id)) : undefined

  const cards = [...seed.flashcards, ...state.customCards]
  const dueCards = cards.filter((c) => isDue(state.cards[c.id]))

  const applications = [...state.applications].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  const unlocked = seed.badges.filter((b) => state.badges[b.id])
  const week = activityWindow(state.activity, 7)
  const weekMax = Math.max(...week.map((d) => d.xp), 1)

  const plan = [
    {
      id: 'cards',
      title: dueCards.length ? `Réviser ${dueCards.length} carte${dueCards.length > 1 ? 's' : ''}` : 'Révision à jour',
      hint: 'Répétition espacée SM-2',
      done: dueCards.length === 0,
      path: '#/revision',
      icon: 'cards' as const,
    },
    {
      id: 'lesson',
      title: nextLesson ? 'Terminer la leçon suivante' : 'Cours en cours terminés',
      hint: nextLesson ? nextLesson.title : resume ? resume.title : 'Inscrivez-vous à un cours',
      done: !nextLesson,
      path: nextLesson && resume ? `#/cours/${resume.id}/${nextLesson.id}` : '#/cours',
      icon: 'play' as const,
    },
    {
      id: 'goal',
      title: today >= state.dailyGoal ? 'Objectif quotidien atteint' : `Encore ${state.dailyGoal - today} XP aujourd'hui`,
      hint: `Objectif : ${state.dailyGoal} XP par jour`,
      done: today >= state.dailyGoal,
      path: '#/revision',
      icon: 'target' as const,
    },
  ]

  const dailyFact = factOfTheDay()
  const factTheme = themeById(dailyFact.theme)
  const firstName = account.name.split(' ')[0]

  return (
    <div className="screen">
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-top">
          <div>
            <p className="hero-kicker">Bonjour, {firstName}</p>
            <h1>Continue là où tu t'es arrêté</h1>
          </div>
          <span className="streak" title="Série d'apprentissage">
            <Icon name="flame" size={16} filled />
            {streak}
          </span>
        </div>

        <div className="hero-badges">
          <span className="hero-chip" style={{ borderColor: tier?.color }}>
            <Icon name="award" size={14} />
            {tier ? tier.label : 'Débutant'}
          </span>
          <span className="hero-chip">
            <Icon name="sparkles" size={14} />
            {state.points.toLocaleString('fr-FR')} XP
          </span>
          <span className="hero-chip">
            <Icon name="book" size={14} />
            {done} cours
          </span>
        </div>

        {upcoming && (
          <div className="hero-next">
            <div className="hero-next-head">
              <span>Prochain palier · {upcoming.label}</span>
              <strong>{state.points.toLocaleString('fr-FR')} / {upcoming.minPoints.toLocaleString('fr-FR')} XP</strong>
            </div>
            <Progress value={progressToNext} color="linear-gradient(90deg,#FB923C,#FACC15)" />
            <p>Encore {(upcoming.minPoints - state.points).toLocaleString('fr-FR')} XP et {Math.max(0, upcoming.minCourses - done)} cours validés.</p>
          </div>
        )}
      </section>

      <Card className="goal-card">
        <GoalRing value={today} goal={state.dailyGoal} />
        <div className="goal-body">
          <span className="eyebrow">Objectif du jour</span>
          <h3>{today >= state.dailyGoal ? 'Objectif atteint, bravo !' : 'Garde le rythme'}</h3>
          <div className="week-bars" aria-hidden="true">
            {week.map((day) => (
              <span key={day.key} className="week-bar" title={`${day.xp} XP`}>
                <i style={{ height: `${Math.max(6, (day.xp / weekMax) * 100)}%` }} />
                <small>{day.label}</small>
              </span>
            ))}
          </div>
        </div>
      </Card>

      <SectionTitle title="Plan du jour" action="Révision" onAction={() => onNavigate('#/revision')} />
      <div className="plan">
        {plan.map((item) => (
          <button key={item.id} type="button" className={`plan-row ${item.done ? 'done' : ''}`} onClick={() => onNavigate(item.path)}>
            <span className="plan-icon"><Icon name={item.done ? 'check' : item.icon} size={16} /></span>
            <span className="plan-text">
              <strong>{item.title}</strong>
              <small>{item.hint}</small>
            </span>
            {!item.done && <Icon name="next" size={15} />}
          </button>
        ))}
      </div>

      <Card
        className="daily-fact"
        onClick={() => onNavigate(`#/infos/${dailyFact.id}`)}
        style={{ borderLeftColor: factTheme.color }}
      >
        <span className="eyebrow" style={{ color: factTheme.color }}>
          <Icon name="bulb" size={13} /> Le saviez-vous · chiffre vérifié
        </span>
        <div className="daily-fact-body">
          <strong style={{ color: factTheme.color }}>{dailyFact.stat}</strong>
          <div>
            <h3>{dailyFact.title}</h3>
            <p className="muted small">{dailyFact.source.name.split('—')[0].trim()} · {dailyFact.source.date}</p>
          </div>
        </div>
        <span className="daily-fact-cta">
          Voir la fiche et la source <Icon name="next" size={13} />
        </span>
      </Card>

      <button type="button" className="arcade-cta-card" onClick={() => onNavigate('#/arcade')}>
        <span className="arcade-cta-icon"><Icon name="gamepad" size={20} /></span>
        <span className="arcade-cta-copy">
          <strong>Salle d&apos;arcade</strong>
          <small>Défi éclair · Vrai ou faux · Mémoire tech — des chiffres réels</small>
        </span>
        <Icon name="next" size={16} />
      </button>

      <div className="stats-grid">
        <Stat icon="sparkles" value={state.points.toLocaleString('fr-FR')} label="points" tone="#C2410C" />
        <Stat icon="flame" value={`${streak} j`} label="série" tone="#EA580C" />
        <Stat icon="target" value={`${accuracy(state.quiz)} %`} label="précision" tone="#059669" />
        <Stat icon="award" value={`${unlocked.length}/5`} label="badges" tone="#7C3AED" />
      </div>

      {resume && (
        <>
          <SectionTitle title="Reprendre" action="Mes cours" onAction={() => onNavigate('#/cours')} />
          <Card
            className="resume"
            onClick={() => onNavigate(`#/cours/${resume.id}`)}
            style={{ borderLeftColor: domainById(resume.domainId).color }}
          >
            <div className="resume-body">
              <span className="eyebrow" style={{ color: domainById(resume.domainId).color }}>
                {domainById(resume.domainId).label}
              </span>
              <h3>{resume.title}</h3>
              <p>{resume.instructorName} · {resume.durationHours} h · {resume.level}</p>
              <div className="resume-progress">
                <Progress value={state.progress[resume.id] ?? 0} color={domainById(resume.domainId).color} />
                <strong>{state.progress[resume.id] ?? 0}%</strong>
              </div>
            </div>
            <span className="resume-go">
              <Icon name="play" size={18} filled />
            </span>
          </Card>
        </>
      )}

      <Card className="focus-card" onClick={onOpenFocus}>
        <span className="focus-card-icon"><Icon name="clock" size={20} /></span>
        <div>
          <span className="eyebrow">Concentration</span>
          <h3>Lancer une session de travail</h3>
          <p>
            Minuteur 5 / 15 / 25 min · +{FOCUS_XP} XP · {state.focus.dates.length} session
            {state.focus.dates.length > 1 ? 's' : ''} enregistrée{state.focus.dates.length > 1 ? 's' : ''}
          </p>
        </div>
        <span className="focus-card-go">Démarrer</span>
      </Card>

      <SectionTitle title="Explorer les domaines" action="Tout voir" onAction={() => onNavigate('#/cours')} />
      <div className="domain-scroll">
        {seed.domains.map((d) => (
          <button
            key={d.id}
            type="button"
            className="domain-tile"
            style={{ borderColor: `${d.color}55` }}
            onClick={() => onNavigate('#/cours')}
          >
            <span className="domain-dot" style={{ background: d.color }} />
            <strong>{d.label}</strong>
            <small>{seed.courses.filter((c) => c.domainId === d.id).length} cours</small>
          </button>
        ))}
      </div>

      <SectionTitle title="Mes candidatures" action="Réseau" onAction={() => onNavigate('#/reseau')} />
      <div className="stack">
        {applications.length === 0 ? (
          <Card className="job-mini" onClick={() => onNavigate('#/reseau')}>
            <div className="job-logo" style={{ background: '#0E7C5A1a', color: '#0E7C5A' }}>
              <Icon name="briefcase" size={18} />
            </div>
            <div>
              <h3>Aucune candidature suivie</h3>
              <p>Ajoutez une offre avec son lien : le suivi est enregistré sur cet appareil.</p>
              <span className="tag">Ouvrir le suivi</span>
            </div>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id} className="job-mini" onClick={() => onNavigate('#/reseau')}>
              <div className="job-logo" style={{ background: '#0E7C5A1a', color: '#0E7C5A' }}>
                <Icon name="briefcase" size={18} />
              </div>
              <div>
                <h3>{application.role}</h3>
                <p>{application.company} · {application.date}</p>
                <span className="tag">{application.status}</span>
              </div>
            </Card>
          ))
        )}
      </div>

      <SectionTitle title="Vos badges" action="Certificats" onAction={() => onNavigate('#/certifications')} />
      <Card className="badges-strip">
        {seed.badges.map((b) => {
          const isUnlocked = Boolean(state.badges[b.id])
          const tierInfo = seed.tiers.find((t) => t.name === b.tier)!
          return (
            <div key={b.id} className={`badge-mini ${isUnlocked ? '' : 'locked'}`}>
              <span className="badge-medal" style={{ background: `${tierInfo.color}22`, color: tierInfo.color, borderColor: `${tierInfo.color}55` }}>
                <Icon name="award" size={18} />
              </span>
              <small>{tierInfo.label}</small>
            </div>
          )
        })}
      </Card>

      <p className="storage-note">
        <Icon name="shield" size={14} /> Progression, candidatures et certificats enregistrés sur cet appareil
        (Ctrl K pour rechercher)
      </p>
    </div>
  )
}
