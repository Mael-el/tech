import React from 'react'
import { Icon } from '../components/Icon'
import { Card, Progress, SectionTitle, Stat } from '../components/ui'
import {
  courseById,
  coursesCompleted,
  currentTier,
  domainById,
  nextTier,
  seed,
  useApp,
} from '../store'

export function DashboardScreen({
  onNavigate,
  onOpenCourse,
  onOpenLive,
}: {
  onNavigate: (tab: 'courses' | 'cards' | 'badges' | 'network') => void
  onOpenCourse: (id: string) => void
  onOpenLive: () => void
}) {
  const { state, notify } = useApp()
  const account = state.account
  if (!account) return null

  const tier = currentTier(state)
  const upcoming = nextTier(state)
  const done = coursesCompleted(state)
  const progressToNext = upcoming
    ? Math.min(100, Math.round((state.points / upcoming.minPoints) * 100))
    : 100

  const enrolled = seed.courses
    .filter((c) => state.enrolled.includes(c.id) && (state.progress[c.id] ?? 0) < 100)
    .sort((a, b) => (state.progress[b.id] ?? 0) - (state.progress[a.id] ?? 0))
  const resume = enrolled[0]

  const dueCards = seed.flashcards.filter((c) => {
    const card = state.cards[c.id]
    return !card || card.next <= Date.now()
  }).length

  const jobs = seed.jobs.filter((j) => !state.appliedJobs.includes(j.id)).slice(0, 2)
  const unlocked = seed.badges.filter((b) => state.badges[b.id])

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
            {state.streak}
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

      <div className="stats-grid">
        <Stat icon="sparkles" value={state.points.toLocaleString('fr-FR')} label="points XP" tone="#C2410C" />
        <Stat icon="flame" value={`${state.streak} j`} label="série" tone="#EA580C" />
        <Stat icon="book" value={`${done}`} label="cours" tone="#1D4ED8" />
        <Stat icon="award" value={`${unlocked.length}/5`} label="badges" tone="#7C3AED" />
      </div>

      {resume && (
        <>
          <SectionTitle title="Reprendre" action="Mes cours" onAction={() => onNavigate('courses')} />
          <Card
            className="resume"
            onClick={() => onOpenCourse(resume.id)}
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

      <Card className="live-card" onClick={onOpenLive}>
        <span className="live-dot" />
        <div>
          <span className="eyebrow">Session FATA en direct</span>
          <h3>Architecture Logicielle &amp; Offline-First</h3>
          <p>Amina Diallo (Dakar) · 142 inscrits · demain 18h GMT</p>
        </div>
        <span className="live-join">Rejoindre</span>
      </Card>

      <SectionTitle title="Révision du jour" action="Ouvrir" onAction={() => onNavigate('cards')} />
      <Card className="due-card" onClick={() => onNavigate('cards')}>
        <span className="due-ring">
          <strong>{dueCards}</strong>
          <small>cartes</small>
        </span>
        <div>
          <h3>{dueCards > 0 ? 'Cartes à réviser aujourd’hui' : 'Tout est à jour'}</h3>
          <p>Répétition espacée SM-2 · {seed.flashcards.length} cartes dans votre paquet.</p>
        </div>
        <Icon name="next" size={18} />
      </Card>

      <SectionTitle title="Explorer les domaines" action="Tout voir" onAction={() => onNavigate('courses')} />
      <div className="domain-scroll">
        {seed.domains.map((d) => (
          <button
            key={d.id}
            type="button"
            className="domain-tile"
            style={{ borderColor: `${d.color}55` }}
            onClick={() => onNavigate('courses')}
          >
            <span className="domain-dot" style={{ background: d.color }} />
            <strong>{d.label}</strong>
            <small>{seed.courses.filter((c) => c.domainId === d.id).length} cours</small>
          </button>
        ))}
      </div>

      <SectionTitle title="Opportunités" action="Réseau" onAction={() => onNavigate('network')} />
      <div className="stack">
        {jobs.map((job) => (
          <Card key={job.id} className="job-mini" onClick={() => onNavigate('network')}>
            <div className="job-logo" style={{ background: `${domainById(job.domainId).color}1a`, color: domainById(job.domainId).color }}>
              <Icon name="briefcase" size={18} />
            </div>
            <div>
              <h3>{job.title}</h3>
              <p>{job.companyName} · {job.location}</p>
              <span className="tag">{job.type}</span>
              <span className="tag tag-gold">{job.salaryRange}</span>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle title="Vos badges" action="Certificats" onAction={() => onNavigate('badges')} />
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

      <button
        type="button"
        className="refresh-demo"
        onClick={() => {
          notify('Progression de démonstration conservée dans ce navigateur.')
        }}
      >
        <Icon name="shield" size={14} /> Données de démonstration · stockage local
      </button>
    </div>
  )
}
