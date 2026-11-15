import React, { useState } from 'react'
import { Icon } from '../components/Icon'
import { Btn, Card, EmptyState } from '../components/ui'
import type { ApplicationStatus, ProjectStage } from '../store'
import { useApp } from '../store'
import { celebrate } from '../components/Motion'
import {
  APPLICATION_STATUSES,
  JOB_BOARDS,
  PROJECT_STAGES,
  PROJECT_STAGE_LABELS,
} from '../lib/user-projects'

type Tab = 'applications' | 'projects' | 'boards'

const STATUS_TONE: Record<ApplicationStatus, string> = {
  'À postuler': '#B45309',
  Envoyée: '#0369A1',
  Entretien: '#7C3AED',
  Offre: '#047857',
  Refus: '#B91C1C',
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function NetworkScreen() {
  const { state, dispatch, notify } = useApp()
  const [tab, setTab] = useState<Tab>('applications')

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>('À postuler')

  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')

  const addApplication = (event: React.FormEvent) => {
    event.preventDefault()
    if (!company.trim() || !role.trim()) {
      notify('Renseignez au moins l’entreprise et le poste.')
      return
    }
    dispatch({ type: 'ADD_APPLICATION', company, role, url: normalizeUrl(url), status })
    celebrate('burst')
    notify(`Candidature enregistrée : ${role.trim()} — ${company.trim()}`)
    setCompany('')
    setRole('')
    setUrl('')
    setStatus('À postuler')
  }

  const addProject = (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) {
      notify('Donnez un titre à votre projet.')
      return
    }
    dispatch({ type: 'ADD_PROJECT', title, note })
    celebrate('burst')
    notify(`Projet créé : ${title.trim()}`)
    setTitle('')
    setNote('')
  }

  const applications = [...state.applications].sort((a, b) => b.date.localeCompare(a.date))
  const counts = APPLICATION_STATUSES.map((value) => ({
    value,
    count: applications.filter((item) => item.status === value).length,
  }))
  const projects = [...state.projects].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Réseau</h1>
        <p>Suivi réel de vos candidatures et de vos projets, plus les job boards africains à consulter.</p>
      </header>

      <div className="segmented net-tabs">
        <button type="button" className={tab === 'applications' ? 'active' : ''} onClick={() => setTab('applications')}>
          Candidatures
        </button>
        <button type="button" className={tab === 'projects' ? 'active' : ''} onClick={() => setTab('projects')}>
          Projets
        </button>
        <button type="button" className={tab === 'boards' ? 'active' : ''} onClick={() => setTab('boards')}>
          Job boards
        </button>
      </div>

      {tab === 'applications' && (
        <>
          <Card className="tracker-card">
            <div className="tracker-head">
              <span className="eyebrow">Tableau de suivi</span>
              <strong>
                {applications.length} candidature{applications.length > 1 ? 's' : ''}
              </strong>
            </div>
            <div className="tracker-statuses">
              {counts.map((item) => (
                <span key={item.value} className="status-count" style={{ color: STATUS_TONE[item.value] }}>
                  <strong>{item.count}</strong>
                  <small>{item.value}</small>
                </span>
              ))}
            </div>
          </Card>

          <Card className="form-card">
            <h3>Ajouter une candidature</h3>
            <form className="net-form" onSubmit={addApplication}>
              <label className="field">
                <span>Entreprise</span>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ex. Wave Mobile Money" />
              </label>
              <label className="field">
                <span>Poste</span>
                <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex. Développeur Android junior" />
              </label>
              <label className="field">
                <span>Lien de l’offre (optionnel)</span>
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="novojob.com/offre/…" inputMode="url" />
              </label>
              <label className="field">
                <span>Statut</span>
                <div className="select-wrap">
                  <Icon name="briefcase" size={16} />
                  <select value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus)}>
                    {APPLICATION_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <Btn type="submit" full icon="check">
                Enregistrer la candidature
              </Btn>
            </form>
          </Card>

          {applications.length === 0 ? (
            <EmptyState
              icon="briefcase"
              title="Aucune candidature pour l’instant"
              text="Choisissez une offre sur un job board, puis enregistrez-la ici pour suivre son avancement."
            />
          ) : (
            <div className="stack">
              {applications.map((application) => (
                <Card key={application.id} className="application-card">
                  <div className="application-main">
                    <span className="application-dot" style={{ background: STATUS_TONE[application.status] }} />
                    <div>
                      <h3>{application.role}</h3>
                      <p>{application.company}</p>
                      <div className="application-meta">
                        <span className="status-pill" style={{ borderColor: `${STATUS_TONE[application.status]}55`, color: STATUS_TONE[application.status] }}>
                          {application.status}
                        </span>
                        <small>{application.date}</small>
                        {application.url && (
                          <a href={application.url} target="_blank" rel="noopener noreferrer" className="link">
                            Offre <Icon name="external" size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="application-actions">
                    <div className="select-wrap compact">
                      <select
                        aria-label={`Statut de ${application.role}`}
                        value={application.status}
                        onChange={(e) => {
                          const next = e.target.value as ApplicationStatus
                          dispatch({ type: 'MOVE_APPLICATION', id: application.id, status: next })
                          notify(`Statut mis à jour : ${next}`)
                        }}
                      >
                        {APPLICATION_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="icon-btn danger"
                      aria-label={`Supprimer la candidature ${application.role}`}
                      onClick={() => {
                        dispatch({ type: 'DELETE_APPLICATION', id: application.id })
                        notify('Candidature supprimée.')
                      }}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'projects' && (
        <>
          <Card className="form-card">
            <h3>Nouveau projet</h3>
            <form className="net-form" onSubmit={addProject}>
              <label className="field">
                <span>Titre</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Application de tontine" />
              </label>
              <label className="field">
                <span>Besoin ou prochaine étape</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. Cherche un testeur à Cotonou" />
              </label>
              <Btn type="submit" full icon="sparkles">
                Créer le projet
              </Btn>
            </form>
          </Card>

          {projects.length === 0 ? (
            <EmptyState
              icon="kanban"
              title="Aucun projet enregistré"
              text="Vos idées restent dans le stockage local : ajoutez-en une et faites-la avancer d’étape en étape."
            />
          ) : (
            <div className="stack">
              {projects.map((project) => (
                <Card key={project.id} className="project-card">
                  <div className="project-head">
                    <h3>{project.title}</h3>
                    <button
                      type="button"
                      className="icon-btn danger"
                      aria-label={`Supprimer le projet ${project.title}`}
                      onClick={() => {
                        dispatch({ type: 'DELETE_PROJECT', id: project.id })
                        notify('Projet supprimé.')
                      }}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                  {project.note && <p>{project.note}</p>}
                  <small className="muted">Créé le {project.date}</small>
                  <div className="stage-chips">
                    {PROJECT_STAGES.map((stage: ProjectStage) => (
                      <button
                        key={stage}
                        type="button"
                        className={`chip ${project.stage === stage ? 'chip-active' : ''}`}
                        onClick={() => {
                          dispatch({ type: 'MOVE_PROJECT', id: project.id, stage })
                          notify(`Projet déplacé vers « ${PROJECT_STAGE_LABELS[stage]} ».`)
                        }}
                      >
                        {PROJECT_STAGE_LABELS[stage]}
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'boards' && (
        <>
          <Card className="board-note">
            <Icon name="info" size={16} />
            <p>
              AfricaSkills ne publie pas d’offres : ces plateformes le font, avec leurs propres procédures. Les liens
              ouvrent leur site officiel.
            </p>
          </Card>
          <div className="stack">
            {JOB_BOARDS.map((board) => (
              <a key={board.name} href={board.url} target="_blank" rel="noopener noreferrer" className="board-card">
                <span className="board-logo">
                  <Icon name="globe" size={18} />
                </span>
                <div>
                  <strong>{board.name}</strong>
                  <small>{board.region}</small>
                  <p>{board.description}</p>
                </div>
                <Icon name="external" size={15} />
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
