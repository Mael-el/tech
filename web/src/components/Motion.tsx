import React, { useEffect, useState } from 'react'
import { prefersReducedMotion, splitNumeric, useCountUp } from '../lib/motion'

/** Déclenche une pluie de confettis dans toute l'application. */
export function celebrate(kind: 'burst' | 'rain' = 'burst') {
  if (typeof window === 'undefined' || prefersReducedMotion()) return
  window.dispatchEvent(new CustomEvent('africaskills:celebrate', { detail: { kind } }))
}

const COLORS = ['#00D6A3', '#FFB020', '#8B5CF6', '#FF4D8D', '#38BDF8', '#FDE68A']

interface Piece {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  color: string
  rotate: number
  drift: number
  round: boolean
}

let seed = 0

function makePieces(kind: 'burst' | 'rain', count: number): Piece[] {
  return Array.from({ length: count }, (_, index) => {
    seed += 1
    const random = (offset: number) => {
      const value = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453
      return value - Math.floor(value)
    }
    return {
      id: seed,
      left: kind === 'burst' ? 50 + (random(1) - 0.5) * 22 : 4 + random(2) * 92,
      delay: kind === 'burst' ? random(3) * 0.18 : random(4) * 0.9,
      duration: 1.5 + random(5) * 1.3,
      size: 5 + random(6) * 7,
      color: COLORS[Math.floor(random(7) * COLORS.length)],
      rotate: random(8) * 360,
      drift: (random(9) - 0.5) * (kind === 'burst' ? 240 : 120),
      round: random(10) > 0.72,
    }
  })
}

export function ConfettiHost() {
  const [batches, setBatches] = useState<{ id: number; pieces: Piece[] }[]>([])

  useEffect(() => {
    const onCelebrate = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: 'burst' | 'rain' }>).detail
      const kind = detail?.kind ?? 'burst'
      const batch = { id: Date.now() + Math.random(), pieces: makePieces(kind, kind === 'rain' ? 30 : 18) }
      setBatches((current) => [...current.slice(-2), batch])
      window.setTimeout(() => setBatches((current) => current.filter((item) => item.id !== batch.id)), 3400)
    }
    window.addEventListener('africaskills:celebrate', onCelebrate)
    return () => window.removeEventListener('africaskills:celebrate', onCelebrate)
  }, [])

  if (batches.length === 0) return null

  return (
    <div className="confetti-host" aria-hidden="true">
      {batches.map((batch) => (
        <div key={batch.id} className="confetti-layer">
          {batch.pieces.map((piece) => (
            <span
              key={piece.id}
              className={`confetti-piece ${piece.round ? 'round' : ''}`}
              style={
                {
                  left: `${piece.left}%`,
                  width: piece.size,
                  height: piece.round ? piece.size : piece.size * 0.45,
                  background: piece.color,
                  animationDelay: `${piece.delay}s`,
                  animationDuration: `${piece.duration}s`,
                  '--rotate': `${piece.rotate}deg`,
                  '--drift': `${piece.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Affiche une valeur numérique en la faisant « rouler » jusqu'à sa valeur finale. */
export function AnimatedValue({
  value,
  duration = 900,
  className,
  delay = 0,
}: {
  value: string | number
  duration?: number
  className?: string
  delay?: number
}) {
  const text = typeof value === 'number' ? value.toLocaleString('fr-FR') : value
  const parts = splitNumeric(text)
  const animated = useCountUp(parts?.value ?? 0, duration, delay)

  if (!parts) return <>{text}</>

  return (
    <span className={className}>
      {parts.before}
      {animated.toLocaleString('fr-FR')}
      {parts.after}
    </span>
  )
}
