import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Btn, Card, Chip } from '../components/ui'
import { useApp } from '../store'
import {
  allSources,
  factThemes,
  facts,
  factsByTheme,
  freeResources,
  methodology,
  themeById,
  verifiedAt,
} from '../lib/facts'
import { formatDateFR } from '../lib/format'

function FactCard({
  fact,
  expanded,
  onToggle,
}: {
  fact: (typeof facts)[number]
  expanded: boolean
  onToggle: () => void
}) {
  const theme = themeById(fact.theme)
  const { notify } = useApp()

  return (
    <article className={`fact-card ${expanded ? 'open' : ''}`} style={{ borderLeftColor: theme.color }}>
      <button type="button" className="fact-head" onClick={onToggle} aria-expanded={expanded}>
        <span className="fact-stat" style={{ color: theme.color }}>{fact.stat}</span>
        <span className="fact-copy">
          <strong>{fact.title}</strong>
          <small>
            {theme.label} · {fact.source.name.split('—')[0].trim()}
          </small>
        </span>
        <Icon name={expanded ? 'chevron' : 'next'} size={16} />
      </button>

      {expanded && (
        <div className="fact-body">
          <p>{fact.detail}</p>
          <div className="fact-source">
            <a href={fact.source.url} target="_blank" rel="noreferrer">
              <Icon name="external" size={14} />
              {fact.source.name}
            </a>
            <span className="fact-source-date">{fact.source.date}</span>
            <button
              type="button"
              className="link"
              onClick={() => {
                navigator.clipboard?.writeText(fact.source.url)
                notify('Lien de la source copié.')
              }}
            >
              Copier
            </button>
          </div>
          <p className="fact-verified">
            <Icon name="shield" size={13} /> Fiche vérifiée le {formatDateFR(new Date(`${verifiedAt}T12:00:00`))}
          </p>
        </div>
      )}
    </article>
  )
}

export function FactsScreen({ factId, onNavigate }: { factId?: string; onNavigate: (path: string) => void }) {
  const { state, dispatch } = useApp()
  const [theme, setTheme] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(factId ?? null)

  useEffect(() => {
    if (!factId) return
    setExpanded(factId)
    dispatch({ type: 'FACT_READ', factId })
    const timer = window.setTimeout(() => {
      document.getElementById(`fact-${factId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [factId, dispatch])

  const visible = useMemo(() => factsByTheme(theme), [theme])
  const sources = useMemo(() => allSources(), [])
  const read = state.arcade.factsRead.length

  const toggle = (id: string) => {
    setExpanded((current) => (current === id ? null : id))
    dispatch({ type: 'FACT_READ', factId: id })
  }

  return (
    <div className="screen facts">
      <header className="facts-head">
        <span className="eyebrow">Chiffres réels · sources citées</span>
        <h1>Vrai &amp; vérifié</h1>
        <p className="muted">
          {facts.length} chiffres publics sur l&apos;Afrique numérique, chacun avec sa source et sa date.
          Rien d&apos;inventé : vous pouvez tout vérifier en un clic.
        </p>
        <div className="facts-badges">
          <span className="fact-pill"><Icon name="shield" size={13} /> Vérifié le {formatDateFR(new Date(`${verifiedAt}T12:00:00`))}</span>
          <span className="fact-pill"><Icon name="globe" size={13} /> {sources.length} sources</span>
          <span className="fact-pill"><Icon name="bulb" size={13} /> {read}/{facts.length} lues</span>
        </div>
      </header>

      <Card className="facts-howto">
        <strong><Icon name="info" size={15} /> Comment c&apos;est vérifié</strong>
        <p>{methodology}</p>
      </Card>

      <div className="chip-row">
        <Chip label="Tous" active={theme === null} onClick={() => setTheme(null)} />
        {factThemes.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            color={item.color}
            active={theme === item.id}
            onClick={() => setTheme(item.id)}
          />
        ))}
      </div>

      <div className="fact-list">
        {visible.map((fact) => (
          <div key={fact.id} id={`fact-${fact.id}`}>
            <FactCard fact={fact} expanded={expanded === fact.id} onToggle={() => toggle(fact.id)} />
          </div>
        ))}
      </div>

      <Btn full icon="gamepad" onClick={() => onNavigate('#/arcade')}>
        Tester ces chiffres dans le Défi éclair
      </Btn>

      <section className="section-block">
        <div className="section-title">
          <h2>Ressources gratuites vérifiées</h2>
          <span className="muted small">{freeResources.length} programmes ouverts</span>
        </div>
        <div className="resource-list">
          {freeResources.map((resource) => (
            <a
              key={resource.id}
              className="resource-card"
              href={resource.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="resource-icon"><Icon name="external" size={16} /></span>
              <span className="resource-copy">
                <strong>{resource.name}</strong>
                <small>{resource.description}</small>
              </span>
              <span className="resource-kind">{resource.kind}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <h2>Sources</h2>
          <span className="muted small">Toutes consultables</span>
        </div>
        <ol className="source-list">
          {sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.name} <Icon name="external" size={12} />
              </a>
              <span>{source.date}</span>
            </li>
          ))}
        </ol>
      </section>

      <Card className="disclaimer-card">
        <strong><Icon name="info" size={15} /> Sources et méthode</strong>
        <p>
          Chaque chiffre de cet écran est réel et renvoie à sa source primaire, consultée en novembre 2026. Les cours
          et flashcards viennent du catalogue AfricaSkills. Aucune offre d&apos;emploi n&apos;est publiée par
          l&apos;application : le suivi de candidatures renvoie aux job boards africains.
        </p>
      </Card>
    </div>
  )
}
