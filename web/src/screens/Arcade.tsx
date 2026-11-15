import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { Btn, Card, Progress } from '../components/ui'
import { arcadePlayedToday, arcadeXpPreview, streakOf, useApp } from '../store'
import {
  ACHIEVEMENTS,
  buildMemoryDeck,
  dailyQuiz,
  dailyTrueFalse,
  GAME_DESCRIPTIONS,
  GAME_LABELS,
  MEMORY_PAIRS,
  QUIZ_LENGTH,
  VF_LENGTH,
  type GameId,
  type MemoryCard,
} from '../lib/arcade'
import { factById } from '../lib/facts'

const QUIZ_TIME = 15
const VF_TIME = 8

const GAME_ICON: Record<GameId, IconName> = { quiz: 'bolt', memory: 'cards', vf: 'check' }
const GAME_COLOR: Record<GameId, string> = { quiz: '#EA580C', memory: '#7C3AED', vf: '#059669' }

/* ----------------------------- Confettis ----------------------------- */

function Confetti({ pieces = 38 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.4,
        size: 5 + Math.random() * 7,
        rotate: Math.round(Math.random() * 360),
        color: ['#2563EB', '#F59E0B', '#10B981', '#7C3AED', '#EF4444', '#0EA5E9'][i % 6],
      })),
    [pieces],
  )

  return (
    <div className="confetti" aria-hidden="true">
      {items.map((item, i) => (
        <i
          key={i}
          style={{
            left: `${item.left}%`,
            background: item.color,
            width: item.size,
            height: item.size * 1.7,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            transform: `rotate(${item.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}

/* ----------------------------- Résultat ------------------------------ */

function ResultCard({
  game,
  score,
  total,
  xp,
  moves,
  onReplay,
  onExit,
}: {
  game: GameId
  score: number
  total: number
  xp: number
  moves?: number
  onReplay: () => void
  onExit: () => void
}) {
  const ratio = total ? score / total : 0
  const perfect = game === 'memory' ? false : score === total
  const good = game === 'memory' ? (moves ?? 99) <= MEMORY_PAIRS + 4 : ratio >= 0.7
  const title = perfect ? 'Sans-faute !' : good ? 'Bien joué !' : 'On remet ça ?'
  const message =
    game === 'memory'
      ? `${moves} coups pour retrouver ${MEMORY_PAIRS} paires.`
      : `${score} bonnes réponses sur ${total}.`

  return (
    <div className="game-result">
      {good && <Confetti />}
      <div className={`result-emoji ${good ? 'win' : ''}`}>
        <Icon name={perfect ? 'trophy' : good ? 'sparkles' : 'refresh'} size={38} />
      </div>
      <span className="eyebrow">{GAME_LABELS[game]} · terminé</span>
      <h2>{title}</h2>
      <p className="muted">{message}</p>
      <div className="result-stats">
        <div>
          <strong>{game === 'memory' ? moves : `${score}/${total}`}</strong>
          <small>{game === 'memory' ? 'coups' : 'score'}</small>
        </div>
        <div>
          <strong className={xp > 0 ? 'xp-positive' : ''}>+{xp}</strong>
          <small>{xp > 0 ? 'XP gagnés' : 'déjà joué aujourd’hui'}</small>
        </div>
      </div>
      {xp === 0 && <p className="result-note">Partie d’entraînement : les XP du jour sont déjà acquis. Le score reste enregistré.</p>}
      <div className="result-actions">
        <Btn variant="soft" icon="refresh" onClick={onReplay}>Rejouer</Btn>
        <Btn icon="gamepad" onClick={onExit}>Salle d’arcade</Btn>
      </div>
    </div>
  )
}

/* ------------------------------- Quiz -------------------------------- */

function QuizGame({ onExit, onReplay }: { onExit: () => void; onReplay: () => void }) {
  const { state, dispatch } = useApp()
  const questions = useMemo(() => dailyQuiz(), [])
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [remaining, setRemaining] = useState(QUIZ_TIME)
  const [result, setResult] = useState<{ score: number; xp: number } | null>(null)
  const answeredRef = useRef(false)

  const question = questions[index]
  const fact = factById(question.factId)

  const choose = (value: number) => {
    if (answeredRef.current || result) return
    answeredRef.current = true
    const correct = value === question.answer
    setChosen(value)
    dispatch({ type: 'QUIZ_ANSWER', correct })
    if (correct) {
      setScore((value) => value + 1)
      setCombo((current) => {
        const next = current + 1
        setBestCombo((best) => Math.max(best, next))
        return next
      })
    } else {
      setCombo(0)
    }
  }

  const chooseRef = useRef(choose)
  chooseRef.current = choose

  useEffect(() => {
    if (chosen !== null || result) return
    answeredRef.current = false
    setRemaining(QUIZ_TIME)
    const start = Date.now()
    const timer = window.setInterval(() => {
      const left = Math.max(0, QUIZ_TIME - (Date.now() - start) / 1000)
      setRemaining(left)
      if (left <= 0) {
        window.clearInterval(timer)
        chooseRef.current(-1)
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [index, chosen, result])

  const next = () => {
    if (index + 1 >= questions.length) {
      const finalScore = score
      setResult({ score: finalScore, xp: arcadeXpPreview(state, 'quiz', finalScore, 0) })
      dispatch({ type: 'ARCADE_RESULT', game: 'quiz', score: finalScore, moves: 0 })
      return
    }
    setChosen(null)
    setIndex((value) => value + 1)
  }

  if (result) {
    return (
      <ResultCard
        game="quiz"
        score={result.score}
        total={questions.length}
        xp={result.xp}
        onReplay={onReplay}
        onExit={onExit}
      />
    )
  }

  return (
    <div className="game">
      <header className="game-head">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Quitter le jeu">
          <Icon name="back" size={18} />
        </button>
        <div className="game-progress">
          <span>Question {index + 1}/{questions.length}</span>
          <Progress value={((index + (chosen !== null ? 1 : 0)) / questions.length) * 100} />
        </div>
        {combo > 1 && <span className="combo-pill"><Icon name="flame" size={13} /> ×{combo}</span>}
      </header>

      <div className="timer-bar">
        <i
          style={{
            width: `${(remaining / QUIZ_TIME) * 100}%`,
            background: remaining < 5 ? 'var(--danger)' : 'var(--primary)',
          }}
        />
      </div>

      <Card className="quiz-card">
        <span className="eyebrow" style={{ color: GAME_COLOR.quiz }}>Défi éclair</span>
        <h2>{question.question}</h2>
        <div className="options">
          {question.options.map((option, i) => {
            const state_ = chosen === null ? '' : i === question.answer ? 'good' : i === chosen ? 'bad' : ''
            return (
              <button
                key={option}
                type="button"
                className={`option ${state_}`}
                disabled={chosen !== null}
                onClick={() => choose(i)}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span>{option}</span>
                {chosen !== null && i === question.answer && <Icon name="check" size={16} />}
              </button>
            )
          })}
        </div>

        {chosen !== null && (
          <div className={`feedback ${chosen === question.answer ? 'ok' : 'ko'}`}>
            <strong>
              {chosen === -1 ? 'Temps écoulé' : chosen === question.answer ? 'Bonne réponse' : 'Raté'}
            </strong>
            <p>{question.explanation}</p>
            {fact && (
              <a href={fact.source.url} target="_blank" rel="noreferrer" className="feedback-source">
                <Icon name="external" size={13} /> Source : {fact.source.name}
              </a>
            )}
            <Btn full icon="next" onClick={next}>
              {index + 1 >= questions.length ? 'Voir le résultat' : 'Question suivante'}
            </Btn>
          </div>
        )}
      </Card>
    </div>
  )
}

/* ---------------------------- Vrai ou faux --------------------------- */

function TrueFalseGame({ onExit, onReplay }: { onExit: () => void; onReplay: () => void }) {
  const { state, dispatch } = useApp()
  const statements = useMemo(() => dailyTrueFalse(), [])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [remaining, setRemaining] = useState(VF_TIME)
  const [result, setResult] = useState<{ score: number; xp: number } | null>(null)
  const answeredRef = useRef(false)

  const statement = statements[index]
  const fact = factById(statement.factId)

  const choose = (value: boolean) => {
    if (answeredRef.current || result) return
    answeredRef.current = true
    setAnswer(value)
    const correct = value === statement.answer
    dispatch({ type: 'QUIZ_ANSWER', correct })
    if (correct) setScore((value) => value + 1)
  }

  const chooseRef = useRef(choose)
  chooseRef.current = choose

  useEffect(() => {
    if (answer !== null || result) return
    answeredRef.current = false
    setRemaining(VF_TIME)
    const start = Date.now()
    const timer = window.setInterval(() => {
      const left = Math.max(0, VF_TIME - (Date.now() - start) / 1000)
      setRemaining(left)
      if (left <= 0) {
        window.clearInterval(timer)
        chooseRef.current(!statement.answer)
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [index, answer, result, statement.answer])

  const next = () => {
    if (index + 1 >= statements.length) {
      setResult({ score, xp: arcadeXpPreview(state, 'vf', score, 0) })
      dispatch({ type: 'ARCADE_RESULT', game: 'vf', score, moves: 0 })
      return
    }
    setAnswer(null)
    setIndex((value) => value + 1)
  }

  if (result) {
    return (
      <ResultCard
        game="vf"
        score={result.score}
        total={statements.length}
        xp={result.xp}
        onReplay={onReplay}
        onExit={onExit}
      />
    )
  }

  return (
    <div className="game">
      <header className="game-head">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Quitter le jeu">
          <Icon name="back" size={18} />
        </button>
        <div className="game-progress">
          <span>Affirmation {index + 1}/{statements.length}</span>
          <Progress value={((index + (answer !== null ? 1 : 0)) / statements.length) * 100} />
        </div>
        <span className="combo-pill"><Icon name="check" size={13} /> {score}</span>
      </header>

      <div className="timer-bar">
        <i
          style={{
            width: `${(remaining / VF_TIME) * 100}%`,
            background: remaining < 3 ? 'var(--danger)' : GAME_COLOR.vf,
          }}
        />
      </div>

      <Card className="vf-card">
        <span className="eyebrow" style={{ color: GAME_COLOR.vf }}>Vrai ou faux</span>
        <h2>{statement.statement}</h2>
        <div className="vf-actions">
          <button
            type="button"
            className={`vf-btn true ${answer === true ? (answer === statement.answer ? 'good' : 'bad') : ''}`}
            disabled={answer !== null}
            onClick={() => choose(true)}
          >
            <Icon name="check" size={20} /> Vrai
          </button>
          <button
            type="button"
            className={`vf-btn false ${answer === false ? (answer === statement.answer ? 'good' : 'bad') : ''}`}
            disabled={answer !== null}
            onClick={() => choose(false)}
          >
            <Icon name="close" size={20} /> Faux
          </button>
        </div>

        {answer !== null && (
          <div className={`feedback ${answer === statement.answer ? 'ok' : 'ko'}`}>
            <strong>
              {answer === statement.answer ? 'Bien vu' : 'Piège'} · la réponse est{' '}
              {statement.answer ? 'VRAI' : 'FAUX'}
            </strong>
            <p>{statement.explanation}</p>
            {fact && (
              <a href={fact.source.url} target="_blank" rel="noreferrer" className="feedback-source">
                <Icon name="external" size={13} /> Source : {fact.source.name}
              </a>
            )}
            <Btn full icon="next" onClick={next}>
              {index + 1 >= statements.length ? 'Voir le résultat' : 'Suivant'}
            </Btn>
          </div>
        )}
      </Card>
    </div>
  )
}

/* ------------------------------ Mémoire ------------------------------ */

function MemoryGame({ onExit, onReplay }: { onExit: () => void; onReplay: () => void }) {
  const { state, dispatch } = useApp()
  const [deck] = useState<MemoryCard[]>(() => buildMemoryDeck())
  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [lock, setLock] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<{ moves: number; xp: number } | null>(null)

  useEffect(() => {
    if (result) return
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [result])

  const finish = (finalMoves: number) => {
    setResult({ moves: finalMoves, xp: arcadeXpPreview(state, 'memory', 0, finalMoves) })
    dispatch({ type: 'ARCADE_RESULT', game: 'memory', score: 0, moves: finalMoves })
  }

  const flip = (card: MemoryCard) => {
    if (lock || result) return
    if (flipped.includes(card.key) || matched.includes(card.pairId)) return
    const next = [...flipped, card.key]
    setFlipped(next)
    if (next.length < 2) return

    const [first, second] = next.map((key) => deck.find((item) => item.key === key)!)
    const newMoves = moves + 1
    setMoves(newMoves)

    if (first.pairId === second.pairId) {
      const newMatched = [...matched, first.pairId]
      setMatched(newMatched)
      setFlipped([])
      if (newMatched.length === deck.length / 2) finish(newMoves)
    } else {
      setLock(true)
      window.setTimeout(() => {
        setFlipped([])
        setLock(false)
      }, 780)
    }
  }

  if (result) {
    return (
      <ResultCard
        game="memory"
        score={0}
        total={0}
        moves={result.moves}
        xp={result.xp}
        onReplay={onReplay}
        onExit={onExit}
      />
    )
  }

  return (
    <div className="game">
      <header className="game-head">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Quitter le jeu">
          <Icon name="back" size={18} />
        </button>
        <div className="game-progress">
          <span>{matched.length}/{deck.length / 2} paires · {moves} coups</span>
          <Progress value={(matched.length / (deck.length / 2)) * 100} />
        </div>
        <span className="combo-pill"><Icon name="clock" size={13} /> {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
      </header>

      <p className="game-hint">Retrouvez la bonne paire. Moins de coups, plus de XP.</p>

      <div className="memory-grid">
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.key)
          const isMatched = matched.includes(card.pairId)
          const visible = isFlipped || isMatched
          return (
            <button
              key={card.key}
              type="button"
              className={`memory-card ${visible ? 'visible' : ''} ${isMatched ? 'matched' : ''}`}
              onClick={() => flip(card)}
              aria-label={visible ? card.label : 'Carte cachée'}
            >
              {visible ? (
                <>
                  <span className="memory-label">{card.label}</span>
                  <small>{card.kind === 'term' ? 'nom' : 'correspondance'}</small>
                </>
              ) : (
                <Icon name="sparkles" size={20} />
              )}
            </button>
          )
        })}
      </div>

      <p className="game-legend">
        {MEMORY_PAIRS} paires : entreprises, pays et technologies réelles. Les fiches « Vrai » expliquent chaque terme.
      </p>
    </div>
  )
}

/* ------------------------------- Hub --------------------------------- */

function Hub({ onPlay, onFacts }: { onPlay: (game: GameId) => void; onFacts: () => void }) {
  const { state } = useApp()
  const streak = streakOf(state)
  const unlocked = state.arcade.achievements

  const games: GameId[] = ['quiz', 'vf', 'memory']
  const best = (game: GameId) =>
    game === 'quiz'
      ? state.arcade.best.quiz
        ? `${state.arcade.best.quiz}/${QUIZ_LENGTH}`
        : '—'
      : game === 'vf'
        ? state.arcade.best.vf
          ? `${state.arcade.best.vf}/${VF_LENGTH}`
          : '—'
        : state.arcade.best.memoryMoves
          ? `${state.arcade.best.memoryMoves} coups`
          : '—'

  return (
    <div className="arcade">
      <header className="arcade-hero">
        <div>
          <span className="eyebrow">Salle d&apos;arcade · chiffres réels</span>
          <h1>Joue avec de vrais chiffres</h1>
          <p>
            Trois mini-jeux sur l&apos;Afrique numérique. Chaque réponse renvoie à sa source : on s&apos;amuse
            et on apprend quelque chose de vrai.
          </p>
        </div>
        <div className="arcade-wallet">
          <span><Icon name="sparkles" size={14} /> {state.points.toLocaleString('fr-FR')} XP</span>
          <span><Icon name="flame" size={14} /> {streak} j</span>
        </div>
      </header>

      <div className="arcade-games">
        {games.map((game) => {
          const played = arcadePlayedToday(state, game)
          return (
            <Card key={game} className="arcade-card" style={{ borderTopColor: GAME_COLOR[game] }}>
              <div className="arcade-card-head">
                <span className="arcade-icon" style={{ background: `${GAME_COLOR[game]}1a`, color: GAME_COLOR[game] }}>
                  <Icon name={GAME_ICON[game]} size={20} />
                </span>
                <div>
                  <strong>{GAME_LABELS[game]}</strong>
                  <small>{GAME_DESCRIPTIONS[game]}</small>
                </div>
              </div>
              <div className="arcade-card-meta">
                <span className={`game-status ${played ? 'played' : 'ready'}`}>
                  {played ? 'Entraînement' : 'XP du jour disponible'}
                </span>
                <span className="arcade-best">Record : {best(game)}</span>
              </div>
              <Btn variant={played ? 'soft' : 'primary'} full icon="play" onClick={() => onPlay(game)}>
                {played ? 'Rejouer' : 'Jouer'}
              </Btn>
            </Card>
          )
        })}
      </div>

      <Card className="arcade-facts-cta" onClick={onFacts}>
        <span className="arcade-icon" style={{ background: 'rgba(29,78,216,0.12)', color: '#1D4ED8' }}>
          <Icon name="bulb" size={20} />
        </span>
        <div>
          <strong>D&apos;où viennent ces chiffres ?</strong>
          <small>
            {state.arcade.factsRead.length || 'Aucune'} fiche{state.arcade.factsRead.length > 1 ? 's' : ''} lue
            {state.arcade.factsRead.length > 1 ? 's' : ''} · sources UIT, GSMA, Banque mondiale, Google…
          </small>
        </div>
        <Icon name="next" size={16} />
      </Card>

      <section className="achievements">
        <div className="section-title">
          <h2>Succès</h2>
          <span className="muted small">{unlocked.length}/{ACHIEVEMENTS.length} débloqués · +25 XP chacun</span>
        </div>
        <div className="achievement-grid">
          {ACHIEVEMENTS.map((achievement) => {
            const got = unlocked.includes(achievement.id)
            return (
              <div key={achievement.id} className={`achievement ${got ? 'unlocked' : ''}`}>
                <span className="achievement-icon">
                  <Icon name={achievement.icon} size={18} />
                </span>
                <strong>{achievement.title}</strong>
                <small>{achievement.description}</small>
                {got && <span className="achievement-check"><Icon name="check" size={12} /></span>}
              </div>
            )
          })}
        </div>
      </section>

      <p className="arcade-note">
        <Icon name="info" size={13} /> Les XP d&apos;un jeu ne sont crédités qu&apos;une fois par jour ; les
        parties suivantes restent des entraînements notés.
      </p>
    </div>
  )
}

/* ------------------------------ Écran ------------------------------- */

export function ArcadeScreen({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [mode, setMode] = useState<GameId | 'hub'>('hub')
  const [runKey, setRunKey] = useState(0)

  // Revenir explicitement sur #/arcade (palette, barre du haut) quitte la partie en cours.
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#/arcade') setMode('hub')
    }
    const onReset = () => setMode('hub')
    window.addEventListener('hashchange', onHash)
    window.addEventListener('arcade:reset', onReset)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('arcade:reset', onReset)
    }
  }, [])

  const play = (game: GameId) => {
    setRunKey((value) => value + 1)
    setMode(game)
  }

  const exit = () => setMode('hub')

  const replay = () => setRunKey((value) => value + 1)

  if (mode === 'quiz') return <QuizGame key={runKey} onExit={exit} onReplay={replay} />
  if (mode === 'vf') return <TrueFalseGame key={runKey} onExit={exit} onReplay={replay} />
  if (mode === 'memory') return <MemoryGame key={runKey} onExit={exit} onReplay={replay} />

  return <Hub onPlay={play} onFacts={() => onNavigate('#/infos')} />
}
