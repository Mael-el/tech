import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Btn, Card, Chip, EmptyState, Sheet } from '../components/ui'
import { allCards, domainById, seed, useApp } from '../store'
import { isDue, QUALITY_LABELS } from '../lib/sm2'
import type { Flashcard } from '../types'

export function FlashcardsScreen({ focusCardId }: { focusCardId: string | null }) {
  const { state, dispatch, notify } = useApp()
  const [filter, setFilter] = useState<string | null>(null)
  const [dueOnly, setDueOnly] = useState(false)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [speed, setSpeed] = useState(false)
  const [seconds, setSeconds] = useState(30)
  const [score, setScore] = useState(0)
  const [adding, setAdding] = useState(false)
  const timer = useRef<number | null>(null)
  const appliedFocus = useRef<string | null>(null)

  const cards = allCards(state)
  const deck = useMemo(
    () =>
      cards.filter(
        (c) =>
          (!filter || c.domainId === filter) &&
          (!dueOnly || isDue(state.cards[c.id])),
      ),
    // state.cards évolue à chaque révision pour refléter les échéances
    [cards, filter, dueOnly, state.cards],
  )

  const card: Flashcard | undefined = deck[Math.min(index, Math.max(0, deck.length - 1))]
  const cardState = card ? state.cards[card.id] : undefined
  const due = cards.filter((c) => isDue(state.cards[c.id])).length

  const domains = useMemo(
    () => seed.domains.filter((d) => cards.some((c) => c.domainId === d.id)),
    [cards],
  )

  useEffect(() => {
    if (!focusCardId || appliedFocus.current === focusCardId) return
    const position = deck.findIndex((c) => c.id === focusCardId)
    if (position >= 0) {
      setIndex(position)
      setFlipped(false)
      appliedFocus.current = focusCardId
    }
  }, [focusCardId, deck])

  useEffect(() => {
    if (!deck.length) setIndex(0)
    else if (index >= deck.length) setIndex(0)
  }, [deck.length, index])

  useEffect(() => {
    if (!speed) {
      if (timer.current) window.clearInterval(timer.current)
      return
    }
    timer.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(timer.current!)
          timer.current = null
          setSpeed(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [speed])

  useEffect(() => {
    if (!speed && seconds === 0) {
      notify(`Chrono terminé — Score : ${score} points`)
      setScore(0)
      setSeconds(30)
    }
  }, [speed, seconds, score, notify])

  const move = (direction: 1 | -1) => {
    setFlipped(false)
    setShowHint(false)
    setIndex((current) => {
      const size = deck.length
      if (!size) return 0
      return (current + direction + size) % size
    })
  }

  const review = (quality: number) => {
    if (!card) return
    dispatch({ type: 'REVIEW_CARD', cardId: card.id, quality })
    notify(`Révision enregistrée (+15 XP) · ${QUALITY_LABELS.find((q) => q.value === quality)?.label}`)
    if (dueOnly) {
      // La carte quitte le paquet « à réviser » : l'index courant pointe déjà sur la suivante.
      setFlipped(false)
      setShowHint(false)
    } else {
      move(1)
    }
  }

  const startSpeed = () => {
    setSpeed(true)
    setSeconds(30)
    setScore(0)
    setFlipped(false)
  }

  const answerSpeed = (ok: boolean) => {
    if (ok) {
      setScore((s) => s + 10)
      notify('+10 points')
    }
    move(1)
  }

  /* Raccourcis clavier : espace = retourner, flèches = naviguer, 1-4 = noter. */
  useEffect(() => {
    if (speed || adding) return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.key === ' ') {
        event.preventDefault()
        setFlipped((v) => !v)
      } else if (event.key === 'ArrowRight') {
        move(1)
      } else if (event.key === 'ArrowLeft') {
        move(-1)
      } else if (['1', '2', '3', '4'].includes(event.key) && flipped) {
        const quality = QUALITY_LABELS[Number(event.key) - 1]
        if (quality) review(quality.value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [speed, adding, flipped, deck.length, card?.id])

  const resetFilter = (value: string | null) => {
    setFilter(value)
    setIndex(0)
    setFlipped(false)
    setShowHint(false)
  }

  return (
    <div className="screen">
      <header className="screen-head">
        <div className="row-between">
          <h1>Révision</h1>
          <Btn variant="ghost" icon="sparkles" onClick={() => setAdding(true)}>
            Nouvelle carte
          </Btn>
        </div>
        <p>{due} carte{due > 1 ? 's' : ''} à réviser · {cards.length} au total · SM-2</p>
      </header>

      <div className="chip-row">
        <Chip label="Toutes" active={!filter} onClick={() => resetFilter(null)} />
        {domains.map((d) => (
          <Chip
            key={d.id}
            label={d.label}
            color={d.color}
            active={filter === d.id}
            onClick={() => resetFilter(filter === d.id ? null : d.id)}
          />
        ))}
        <Chip label={`À réviser (${due})`} active={dueOnly} icon="target" onClick={() => { setDueOnly((v) => !v); setIndex(0); setFlipped(false) }} />
      </div>

      {!card ? (
        <EmptyState
          icon="check"
          title={dueOnly ? 'Tout est révisé' : 'Aucune carte'}
          text={dueOnly ? 'Revenez demain : les intervalles SM-2 planifient vos prochaines révisions.' : 'Ajoutez une carte ou changez de domaine.'}
        />
      ) : speed ? (
        <Card className="speed-panel">
          <div className="speed-head">
            <span className="speed-timer"><Icon name="clock" size={16} /> {seconds} s</span>
            <span className="speed-score">Score {score}</span>
          </div>
          <div className="speed-card">
            <span className="eyebrow" style={{ color: domainById(card.domainId).color }}>{domainById(card.domainId).label}</span>
            <h3>{card.front}</h3>
          </div>
          <div className="speed-actions">
            <Btn variant="soft" full onClick={() => answerSpeed(false)}>Je ne savais pas</Btn>
            <Btn full onClick={() => answerSpeed(true)}>Je savais</Btn>
          </div>
          <button
            type="button"
            className="link center"
            onClick={() => {
              setSpeed(false)
              setSeconds(30)
              setScore(0)
            }}
          >
            Arrêter le mode éclair
          </button>
        </Card>
      ) : (
        <>
          <div className="deck-meta">
            <span>{index + 1} / {deck.length}</span>
            <div className="deck-actions">
              <button
                type="button"
                className={`icon-btn small ${state.favorites.cards.includes(card.id) ? 'fav-on' : ''}`}
                aria-label="Favori"
                onClick={() => dispatch({ type: 'TOGGLE_FAV_CARD', cardId: card.id })}
              >
                <Icon name="star" size={15} filled={state.favorites.cards.includes(card.id)} />
              </button>
              <button type="button" className="link" onClick={startSpeed}>
                <Icon name="live" size={14} /> Mode éclair 30 s
              </button>
            </div>
          </div>

          <div className="flip" onClick={() => setFlipped((v) => !v)}>
            <div className={`flip-inner ${flipped ? 'flipped' : ''}`}>
              <div className="flip-face flip-front">
                <span className="eyebrow" style={{ color: domainById(card.domainId).color }}>
                  {domainById(card.domainId).label}
                </span>
                <p className="flip-question">{card.front}</p>
                <span className="flip-hint-label">Appuyez ou espace pour retourner la carte</span>
                <button
                  type="button"
                  className="link"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowHint((v) => !v)
                  }}
                >
                  <Icon name="sparkles" size={14} /> {showHint ? 'Masquer' : 'Afficher'} l'indice
                </button>
                {showHint && <p className="hint-text">{card.hint}</p>}
              </div>
              <div className="flip-face flip-back">
                <span className="eyebrow">Réponse</span>
                <p className="flip-answer">{card.back}</p>
                <span className="flip-hint-label">Appuyez pour revenir à la question</span>
              </div>
            </div>
          </div>

          <div className="flip-nav">
            <button type="button" className="icon-btn" onClick={() => move(-1)} aria-label="Carte précédente">
              <Icon name="back" size={19} />
            </button>
            <span className="deck-dots">
              {deck.map((c, i) => (
                <i key={c.id} className={i === index ? 'on' : ''} />
              ))}
            </span>
            <button type="button" className="icon-btn" onClick={() => move(1)} aria-label="Carte suivante">
              <Icon name="next" size={19} />
            </button>
          </div>

          <p className="rate-label">Comment était cette carte ?</p>
          <div className="rate-grid">
            {QUALITY_LABELS.map((q) => (
              <button
                key={q.value}
                type="button"
                className="rate-btn"
                style={{ color: q.tone, borderColor: `${q.tone}44` }}
                onClick={() => review(q.value)}
              >
                {q.label}
                <small>+15 XP</small>
              </button>
            ))}
          </div>

          {cardState && (
            <Card className="sm2">
              <div className="sm2-item"><strong>{cardState.reps}</strong><span>répétitions</span></div>
              <div className="sm2-item"><strong>{cardState.ef.toFixed(2)}</strong><span>facteur</span></div>
              <div className="sm2-item"><strong>{cardState.interval} j</strong><span>intervalle</span></div>
              <p>Prochaine révision : {new Date(cardState.next).toLocaleDateString('fr-FR')}</p>
            </Card>
          )}

          {card.id.startsWith('cc_') && (
            <button
              type="button"
              className="link center danger-link"
              onClick={() => {
                dispatch({ type: 'DELETE_CARD', cardId: card.id })
                notify('Carte personnalisée supprimée.')
              }}
            >
              <Icon name="close" size={14} /> Supprimer cette carte personnalisée
            </button>
          )}
        </>
      )}

      <NewCardSheet open={adding} onClose={() => setAdding(false)} />
    </div>
  )
}

function NewCardSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch, notify } = useApp()
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [hint, setHint] = useState('')
  const [domainId, setDomainId] = useState(seed.domains[0].id)

  const submit = () => {
    if (front.trim().length < 5 || back.trim().length < 3) {
      notify('Renseignez une question et une réponse.', true)
      return
    }
    dispatch({
      type: 'ADD_CARD',
      card: {
        id: `cc_${Date.now()}`,
        domainId,
        front: front.trim(),
        back: back.trim(),
        hint: hint.trim() || 'Carte personnelle',
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 0,
      },
    })
    notify('Carte ajoutée au paquet.')
    setFront('')
    setBack('')
    setHint('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Nouvelle flashcard">
      <div className="form">
        <label className="field">
          <span>Question / recto</span>
          <textarea value={front} onChange={(e) => setFront(e.target.value)} rows={2} placeholder="Ex. Que garantit une clé d'idempotence ?" />
        </label>
        <label className="field">
          <span>Réponse / verso</span>
          <textarea value={back} onChange={(e) => setBack(e.target.value)} rows={2} placeholder="Réponse courte et précise" />
        </label>
        <label className="field">
          <span>Indice (optionnel)</span>
          <div className="input-wrap">
            <Icon name="sparkles" size={16} />
            <input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Un mot-clé pour vous aider" />
          </div>
        </label>
        <label className="field">
          <span>Domaine</span>
          <select value={domainId} onChange={(e) => setDomainId(e.target.value)} className="select">
            {seed.domains.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </label>
        <Btn full icon="check" onClick={submit}>Ajouter la carte</Btn>
      </div>
    </Sheet>
  )
}
