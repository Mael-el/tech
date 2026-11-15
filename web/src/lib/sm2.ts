/**
 * Algorithme de répétition espacée SM-2 (SuperMemo 2).
 * Reproduit exactement la logique de `AfricaSkillsRepository.processFlashcardReview`
 * côté Android : facteur de facilité borné à 1,3, intervalles 1 / 6 / précédent × EF.
 */

export interface CardMemory {
  ef: number
  interval: number
  reps: number
  next: number
}

export interface CardSeed {
  easeFactor: number
  intervalDays: number
  repetitions: number
}

export const QUALITY_LABELS = [
  { value: 0, label: 'À revoir', tone: '#DC2626' },
  { value: 2, label: 'Difficile', tone: '#D97706' },
  { value: 4, label: 'Bien', tone: '#0284C7' },
  { value: 5, label: 'Facile', tone: '#059669' },
] as const

const DAY_MS = 86_400_000

export function initialMemory(card: CardSeed, now = Date.now()): CardMemory {
  return {
    ef: card.easeFactor,
    interval: card.intervalDays,
    reps: card.repetitions,
    next: now,
  }
}

export function reviewMemory(current: CardMemory, quality: number, now = Date.now()): CardMemory {
  const q = Math.max(0, Math.min(5, Math.round(quality)))
  const ef = Math.max(1.3, current.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))

  let reps: number
  let interval: number
  if (q < 3) {
    reps = 0
    interval = 1
  } else {
    reps = current.reps + 1
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.max(1, Math.round(current.interval * ef))
  }

  return { ef, interval, reps, next: now + interval * DAY_MS }
}

export function isDue(memory: CardMemory | undefined, now = Date.now()): boolean {
  return !memory || memory.next <= now
}

export function dueCount(cards: { id: string }[], memories: Record<string, CardMemory>, now = Date.now()): number {
  return cards.filter((card) => isDue(memories[card.id], now)).length
}
