import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Btn, Card, Chip, EmptyState } from '../components/ui'
import { domainById, seed, useApp } from '../store'

const QUALITY: { value: number; label: string; tone: string }[] = [
  { value: 0, label: 'À revoir', tone: '#DC2626' },
  { value: 2, label: 'Difficile', tone: '#D97706' },
  { value: 4, label: 'Bien', tone: '#0284C7' },
  { value: 5, label: 'Facile', tone: '#059669' },
]

export function FlashcardsScreen() {
  const { state, dispatch, notify } = useApp()
  const [filter, setFilter] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const [speed, setSpeed] = useState(false)
  const [seconds, setSeconds] = useState(30)
  const [score, setScore] = useState(0)
  const timer = useRef<number | null>(null)

  const deck = useMemo(
    () => seed.flashcards.filter((c) => !filter || c.domainId === filter),
    [filter],
  )
  const card = deck[index % Math.max(1, deck.length)]
  const cardState = card ? state.cards[card.id] : null
  const due = deck.filter((c) => {
    const s = state.cards[c.id]
    return !s || s.next <= Date.now()
  }).length

  const domains = useMemo(
    () => seed.domains.filter((d) => seed.flashcards.some((c) => c.domainId === d.id)),
    [],
  )

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

  const move = (dir: 1 | -1) => {
    setFlipped(false)
    setShowHint(false)
    setIndex((i) => {
      const size = deck.length
      if (!size) return 0
      return (i + dir + size) % size
    })
  }

  const review = (quality: number) => {
    if (!card) return
    dispatch({ type: 'REVIEW_CARD', cardId: card.id, quality })
    notify(`Révision enregistrée (+15 XP) · ${QUALITY.find((q) => q.value === quality)?.label}`)
    move(1)
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

  const resetFilter = (value: string | null) => {
    setFilter(value)
    setIndex(0)
    setFlipped(false)
    setShowHint(false)
  }

  if (!card) {
    return (
      <div className="screen">
        <header className="screen-head">
          <h1>Révision</h1>
          <p>Répétition espacée SM-2</p>
        </header>
        <EmptyState icon="cards" title="Aucune carte" text="Ce domaine ne contient pas encore de flashcards." />
      </div>
    )
  }

  const domain = domainById(card.domainId)

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Révision</h1>
        <p>{due} carte{due > 1 ? 's' : ''} à réviser aujourd’hui · algorithme SM-2</p>
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
      </div>

      {speed ? (
        <Card className="speed-panel">
          <div className="speed-head">
            <span className="speed-timer"><Icon name="clock" size={16} /> {seconds} s</span>
            <span className="speed-score">Score {score}</span>
          </div>
          <div className="speed-card">
            <span className="eyebrow" style={{ color: domain.color }}>{domain.label}</span>
            <h3>{card.front}</h3>
          </div>
          <div className="speed-actions">
            <Btn variant="soft" full onClick={() => answerSpeed(false)}>
              Je ne savais pas
            </Btn>
            <Btn full onClick={() => answerSpeed(true)}>
              Je savais
            </Btn>
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
            <button type="button" className="link" onClick={startSpeed}>
              <Icon name="live" size={14} /> Mode éclair 30 s
            </button>
          </div>

          <div className="flip" onClick={() => setFlipped((v) => !v)}>
            <div className={`flip-inner ${flipped ? 'flipped' : ''}`}>
              <div className="flip-face flip-front">
                <span className="eyebrow" style={{ color: domain.color }}>{domain.label}</span>
                <p className="flip-question">{card.front}</p>
                <span className="flip-hint-label">Appuyez pour retourner la carte</span>
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
            {QUALITY.map((q) => (
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
        </>
      )}
    </div>
  )
}
