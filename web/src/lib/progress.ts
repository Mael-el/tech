/**
 * Progression, séries d'apprentissage et paliers de badges.
 * Fonctions pures, testables indépendamment de React.
 */

export const ENGLISH_RANK: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 }

export interface TierRules {
  name: string
  minPoints: number
  minCourses: number
  requiredEnglish: string
}

export function englishRank(level: string): number {
  const key = level.trim().slice(0, 2).toUpperCase()
  return ENGLISH_RANK[key] ?? 0
}

/** Clé locale au format AAAA-MM-JJ (pas de décalage UTC). */
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

/** Jour (clé locale) où le cumul d'XP franchit `target`, ou null si le seuil n'est jamais atteint. */
export function dayForPoints(activity: Record<string, number>, target: number): string | null {
  const days = Object.keys(activity).sort()
  let total = 0
  for (const key of days) {
    total += activity[key] ?? 0
    if (total >= target) return key
  }
  return null
}

/** Série de jours consécutifs avec au moins 1 XP, se terminant aujourd'hui ou hier. */
export function computeStreak(activity: Record<string, number>, today = new Date()): number {
  let cursor = new Date(today)
  if (!(activity[dayKey(cursor)] > 0)) {
    cursor = addDays(cursor, -1)
    if (!(activity[dayKey(cursor)] > 0)) return 0
  }
  let streak = 0
  while (activity[dayKey(cursor)] > 0) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function recordXp(activity: Record<string, number>, xp: number, today = new Date()): Record<string, number> {
  if (xp <= 0) return activity
  const key = dayKey(today)
  return { ...activity, [key]: (activity[key] ?? 0) + xp }
}

export function xpToday(activity: Record<string, number>, today = new Date()): number {
  return activity[dayKey(today)] ?? 0
}

export function activityWindow(
  activity: Record<string, number>,
  days: number,
  today = new Date(),
): { key: string; xp: number; label: string }[] {
  const out: { key: string; xp: number; label: string }[] = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset)
    const key = dayKey(date)
    out.push({
      key,
      xp: activity[key] ?? 0,
      label: new Intl.DateTimeFormat('fr-FR', { weekday: 'narrow' }).format(date),
    })
  }
  return out
}

export function canUnlock(
  tier: TierRules,
  points: number,
  courses: number,
  english: number,
): boolean {
  return (
    points >= tier.minPoints &&
    courses >= tier.minCourses &&
    english >= (ENGLISH_RANK[tier.requiredEnglish] ?? 0)
  )
}

export function accuracy(quiz: { attempts: number; correct: number }): number {
  if (!quiz.attempts) return 0
  return Math.round((quiz.correct / quiz.attempts) * 100)
}

export function totalXp(activity: Record<string, number>): number {
  return Object.values(activity).reduce((sum, value) => sum + value, 0)
}
