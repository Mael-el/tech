/**
 * Salle d'arcade : sélection quotidienne, scoring, XP et succès.
 * Toutes les fonctions sont pures (les jeux tirent leur aléatoire d'une graine).
 */
import arcadeJson from '../data/arcade.json'
import type { IconName } from '../components/Icon'
import { dayKey } from './progress'

export type GameId = 'quiz' | 'memory' | 'vf'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  answer: number
  explanation: string
  factId: string
}

export interface TrueFalseStatement {
  id: string
  statement: string
  answer: boolean
  explanation: string
  factId: string
}

export interface MemoryPair {
  id: string
  term: string
  match: string
  factId: string
}

interface ArcadeFile {
  quiz: QuizQuestion[]
  trueFalse: TrueFalseStatement[]
  memory: MemoryPair[]
}

const data = arcadeJson as unknown as ArcadeFile

export const quizPool = data.quiz
export const trueFalsePool = data.trueFalse
export const memoryPairs = data.memory

export const QUIZ_LENGTH = 10
export const VF_LENGTH = 8
export const MEMORY_PAIRS = 6

/** PRNG déterministe (mulberry32) : mêmes questions pour tout le monde le même jour. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** 10 questions du jour, tirées sans remise et stables sur la journée. */
export function dailyQuiz(date = new Date(), length = QUIZ_LENGTH): QuizQuestion[] {
  const random = seededRandom(hashString(`quiz:${dayKey(date)}`))
  return shuffle(quizPool, random).slice(0, Math.min(length, quizPool.length))
}

export function dailyTrueFalse(date = new Date(), length = VF_LENGTH): TrueFalseStatement[] {
  const random = seededRandom(hashString(`vf:${dayKey(date)}`))
  return shuffle(trueFalsePool, random).slice(0, Math.min(length, trueFalsePool.length))
}

export interface MemoryCard {
  key: string
  pairId: string
  label: string
  kind: 'term' | 'match'
  factId: string
}

/** Jeu de cartes mémoire : 2 × N cartes mélangées (aléatoire réel, rejouable). */
export function buildMemoryDeck(pairs = MEMORY_PAIRS, random: () => number = Math.random): MemoryCard[] {
  const chosen = shuffle(memoryPairs, random).slice(0, Math.min(pairs, memoryPairs.length))
  const cards: MemoryCard[] = []
  for (const pair of chosen) {
    cards.push({ key: `${pair.id}-t`, pairId: pair.id, label: pair.term, kind: 'term', factId: pair.factId })
    cards.push({ key: `${pair.id}-m`, pairId: pair.id, label: pair.match, kind: 'match', factId: pair.factId })
  }
  return shuffle(cards, random)
}

/* --------------------------- Récompenses ---------------------------- */

export function quizXp(correct: number): number {
  return 20 + 6 * Math.max(0, correct)
}

export function vfXp(correct: number): number {
  return 10 + 2 * Math.max(0, correct)
}

export function memoryXp(moves: number, pairs = MEMORY_PAIRS): number {
  return moves <= pairs + 4 ? 50 : 35
}

export const GAME_LABELS: Record<GameId, string> = {
  quiz: 'Défi éclair',
  vf: 'Vrai ou faux',
  memory: 'Mémoire tech',
}

export const GAME_DESCRIPTIONS: Record<GameId, string> = {
  quiz: '10 questions sur l’Afrique tech, chronométrées, avec la source après chaque réponse.',
  vf: '8 affirmations à trancher en 8 secondes. Attention aux pièges.',
  memory: '6 paires à retrouver : entreprises, pays, technologies. Moins de coups = plus de XP.',
}

/* --------------------------- Succès -------------------------------- */

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: IconName
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'premier_pas',
    title: 'Premier pas',
    description: 'Terminer une leçon.',
    icon: 'check',
  },
  {
    id: 'serie_7',
    title: 'Semaine solide',
    description: 'Atteindre une série de 7 jours.',
    icon: 'flame',
  },
  {
    id: 'sang_froid',
    title: 'Sang-froid',
    description: 'Réussir un sans-faute au Défi éclair (10/10).',
    icon: 'target',
  },
  {
    id: 'sans_faute',
    title: 'Œil de lynx',
    description: 'Réussir un sans-faute au Vrai ou faux.',
    icon: 'shield',
  },
  {
    id: 'memoire_de_fer',
    title: 'Mémoire de fer',
    description: 'Terminer une partie de Mémoire tech en 12 coups ou moins.',
    icon: 'cards',
  },
  {
    id: 'curieux',
    title: 'Curieux',
    description: 'Consulter 8 fiches chiffrées.',
    icon: 'bulb',
  },
  {
    id: 'explorateur',
    title: 'Explorateur',
    description: 'Démarrer 5 cours différents.',
    icon: 'globe',
  },
]

export interface AchievementInput {
  completedLessons: number
  streak: number
  quizBest: number
  vfBest: number
  memoryBestMoves: number
  factsRead: number
  coursesStarted: number
}

export function evaluateAchievements(input: AchievementInput): string[] {
  const unlocked: string[] = []
  if (input.completedLessons >= 1) unlocked.push('premier_pas')
  if (input.streak >= 7) unlocked.push('serie_7')
  if (input.quizBest >= QUIZ_LENGTH) unlocked.push('sang_froid')
  if (input.vfBest >= VF_LENGTH) unlocked.push('sans_faute')
  if (input.memoryBestMoves > 0 && input.memoryBestMoves <= 12) unlocked.push('memoire_de_fer')
  if (input.factsRead >= 8) unlocked.push('curieux')
  if (input.coursesStarted >= 5) unlocked.push('explorateur')
  return unlocked
}
