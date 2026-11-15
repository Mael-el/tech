import { describe, expect, it } from 'vitest'
import { initialMemory, isDue, reviewMemory } from './sm2'

const DAY = 86_400_000

describe('SM-2', () => {
  it('démarre depuis la carte seed', () => {
    const memory = initialMemory({ easeFactor: 2.5, intervalDays: 1, repetitions: 0 }, 1_000)
    expect(memory).toEqual({ ef: 2.5, interval: 1, reps: 0, next: 1_000 })
    expect(isDue(memory, 2_000)).toBe(true)
  })

  it('enchaîne 1 jour, 6 jours puis intervalle × facteur', () => {
    let memory = initialMemory({ easeFactor: 2.5, intervalDays: 1, repetitions: 0 }, 0)
    memory = reviewMemory(memory, 5, 0)
    expect(memory.reps).toBe(1)
    expect(memory.interval).toBe(1)
    expect(memory.ef).toBeCloseTo(2.6, 5)

    memory = reviewMemory(memory, 5, 0)
    expect(memory.reps).toBe(2)
    expect(memory.interval).toBe(6)

    memory = reviewMemory(memory, 5, 0)
    expect(memory.reps).toBe(3)
    expect(memory.interval).toBe(Math.round(6 * memory.ef))
    expect(memory.next).toBe(memory.interval * DAY)
  })

  it('réinitialise la répétition sous la note 3', () => {
    let memory = initialMemory({ easeFactor: 2.5, intervalDays: 12, repetitions: 4 }, 0)
    memory = reviewMemory(memory, 0, 0)
    expect(memory.reps).toBe(0)
    expect(memory.interval).toBe(1)
    expect(memory.ef).toBeCloseTo(1.7, 5)
  })

  it('borne le facteur de facilité à 1,3', () => {
    let memory = initialMemory({ easeFactor: 2.5, intervalDays: 3, repetitions: 2 }, 0)
    for (let i = 0; i < 10; i += 1) memory = reviewMemory(memory, 0, 0)
    expect(memory.ef).toBeGreaterThanOrEqual(1.3)
    expect(memory.ef).toBeLessThan(1.31)
  })
})
