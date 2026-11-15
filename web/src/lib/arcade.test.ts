import { describe, expect, it } from 'vitest'
import {
  ACHIEVEMENTS,
  buildMemoryDeck,
  dailyQuiz,
  dailyTrueFalse,
  evaluateAchievements,
  hashString,
  memoryXp,
  quizXp,
  quizPool,
  seededRandom,
  shuffle,
  trueFalsePool,
  vfXp,
} from './arcade'
import { factById } from './facts'

describe('banque de questions', () => {
  it('propose 4 options distinctes et une bonne réponse valide', () => {
    expect(quizPool.length).toBeGreaterThanOrEqual(20)
    for (const question of quizPool) {
      expect(question.options, question.id).toHaveLength(4)
      expect(new Set(question.options).size, question.id).toBe(4)
      expect(question.answer, question.id).toBeGreaterThanOrEqual(0)
      expect(question.answer, question.id).toBeLessThan(4)
      expect(question.explanation.length, question.id).toBeGreaterThan(10)
    }
  })

  it('renvoie toujours à une fiche chiffrée existante', () => {
    for (const item of [...quizPool, ...trueFalsePool]) {
      expect(factById(item.factId), item.id).toBeDefined()
    }
  })

  it('tire 10 questions du jour, sans doublon et de façon stable', () => {
    const day = new Date('2026-11-15T12:00:00')
    const first = dailyQuiz(day)
    const second = dailyQuiz(day)
    expect(first).toHaveLength(10)
    expect(new Set(first.map((q) => q.id)).size).toBe(10)
    expect(first.map((q) => q.id)).toEqual(second.map((q) => q.id))
    expect(dailyQuiz(new Date('2026-11-16T12:00:00')).map((q) => q.id)).not.toEqual(first.map((q) => q.id))
  })

  it('tire 8 affirmations vrai/faux', () => {
    const items = dailyTrueFalse(new Date('2026-11-15T12:00:00'))
    expect(items).toHaveLength(8)
    expect(new Set(items.map((item) => item.id)).size).toBe(8)
  })
})

describe('mémoire', () => {
  it('construit 12 cartes appariées', () => {
    const deck = buildMemoryDeck(6, seededRandom(42))
    expect(deck).toHaveLength(12)
    const counts = new Map<string, number>()
    for (const card of deck) counts.set(card.pairId, (counts.get(card.pairId) ?? 0) + 1)
    expect([...counts.values()].every((count) => count === 2)).toBe(true)
    expect(new Set(deck.map((card) => card.key)).size).toBe(12)
  })

  it('est reproductible avec la même graine', () => {
    const a = buildMemoryDeck(6, seededRandom(7)).map((card) => card.key)
    const b = buildMemoryDeck(6, seededRandom(7)).map((card) => card.key)
    expect(a).toEqual(b)
  })

  it('mélange sans perdre d’éléments', () => {
    const source = [1, 2, 3, 4, 5]
    const mixed = shuffle(source, seededRandom(3))
    expect([...mixed].sort()).toEqual([...source].sort())
  })
})

describe('récompenses', () => {
  it('calcule les XP par jeu', () => {
    expect(quizXp(0)).toBe(20)
    expect(quizXp(10)).toBe(80)
    expect(vfXp(8)).toBe(26)
    expect(memoryXp(10, 6)).toBe(50)
    expect(memoryXp(20, 6)).toBe(35)
  })

  it('hache les chaînes de façon stable', () => {
    expect(hashString('2026-11-15')).toBe(hashString('2026-11-15'))
    expect(hashString('a')).not.toBe(hashString('b'))
  })
})

describe('succès', () => {
  const base = {
    completedLessons: 0,
    streak: 0,
    quizBest: 0,
    vfBest: 0,
    memoryBestMoves: 0,
    factsRead: 0,
    coursesStarted: 0,
  }

  it('débloque progressivement', () => {
    expect(evaluateAchievements(base)).toEqual([])
    expect(evaluateAchievements({ ...base, completedLessons: 1 })).toContain('premier_pas')
    expect(evaluateAchievements({ ...base, streak: 7 })).toContain('serie_7')
    expect(evaluateAchievements({ ...base, quizBest: 10 })).toContain('sang_froid')
    expect(evaluateAchievements({ ...base, vfBest: 8 })).toContain('sans_faute')
    expect(evaluateAchievements({ ...base, memoryBestMoves: 12 })).toContain('memoire_de_fer')
    expect(evaluateAchievements({ ...base, factsRead: 8 })).toContain('curieux')
    expect(evaluateAchievements({ ...base, coursesStarted: 5 })).toContain('explorateur')
  })

  it('ne débloque pas au hasard', () => {
    const almost = evaluateAchievements({ ...base, quizBest: 9, factsRead: 7, coursesStarted: 4, memoryBestMoves: 13 })
    expect(almost).toEqual([])
  })

  it('définit un succès unique par identifiant', () => {
    const ids = ACHIEVEMENTS.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const achievement of ACHIEVEMENTS) expect(achievement.description.length).toBeGreaterThan(5)
  })
})
