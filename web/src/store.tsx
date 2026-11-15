import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import seedJson from './data/seed.json'
import type { Account, Flashcard, Message, Seed } from './types'
import {
  computeStreak,
  dayKey,
  englishRank,
  recordXp,
  seedActivity,
} from './lib/progress'
import { initialMemory, reviewMemory, type CardMemory } from './lib/sm2'
import { formatFcfa } from './lib/format'
import {
  evaluateAchievements,
  memoryXp,
  quizXp,
  vfXp,
  type GameId,
} from './lib/arcade'

export const seed = seedJson as unknown as Seed

export type { CardMemory }
export type { GameId }

/* ------------------------------------------------------------------ */
/*  Constantes de démonstration (identiques à l'app Android)          */
/* ------------------------------------------------------------------ */

export const DEMO_EMAIL = seed.profile.email
export const DEMO_PASSWORD = 'Africa2026'
export const STORAGE_KEY = 'africaskills.preview.v2'
const LEGACY_KEY = 'africaskills.preview.v1'
const ACCOUNTS_KEY = 'africaskills.preview.accounts'

export const ENGLISH_RANK: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 }

/* ------------------------------------------------------------------ */
/*  État persistant                                                   */
/* ------------------------------------------------------------------ */

export type CardState = CardMemory

export interface QuizStats {
  attempts: number
  correct: number
}

export interface ArcadeState {
  best: { quiz: number; vf: number; memoryMoves: number }
  plays: { quiz: string | null; vf: string | null; memory: string | null }
  achievements: string[]
  factsRead: string[]
}

export interface Persist {
  version: number
  account: Account | null
  points: number
  streakBase: number
  extraCourses: number
  enrolled: string[]
  progress: Record<string, number>
  completedLessons: string[]
  cards: Record<string, CardMemory>
  badges: Record<string, string | null>
  attestations: Record<string, { method: string; date: string }>
  appliedJobs: string[]
  projectStatus: Record<string, string>
  messages: Message[]
  theme: 'light' | 'dark'
  dailyGoal: number
  activity: Record<string, number>
  notes: Record<string, string>
  favorites: { courses: string[]; cards: string[] }
  customCards: Flashcard[]
  quiz: QuizStats
  arcade: ArcadeState
}

const today = () =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

export function initialState(): Persist {
  return {
    version: 2,
    account: null,
    points: seed.profile.points,
    streakBase: seed.profile.streakDays,
    extraCourses: 0,
    enrolled: seed.courses.filter((c) => c.isEnrolled).map((c) => c.id),
    progress: Object.fromEntries(seed.courses.map((c) => [c.id, c.progressPercent])),
    completedLessons: seed.lessons.filter((l) => l.isCompleted).map((l) => l.id),
    cards: Object.fromEntries(seed.flashcards.map((c) => [c.id, initialMemory(c)])),
    badges: Object.fromEntries(seed.badges.map((b) => [b.id, b.isUnlocked ? b.unlockedDate : null])),
    attestations: Object.fromEntries(
      seed.attestations
        .filter((a) => a.isPaid)
        .map((a) => [a.id, { method: a.paymentMethod ?? 'Mobile Money', date: a.issueDate }]),
    ),
    appliedJobs: seed.jobs.filter((j) => j.isApplied).map((j) => j.id),
    projectStatus: Object.fromEntries(seed.projects.map((p) => [p.id, p.status])),
    messages: seed.messages,
    theme: 'light',
    dailyGoal: 60,
    activity: seedActivity(seed.profile.points),
    notes: {},
    favorites: { courses: [], cards: [] },
    customCards: [],
    quiz: { attempts: 24, correct: 19 },
    arcade: { best: { quiz: 0, vf: 0, memoryMoves: 0 }, plays: { quiz: null, vf: null, memory: null }, achievements: [], factsRead: [] },
  }
}

function normalizeArcade(value: Partial<ArcadeState> | undefined): ArcadeState {
  const base = initialState().arcade
  if (!value) return base
  return {
    best: { ...base.best, ...(value.best ?? {}) },
    plays: { ...base.plays, ...(value.plays ?? {}) },
    achievements: Array.isArray(value.achievements) ? value.achievements : [],
    factsRead: Array.isArray(value.factsRead) ? value.factsRead : [],
  }
}

/** Migration explicite depuis l'aperçu v1 (progression conservée). */
function migrateV1(raw: string): Persist | null {
  try {
    const old = JSON.parse(raw) as Partial<Persist>
    const base = initialState()
    return {
      ...base,
      account: old.account ?? base.account,
      points: old.points ?? base.points,
      extraCourses: old.extraCourses ?? 0,
      enrolled: old.enrolled ?? base.enrolled,
      progress: old.progress ?? base.progress,
      completedLessons: old.completedLessons ?? base.completedLessons,
      cards: old.cards ?? base.cards,
      badges: old.badges ?? base.badges,
      attestations: old.attestations ?? base.attestations,
      appliedJobs: old.appliedJobs ?? base.appliedJobs,
      projectStatus: old.projectStatus ?? base.projectStatus,
      messages: old.messages ?? base.messages,
      theme: old.theme ?? 'light',
      arcade: normalizeArcade(old.arcade),
      version: 2,
    }
  } catch {
    return null
  }
}

export function loadState(): Persist {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Persist>
      return { ...initialState(), ...parsed, arcade: normalizeArcade(parsed.arcade), version: 2 }
    }
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const migrated = migrateV1(legacy)
      if (migrated) {
        localStorage.removeItem(LEGACY_KEY)
        return migrated
      }
    }
  } catch {
    /* stockage indisponible : on repart de la démo */
  }
  return initialState()
}

/* ------------------------------------------------------------------ */
/*  Badges                                                            */
/* ------------------------------------------------------------------ */

export function currentEnglishRank(): number {
  return englishRank(seed.profile.englishLevel)
}

export function coursesCompleted(state: Persist): number {
  return seed.profile.completedCoursesCount + state.extraCourses
}

export function tierIsUnlocked(state: Persist, tierName: string): boolean {
  const badge = seed.badges.find((b) => b.tier === tierName)
  return Boolean(badge && state.badges[badge.id])
}

export function unlockedTiers(state: Persist) {
  return seed.tiers.filter((t) => tierIsUnlocked(state, t.name))
}

export function currentTier(state: Persist) {
  const unlocked = unlockedTiers(state)
  return unlocked.length ? unlocked[unlocked.length - 1] : null
}

export function nextTier(state: Persist) {
  return seed.tiers[unlockedTiers(state).length] ?? null
}

function withBadges(state: Persist): Persist {
  const rank = currentEnglishRank()
  const done = coursesCompleted(state)
  const badges = { ...state.badges }
  let changed = false
  for (const tier of seed.tiers) {
    const badge = seed.badges.find((b) => b.tier === tier.name)
    if (!badge || badges[badge.id]) continue
    if (state.points >= tier.minPoints && done >= tier.minCourses && rank >= (ENGLISH_RANK[tier.requiredEnglish] ?? 0)) {
      badges[badge.id] = today()
      changed = true
    }
  }
  return changed ? { ...state, badges } : state
}

export function streakOf(state: Persist): number {
  return computeStreak(state.activity)
}

/** Débloque les succès atteints et crédite 25 XP par nouveau succès. */
function withAchievements(state: Persist): Persist {
  const unlocked = evaluateAchievements({
    completedLessons: state.completedLessons.length,
    streak: streakOf(state),
    quizBest: state.arcade.best.quiz,
    vfBest: state.arcade.best.vf,
    memoryBestMoves: state.arcade.best.memoryMoves,
    factsRead: state.arcade.factsRead.length,
    coursesStarted: Object.values(state.progress).filter((value) => value > 0).length,
  })
  const fresh = unlocked.filter((id) => !state.arcade.achievements.includes(id))
  if (fresh.length === 0) return state
  const gained = fresh.length * 25
  return withBadges({
    ...state,
    points: state.points + gained,
    activity: recordXp(state.activity, gained),
    arcade: { ...state.arcade, achievements: [...state.arcade.achievements, ...fresh] },
  })
}

export function todayXp(state: Persist): number {
  return state.activity[dayKey(new Date())] ?? 0
}

/* ------------------------------------------------------------------ */
/*  Cartes                                                            */
/* ------------------------------------------------------------------ */

export function allCards(state: Persist): Flashcard[] {
  return [...seed.flashcards, ...state.customCards]
}

/* ------------------------------------------------------------------ */
/*  Actions                                                           */
/* ------------------------------------------------------------------ */

type Action =
  | { type: 'LOGIN'; account: Account }
  | { type: 'LOGOUT' }
  | { type: 'THEME'; theme: 'light' | 'dark' }
  | { type: 'ENROLL'; courseId: string }
  | { type: 'COMPLETE_LESSON'; lessonId: string; courseId: string }
  | { type: 'QUIZ_ANSWER'; correct: boolean }
  | { type: 'REVIEW_CARD'; cardId: string; quality: number }
  | { type: 'PAY'; attestationId: string; method: string }
  | { type: 'APPLY'; jobId: string }
  | { type: 'MOVE_PROJECT'; projectId: string; status: string }
  | { type: 'SEND_MESSAGE'; domainId: string; text: string; author: string }
  | { type: 'UPDATE_PROFILE'; patch: Partial<Account> }
  | { type: 'SET_NOTE'; lessonId: string; text: string }
  | { type: 'TOGGLE_FAV_COURSE'; courseId: string }
  | { type: 'TOGGLE_FAV_CARD'; cardId: string }
  | { type: 'ADD_CARD'; card: Flashcard }
  | { type: 'DELETE_CARD'; cardId: string }
  | { type: 'SET_GOAL'; goal: number }
  | { type: 'ARCADE_RESULT'; game: GameId; score: number; moves: number }
  | { type: 'FACT_READ'; factId: string }
  | { type: 'IMPORT'; state: Persist }
  | { type: 'RESET' }

function baseReducer(state: Persist, action: Action): Persist {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, account: action.account }

    case 'LOGOUT':
      return { ...state, account: null }

    case 'THEME':
      return { ...state, theme: action.theme }

    case 'ENROLL':
      if (state.enrolled.includes(action.courseId)) return state
      return {
        ...state,
        enrolled: [...state.enrolled, action.courseId],
        progress: { ...state.progress, [action.courseId]: state.progress[action.courseId] ?? 0 },
      }

    case 'COMPLETE_LESSON': {
      const already = state.completedLessons.includes(action.lessonId)
      const oldProgress = state.progress[action.courseId] ?? 0
      const newProgress = already ? oldProgress : Math.min(100, oldProgress + 25)
      const newlyFinished = oldProgress < 100 && newProgress >= 100
      const gained = already ? 0 : 50
      return withBadges({
        ...state,
        points: state.points + gained,
        activity: recordXp(state.activity, gained),
        completedLessons: already ? state.completedLessons : [...state.completedLessons, action.lessonId],
        progress: { ...state.progress, [action.courseId]: newProgress },
        extraCourses: state.extraCourses + (newlyFinished ? 1 : 0),
      })
    }

    case 'QUIZ_ANSWER':
      return {
        ...state,
        quiz: {
          attempts: state.quiz.attempts + 1,
          correct: state.quiz.correct + (action.correct ? 1 : 0),
        },
      }

    case 'REVIEW_CARD': {
      const existing = state.cards[action.cardId]
      const custom = state.customCards.find((c) => c.id === action.cardId)
      const source = seed.flashcards.find((c) => c.id === action.cardId) ?? custom
      if (!source) return state
      const memory = existing ?? initialMemory(source)
      const next = reviewMemory(memory, action.quality)
      return withBadges({
        ...state,
        points: state.points + 15,
        activity: recordXp(state.activity, 15),
        cards: { ...state.cards, [action.cardId]: next },
      })
    }

    case 'PAY':
      return {
        ...state,
        attestations: {
          ...state.attestations,
          [action.attestationId]: { method: action.method, date: today() },
        },
      }

    case 'APPLY':
      return state.appliedJobs.includes(action.jobId)
        ? state
        : { ...state, appliedJobs: [...state.appliedJobs, action.jobId] }

    case 'MOVE_PROJECT':
      return {
        ...state,
        projectStatus: { ...state.projectStatus, [action.projectId]: action.status },
      }

    case 'SEND_MESSAGE': {
      const message: Message = {
        id: `m_${Date.now()}`,
        domainId: action.domainId,
        senderName: action.author,
        senderRole: 'Apprenant',
        messageText: action.text,
        timestampText: "À l'instant",
        isUser: true,
        reactionsCount: 0,
      }
      return { ...state, messages: [...state.messages, message] }
    }

    case 'UPDATE_PROFILE':
      return state.account ? { ...state, account: { ...state.account, ...action.patch } } : state

    case 'SET_NOTE':
      return { ...state, notes: { ...state.notes, [action.lessonId]: action.text } }

    case 'TOGGLE_FAV_COURSE': {
      const has = state.favorites.courses.includes(action.courseId)
      return {
        ...state,
        favorites: {
          ...state.favorites,
          courses: has
            ? state.favorites.courses.filter((id) => id !== action.courseId)
            : [...state.favorites.courses, action.courseId],
        },
      }
    }

    case 'TOGGLE_FAV_CARD': {
      const has = state.favorites.cards.includes(action.cardId)
      return {
        ...state,
        favorites: {
          ...state.favorites,
          cards: has
            ? state.favorites.cards.filter((id) => id !== action.cardId)
            : [...state.favorites.cards, action.cardId],
        },
      }
    }

    case 'ADD_CARD':
      return {
        ...state,
        customCards: [action.card, ...state.customCards],
        cards: { ...state.cards, [action.card.id]: initialMemory(action.card) },
      }

    case 'DELETE_CARD':
      return {
        ...state,
        customCards: state.customCards.filter((c) => c.id !== action.cardId),
        favorites: { ...state.favorites, cards: state.favorites.cards.filter((id) => id !== action.cardId) },
      }

    case 'SET_GOAL':
      return { ...state, dailyGoal: Math.max(10, Math.min(300, action.goal)) }

    case 'ARCADE_RESULT': {
      const { game } = action
      const best = { ...state.arcade.best }
      if (game === 'memory') {
        best.memoryMoves = best.memoryMoves === 0 ? action.moves : Math.min(best.memoryMoves, action.moves)
      } else {
        best[game] = Math.max(best[game], action.score)
      }
      const todayKey = dayKey(new Date())
      const firstToday = state.arcade.plays[game] !== todayKey
      const gained = firstToday
        ? game === 'quiz'
          ? quizXp(action.score)
          : game === 'vf'
            ? vfXp(action.score)
            : memoryXp(action.moves)
        : 0
      return withBadges({
        ...state,
        points: state.points + gained,
        activity: gained ? recordXp(state.activity, gained) : state.activity,
        arcade: {
          ...state.arcade,
          best,
          plays: firstToday ? { ...state.arcade.plays, [game]: todayKey } : state.arcade.plays,
        },
      })
    }

    case 'FACT_READ': {
      if (state.arcade.factsRead.includes(action.factId)) return state
      return withBadges({
        ...state,
        points: state.points + 5,
        activity: recordXp(state.activity, 5),
        arcade: { ...state.arcade, factsRead: [...state.arcade.factsRead, action.factId] },
      })
    }

    case 'IMPORT':
      return { ...action.state, arcade: normalizeArcade(action.state.arcade), version: 2 }

    case 'RESET': {
      const fresh = initialState()
      return { ...fresh, account: state.account, theme: state.theme }
    }

    default:
      return state
  }
}

function reducer(state: Persist, action: Action): Persist {
  return withAchievements(baseReducer(state, action))
}

/** XP qu'une partie rapporterait si elle est la première du jour. */
export function arcadeXpPreview(state: Persist, game: GameId, score: number, moves: number): number {
  if (state.arcade.plays[game] === dayKey(new Date())) return 0
  if (game === 'quiz') return quizXp(score)
  if (game === 'vf') return vfXp(score)
  return memoryXp(moves)
}

export function arcadePlayedToday(state: Persist, game: GameId): boolean {
  return state.arcade.plays[game] === dayKey(new Date())
}

/* ------------------------------------------------------------------ */
/*  Authentification locale (démo)                                    */
/* ------------------------------------------------------------------ */

function hash(value: string): string {
  let h = 5381
  for (let i = 0; i < value.length; i += 1) h = ((h << 5) + h + value.charCodeAt(i)) >>> 0
  return h.toString(36)
}

interface StoredAccount {
  name: string
  email: string
  city: string
  phone: string
  pw: string
}

function readAccounts(): StoredAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]') as StoredAccount[]
  } catch {
    return []
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function profileAccount(): Account {
  return {
    name: seed.profile.fullName,
    email: seed.profile.email,
    phone: seed.profile.phone,
    city: seed.profile.location,
    bio: seed.profile.bio,
    role: seed.profile.role,
  }
}

/* ------------------------------------------------------------------ */
/*  Contexte                                                          */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: number
  message: string
  error?: boolean
}

interface Ctx {
  state: Persist
  dispatch: React.Dispatch<Action>
  toasts: Toast[]
  notify: (message: string, error?: boolean) => void
  dismissToast: (id: number) => void
  login: (email: string, password: string) => string | null
  register: (name: string, email: string, password: string, city: string) => string | null
  logout: () => void
  resetDemo: () => void
}

const AppContext = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* quota dépassé : la session reste utilisable en mémoire */
    }
  }, [state])

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme
    document.documentElement.style.colorScheme = state.theme
  }, [state.theme])

  const notify = (message: string, error = false) => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, message, error }].slice(-3))
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3600)
  }

  const dismissToast = (id: number) => setToasts((list) => list.filter((t) => t.id !== id))

  const login = (email: string, password: string): string | null => {
    const clean = email.trim().toLowerCase()
    if (!clean || !clean.includes('@')) return 'Veuillez saisir une adresse e-mail valide.'
    if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.'

    if (clean === DEMO_EMAIL && password === DEMO_PASSWORD) {
      dispatch({ type: 'LOGIN', account: profileAccount() })
      return null
    } else {
      const account = readAccounts().find((a) => a.email === clean)
      if (!account || account.pw !== hash(password)) {
        return 'Identifiants incorrects. Utilisez le compte de démonstration ou créez un compte.'
      }
      dispatch({
        type: 'LOGIN',
        account: {
          name: account.name,
          email: account.email,
          phone: account.phone,
          city: account.city,
          bio: 'Nouvel apprenant AfricaSkills.',
          role: 'Apprenant AfricaSkills',
        },
      })
      return null
    }
  }

  const register = (name: string, email: string, password: string, city: string): string | null => {
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanCity = city.trim() || 'Cotonou, Bénin'
    if (cleanName.length < 2) return 'Veuillez entrer votre nom complet.'
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) return 'Veuillez saisir une adresse e-mail valide.'
    if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.'
    if (cleanEmail === DEMO_EMAIL || readAccounts().some((a) => a.email === cleanEmail)) {
      return 'Un compte existe déjà avec cet e-mail.'
    }
    const account: StoredAccount = {
      name: cleanName,
      email: cleanEmail,
      city: cleanCity,
      phone: '+229 90 00 00 00',
      pw: hash(password),
    }
    writeAccounts([...readAccounts(), account])
    dispatch({
      type: 'LOGIN',
      account: {
        name: cleanName,
        email: cleanEmail,
        phone: account.phone,
        city: cleanCity,
        bio: 'Nouvel apprenant AfricaSkills.',
        role: 'Apprenant AfricaSkills',
      },
    })
    return null
  }

  const logout = () => dispatch({ type: 'LOGOUT' })

  const resetDemo = () => dispatch({ type: 'RESET' })

  const value = useMemo(
    () => ({ state, dispatch, toasts, notify, dismissToast, login, register, logout, resetDemo }),
    [state, toasts],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

/* Helpers de lecture du seed ------------------------------------------ */

export const domainById = (id: string) => seed.domains.find((d) => d.id === id) ?? seed.domains[0]
export const tierByKey = (key: string) => seed.tiers.find((t) => t.name === key)
export const badgeForTier = (key: string) => seed.badges.find((b) => b.tier === key)
export const lessonsFor = (courseId: string) =>
  seed.lessons.filter((l) => l.courseId === courseId).sort((a, b) => a.orderIndex - b.orderIndex)
export const courseById = (id: string) => seed.courses.find((c) => c.id === id)

export { formatFcfa }
export { initials } from './lib/format'
