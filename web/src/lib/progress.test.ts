import { describe, expect, it } from 'vitest'
import {
  accuracy,
  activityWindow,
  canUnlock,
  computeStreak,
  dayForPoints,
  dayKey,
  recordXp,
} from './progress'

const at = (iso: string) => new Date(`${iso}T12:00:00`)

describe('série d’apprentissage', () => {
  it('compte les jours consécutifs jusqu’à aujourd’hui', () => {
    const today = at('2026-11-15')
    const activity = { '2026-11-15': 40, '2026-11-14': 20, '2026-11-13': 5 }
    expect(computeStreak(activity, today)).toBe(3)
  })

  it('tolère qu’aujourd’hui soit encore vide', () => {
    const today = at('2026-11-15')
    const activity = { '2026-11-14': 20, '2026-11-13': 5 }
    expect(computeStreak(activity, today)).toBe(2)
  })

  it('renvoie 0 après deux jours sans activité', () => {
    expect(computeStreak({ '2026-11-12': 50 }, at('2026-11-15'))).toBe(0)
  })

  it('ne compte pas une série qui commence demain', () => {
    expect(computeStreak({ '2026-11-16': 50, '2026-11-15': 40 }, at('2026-11-15'))).toBe(1)
  })
})

describe('activité quotidienne', () => {
  it('enregistre les XP du jour sans écraser les précédents', () => {
    const today = at('2026-11-15')
    const activity = recordXp(recordXp({}, 50, today), 15, today)
    expect(activity[dayKey(today)]).toBe(65)
  })

  it('retrouve le jour de franchissement d’un seuil de points', () => {
    const activity = { '2026-11-10': 200, '2026-11-12': 180, '2026-11-14': 250 }
    expect(dayForPoints(activity, 350)).toBe('2026-11-12')
    expect(dayForPoints(activity, 630)).toBe('2026-11-14')
    expect(dayForPoints(activity, 5000)).toBeNull()
  })

  it('construit une fenêtre glissante ordonnée', () => {
    const window = activityWindow({ '2026-11-15': 10 }, 7, at('2026-11-15'))
    expect(window).toHaveLength(7)
    expect(window[6].key).toBe('2026-11-15')
    expect(window[6].xp).toBe(10)
  })
})

describe('badges et précision', () => {
  const or = { name: 'OR', minPoints: 4000, minCourses: 15, requiredEnglish: 'B2' }

  it('exige XP, cours et niveau d’anglais', () => {
    expect(canUnlock(or, 4200, 16, 3)).toBe(true)
    expect(canUnlock(or, 4200, 14, 3)).toBe(false)
    expect(canUnlock(or, 4200, 16, 2)).toBe(false)
    expect(canUnlock(or, 3900, 16, 3)).toBe(false)
  })

  it('calcule la précision aux quiz', () => {
    expect(accuracy({ attempts: 24, correct: 19 })).toBe(79)
    expect(accuracy({ attempts: 0, correct: 0 })).toBe(0)
  })
})
