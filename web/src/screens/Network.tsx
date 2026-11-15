import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Btn, Card, Chip, EmptyState } from '../components/ui'
import { domainById, seed, useApp } from '../store'

const STATUSES = [
  { id: 'TODO', label: 'À faire' },
  { id: 'IN_PROGRESS', label: 'En cours' },
  { id: 'DONE', label: 'Terminé' },
  { id: 'INCUBATION', label: 'Incubation' },
]

export function NetworkScreen() {
  const { state, dispatch, notify } = useApp()
  const [tab, setTab] = useState<'jobs' | 'projects' | 'community'>('jobs')
  const [domain, setDomain] = useState(seed.messages[0]?.domainId ?? 'dev')
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  const messages = useMemo(
    () => state.messages.filter((m) => m.domainId === domain),
    [state.messages, domain],
  )

  useEffect(() => {
    if (tab === 'community') endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages.length, tab])

  const send = () => {
    if (!draft.trim()) return
    dispatch({
      type: 'SEND_MESSAGE',
      domainId: domain,
      text: draft.trim(),
      author: state.account?.name ?? 'Apprenant',
    })
    setDraft('')
  }

  const moveProject = (id: string, current: string) => {
    const order = STATUSES.map((s) => s.id)
    const next = order[(order.indexOf(current) + 1) % order.length]
    dispatch({ type: 'MOVE_PROJECT', projectId: id, status: next })
    notify(`Statut du projet mis à jour : ${STATUSES.find((s) => s.id === next)?.label}`)
  }

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Réseau</h1>
        <p>Emplois, projets d'incubation et communautés par domaine</p>
      </header>

      <div className="segmented">
        <button type="button" className={tab === 'jobs' ? 'active' : ''} onClick={() => setTab('jobs')}>
          Emplois
        </button>
        <button type="button" className={tab === 'projects' ? 'active' : ''} onClick={() => setTab('projects')}>
          Projets
        </button>
        <button type="button" className={tab === 'community' ? 'active' : ''} onClick={() => setTab('community')}>
          Communauté
        </button>
      </div>

      {tab === 'jobs' && (
        <div className="stack">
          <Card className="profile-ready">
            <span className="ready-dot" />
            <div>
              <strong>Profil prêt à être partagé</strong>
              <p>Votre badge {state.badges.b_argent ? 'Argent' : 'Bronze'} et vos {seed.profile.completedCoursesCount + state.extraCourses} cours validés sont joints à chaque candidature.</p>
            </div>
          </Card>
          <p className="demo-note">
            <Icon name="info" size={13} />
            Offres d'exemple : les entreprises sont citées à titre illustratif et aucune candidature
            n'est transmise. Le vrai marché est sur <strong>novojob.com</strong>.
          </p>
          {seed.jobs.map((job) => {
            const applied = state.appliedJobs.includes(job.id)
            const d = domainById(job.domainId)
            return (
              <Card key={job.id} className="job-card">
                <div className="job-head">
                  <span className="job-logo" style={{ background: `${d.color}1a`, color: d.color }}>
                    <Icon name="briefcase" size={19} />
                  </span>
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.companyName} · {job.location}</p>
                  </div>
                </div>
                <div className="tags">
                  <span className="tag">{job.type}</span>
                  <span className="tag tag-gold">{job.salaryRange}</span>
                  <span className="tag">{job.badgeRequired}</span>
                </div>
                <p className="muted small">{job.description}</p>
                <p className="requirements"><Icon name="shield" size={13} /> {job.requirements}</p>
                {applied ? (
                  <p className="applied"><Icon name="check" size={14} /> Candidature simulée (démo)</p>
                ) : (
                  <Btn
                    variant="soft"
                    full
                    icon="send"
                    onClick={() => {
                      dispatch({ type: 'APPLY', jobId: job.id })
                      notify(`Candidature simulée chez ${job.companyName} : rien n'a été envoyé.`)
                    }}
                  >
                    Postuler avec mon profil
                  </Btn>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'projects' && (
        <>
          <p className="scroll-hint">
            <Icon name="next" size={13} /> Glissez horizontalement pour changer d'étape
          </p>
          <div className="kanban">
          {STATUSES.map((status) => {
            const items = seed.projects.filter((p) => (state.projectStatus[p.id] ?? p.status) === status.id)
            return (
              <section key={status.id} className="kanban-col">
                <header>
                  <span className={`status-dot status-${status.id}`} />
                  <strong>{status.label}</strong>
                  <span className="count">{items.length}</span>
                </header>
                {items.map((p) => {
                  const d = domainById(p.domainId)
                  return (
                    <Card key={p.id} className="project-card">
                      <span className="eyebrow" style={{ color: d.color }}>{d.label}</span>
                      <h3>{p.title}</h3>
                      <p className="muted small">{p.description}</p>
                      <div className="project-meta">
                        <span><Icon name="target" size={13} /> {p.targetKpi}</span>
                        <span><Icon name="users" size={13} /> {p.teamSize} membres</span>
                        <span><Icon name="user" size={13} /> {p.mentorName}</span>
                        <span><Icon name="code" size={13} /> {p.repoUrl}</span>
                      </div>
                      {p.isStartupIncubated && <span className="tag tag-gold">Startup incubée</span>}
                      <Btn variant="ghost" full icon="next" onClick={() => moveProject(p.id, status.id)}>
                        Faire avancer
                      </Btn>
                    </Card>
                  )
                })}
                {items.length === 0 && <p className="kanban-empty">Aucun projet</p>}
              </section>
            )
          })}
          </div>
        </>
      )}

      {tab === 'community' && (
        <>
          <div className="chip-row">
            {seed.domains
              .filter((d) => state.messages.some((m) => m.domainId === d.id))
              .map((d) => (
                <Chip key={d.id} label={d.label} color={d.color} active={domain === d.id} onClick={() => setDomain(d.id)} />
              ))}
          </div>

          <div className="chat">
            <div className="chat-head">
              <span className="chat-avatar" style={{ background: `${domainById(domain).color}1f`, color: domainById(domain).color }}>
                <Icon name="chat" size={18} />
              </span>
              <div>
                <strong>Salon {domainById(domain).label}</strong>
                <p>{messages.length} messages · modération mentors</p>
              </div>
            </div>

            <div className="chat-list">
              {messages.length === 0 && (
                <EmptyState icon="chat" title="Salon vide" text="Lancez la discussion avec les autres apprenants." />
              )}
              {messages.map((m) => (
                <div key={m.id} className={`bubble ${m.isUser ? 'mine' : ''}`}>
                  <div className="bubble-head">
                    <strong>{m.senderName}</strong>
                    <span className={`role ${m.senderRole === 'Mentor' ? 'mentor' : ''}`}>{m.senderRole}</span>
                    <small>{m.timestampText}</small>
                  </div>
                  <p>{m.messageText}</p>
                  {m.reactionsCount > 0 && <span className="reactions"><Icon name="star" size={11} /> {m.reactionsCount}</span>}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <form
              className="chat-input"
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Écrire dans ${domainById(domain).label}…`}
              />
              <button type="submit" className="send-btn" aria-label="Envoyer" disabled={!draft.trim()}>
                <Icon name="send" size={18} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
