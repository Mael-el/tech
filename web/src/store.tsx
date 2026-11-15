import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import seedJson from './data/seed.json'
import type { Account, Flashcard, Seed } from './types'
import { computeStreak, dayKey, englishRank, recordXp } from './lib/progress'
import { initialMemory, reviewMemory, type CardMemory } from './lib/sm2'
import { evaluateAchievements, memoryXp, quizXp, vfXp, type GameId } from './lib/arcade'
import { certificateDate, encodeCertificate } from './lib/certificate'
import { formatFcfa } from './lib/format'

export const seed = seedJson as unknown as Seed

export type { CardMemory }
export type { GameId }

/* ------------------------------------------------------------------ */
/*  Stockage local                                                    */
/* ------------------------------------------------------------------ */

export const STORAGE_KEY = 'africaskills.app.v3'
const LEGACY_KEYS = ['africaskills.preview.v2', 'africaskills.preview.v1']
const ACCOUNTS_KEY = 'africaskills.preview.accounts'

export const ENGLISH_RANK: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 }
export const ENGLISH_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export type CardState = CardMemory

export interface QuizStats {
  attempts: number
  correct: number
}

export interface Certificate {
  date: string
  code: string
}

export type ApplicationStatus = 'À postuler' | 'Envoyée' | 'Entretien' | 'Offre' | 'Refus'

export interface Application {
  id: string
  company: string
  role: string
  url: string
  status: ApplicationStatus
  date: string
}

export type ProjectStage = 'idée' | 'en cours' | 'terminé'

export interface UserProject {
  id: string
  title: string
  note: string
  stage: ProjectStage
  date: string
}

export interface ArcadeState {
  best: { quiz: number; vf: number; memoryMoves: number }
  plays: { quiz: string | null; vf: string | null; memory: string | null }
  achievements: string[]
  factsRead: string[]
}

export interface FocusState {
  dates: string[]
}

export interface Persist {
  version: number
  account: Account | null
  points: number
  enrolled: string[]
  progress: Record<string, number>
  completedLessons: string[]
  cards: Record<string, CardMemory>
  badges: Record<string, string | null>
  certificates: Record<string, Certificate>
  applications: Application[]
  projects: UserProject[]
  theme: 'light' | 'dark'
  dailyGoal: number
  activity: Record<string, number>
  notes: Record<string, string>
  favorites: { courses: string[]; cards: string[] }
  customCards: Flashcard[]
  quiz: QuizStats
  arcade: ArcadeState
  focus: FocusState
}

const today = () =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

export function initialState(): Persist {
  return {
    version: 3,
    account: null,
    points: 0,
    enrolled: [],
    progress: {},
    completedLessons: [],
    cards: Object.fromEntries(seed.flashcards.map((card) => [card.id, initialMemory(card)])),
    badges: Object.fromEntries(seed.badges.map((badge) => [badge.id, null])),
    certificates: {},
    applications: [],
    projects: [],
    theme: 'light',
    dailyGoal: 60,
    activity: {},
    notes: {},
    favorites: { courses: [], cards: [] },
    customCards: [],
    quiz: { attempts: 0, correct: 0 },
    arcade: {
      best: { quiz: 0, vf: 0, memoryMoves: 0 },
      plays: { quiz: null, vf: null, memory: null },
      achievements: [],
      factsRead: [],
    },
    focus: { dates: [] },
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

function normalizeAccount(value: Account | null | undefined): Account | null {
  if (!value) return null
  return {
    name: value.name ?? 'Apprenant',
    email: value.email ?? '',
    phone: value.phone ?? '',
    city: value.city ?? '',
    bio: value.bio ?? '',
    role: value.role ?? 'Apprenant AfricaSkills',
    englishLevel: value.englishLevel ?? 'A1',
  }
}

/** Fusionne un état stocké (v2 ou v3) avec les valeurs par défaut. */
function normalize(raw: Partial<Persist>): Persist {
  const base = initialState()
  const progress = (raw.progress as Record<string, number>) ?? {}
  const enrolled = (raw.enrolled as string[]) ?? Object.keys(progress)
  return {
    ...base,
    account: normalizeAccount(raw.account as Account | null),
    points: Number(raw.points ?? 0),
    enrolled,
    progress,
    completedLessons: (raw.completedLessons as string[]) ?? [],
    cards: (raw.cards as Record<string, CardMemory>) ?? base.cards,
    badges: { ...base.badges, ...((raw.badges as Record<string, string | null>) ?? {}) },
    certificates: (raw.certificates as Record<string, Certificate>) ?? {},
    applications: Array.isArray(raw.applications) ? (raw.applications as Application[]) : [],
    projects: Array.isArray(raw.projects) ? (raw.projects as UserProject[]) : [],
    theme: raw.theme === 'dark' ? 'dark' : 'light',
    dailyGoal: Number(raw.dailyGoal ?? 60),
    activity: (raw.activity as Record<string, number>) ?? {},
    notes: (raw.notes as Record<string, string>) ?? {},
    favorites: {
      courses: ((raw.favorites as Persist['favorites'])?.courses ?? []).filter((id) => Boolean(courseById(id))),
      cards: (raw.favorites as Persist['favorites'])?.cards ?? [],
    },
    customCards: (raw.customCards as Flashcard[]) ?? [],
    quiz: {
      attempts: Number((raw.quiz as QuizStats)?.attempts ?? 0),
      correct: Number((raw.quiz as QuizStats)?.correct ?? 0),
    },
    arcade: normalizeArcade(raw.arcade as Partial<ArcadeState> | undefined),
    focus: { dates: Array.isArray((raw.focus as FocusState)?.dates) ? (raw.focus as FocusState).dates : [] },
    version: 3,
  }
}

export function loadState(): Persist {
  try {
    const current = localStorage.getItem(STORAGE_KEY)
    if (current) return normalize(JSON.parse(current) as Partial<Persist>)

    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key)
      if (!legacy) continue
      const migrated = normalize(JSON.parse(legacy) as Partial<Persist>)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      localStorage.removeItem(key)
      return migrated
    }
  } catch {
    /* stockage indisponible : on repart d'un état vide */
  }
  return initialState()
}

/* ------------------------------------------------------------------ */
/*  Lecture du catalogue                                              */
/* ------------------------------------------------------------------ */

export const domainById = (id: string) => seed.domains.find((domain) => domain.id === id) ?? seed.domains[0]
export const tierByKey = (key: string) => seed.tiers.find((tier) => tier.name === key)
export const badgeForTier = (key: string) => seed.badges.find((badge) => badge.tier === key)
export const lessonsFor = (courseId: string) =>
  seed.lessons.filter((lesson) => lesson.courseId === courseId).sort((a, b) => a.orderIndex - b.orderIndex)
export const courseById = (id: string) => seed.courses.find((course) => course.id === id)

export function allCards(state: Persist): Flashcard[] {
  return [...seed.flashcards, ...state.customCards]
}

/* ------------------------------------------------------------------ */
/*  Progression, badges, paliers                                      */
/* ------------------------------------------------------------------ */

export function currentEnglishRank(state: Persist): number {
  return englishRank(state.account?.englishLevel ?? 'A1')
}

export function coursesCompleted(state: Persist): number {
  return Object.values(state.progress).filter((value) => value >= 100).length
}

export function completedCourses(state: Persist) {
  return seed.courses.filter((course) => (state.progress[course.id] ?? 0) >= 100)
}

export function tierIsUnlocked(state: Persist, tierName: string): boolean {
  const badge = seed.badges.find((item) => item.tier === tierName)
  return Boolean(badge && state.badges[badge.id])
}

export function unlockedTiers(state: Persist) {
  return seed.tiers.filter((tier) => tierIsUnlocked(state, tier.name))
}

export function currentTier(state: Persist) {
  const unlocked = unlockedTiers(state)
  return unlocked.length ? unlocked[unlocked.length - 1] : null
}

export function nextTier(state: Persist) {
  return seed.tiers[unlockedTiers(state).length] ?? null
}

function withBadges(state: Persist): Persist {
  const rank = currentEnglishRank(state)
  const done = coursesCompleted(state)
  const badges = { ...state.badges }
  let changed = false
  for (const tier of seed.tiers) {
    const badge = seed.badges.find((item) => item.tier === tier.name)
    if (!badge || badges[badge.id]) continue
    if (state.points >= tier.minPoints && done >= tier.minCourses && rank >= (ENGLISH_RANK[tier.requiredEnglish] ?? 0)) {
      badges[badge.id] = today()
      changed = true
    }
  }
  return changed ? { ...state, badges } : state
}

function withAchievements(state: Persist): Persist {
  const unlocked = evaluateAchievements({
    completedLessons: state.completedLessons.length,
    streak: computeStreak(state.activity),
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

export function streakOf(state: Persist): number {
  return computeStreak(state.activity)
}

export function todayXp(state: Persist): number {
  return state.activity[dayKey(new Date())] ?? 0
}

/* ------------------------------------------------------------------ */
/*  Attestations                                                      */
/* ------------------------------------------------------------------ */

export function certificateFor(state: Persist, courseId: string): Certificate | undefined {
  return state.certificates[courseId]
}

export function verificationLink(code: string): string {
  return `${window.location.origin}${window.location.pathname}#/verifier/${code}`
}

/* ------------------------------------------------------------------ */
/*  Actions                                                           */
/* ------------------------------------------------------------------ */

type Action =
  | { type: 'LOGIN'; account: Account }
  | { type: 'REGISTER'; account: Account }
  | { type: 'LOGOUT' }
  | { type: 'THEME'; theme: 'light' | 'dark' }
  | { type: 'ENROLL'; courseId: string }
  | { type: 'COMPLETE_LESSON'; lessonId: string; courseId: string }
  | { type: 'QUIZ_ANSWER'; correct: boolean }
  | { type: 'REVIEW_CARD'; cardId: string; quality: number }
  | { type: 'CERTIFY'; courseId: string }
  | { type: 'ADD_APPLICATION'; company: string; role: string; url: string; status: ApplicationStatus }
  | { type: 'MOVE_APPLICATION'; id: string; status: ApplicationStatus }
  | { type: 'DELETE_APPLICATION'; id: string }
  | { type: 'ADD_PROJECT'; title: string; note: string }
  | { type: 'MOVE_PROJECT'; id: string; stage: ProjectStage }
  | { type: 'DELETE_PROJECT'; id: string }
  | { type: 'FOCUS_DONE' }
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

export const FOCUS_XP = 20
export const FOCUS_DAILY_CAP = 4

function baseReducer(state: Persist, action: Action): Persist {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, account: action.account }

    case 'REGISTER': {
      const fresh = initialState()
      return { ...fresh, account: action.account, theme: state.theme }
    }

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
      const gained = already ? 0 : 50
      return withBadges({
        ...state,
        points: state.points + gained,
        activity: recordXp(state.activity, gained),
        completedLessons: already ? state.completedLessons : [...state.completedLessons, action.lessonId],
        progress: { ...state.progress, [action.courseId]: newProgress },
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
      const custom = state.customCards.find((card) => card.id === action.cardId)
      const source = seed.flashcards.find((card) => card.id === action.cardId) ?? custom
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

    case 'CERTIFY': {
      if (!state.account || state.certificates[action.courseId]) return state
      const course = courseById(action.courseId)
      if (!course || (state.progress[action.courseId] ?? 0) < 100) return state
      const date = certificateDate()
      const code = encodeCertificate({
        v: 1,
        n: state.account.name,
        c: course.id,
        t: course.title,
        d: date,
      })
      return { ...state, certificates: { ...state.certificates, [action.courseId]: { date, code } } }
    }

    case 'ADD_APPLICATION': {
      if (!action.company.trim() || !action.role.trim()) return state
      const application: Application = {
        id: `app_${Date.now()}`,
        company: action.company.trim(),
        role: action.role.trim(),
        url: action.url.trim(),
        status: action.status,
        date: certificateDate(),
      }
      return { ...state, applications: [application, ...state.applications] }
    }

    case 'MOVE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map((item) =>
          item.id === action.id ? { ...item, status: action.status } : item,
        ),
      }

    case 'DELETE_APPLICATION':
      return { ...state, applications: state.applications.filter((item) => item.id !== action.id) }

    case 'ADD_PROJECT': {
      if (!action.title.trim()) return state
      const project: UserProject = {
        id: `proj_${Date.now()}`,
        title: action.title.trim(),
        note: action.note.trim(),
        stage: 'idée',
        date: certificateDate(),
      }
      return { ...state, projects: [project, ...state.projects] }
    }

    case 'MOVE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((item) => (item.id === action.id ? { ...item, stage: action.stage } : item)),
      }

    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter((item) => item.id !== action.id) }

    case 'FOCUS_DONE': {
      const key = dayKey(new Date())
      const todayCount = state.focus.dates.filter((date) => date === key).length
      const gained = todayCount < FOCUS_DAILY_CAP ? FOCUS_XP : 0
      return withBadges({
        ...state,
        points: state.points + gained,
        activity: gained ? recordXp(state.activity, gained) : state.activity,
        focus: { dates: [...state.focus.dates, key] },
      })
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
        customCards: state.customCards.filter((card) => card.id !== action.cardId),
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
      return normalize(action.state)

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
/*  Comptes locaux                                                    */
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
  englishLevel?: string
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
  register: (name: string, email: string, password: string, city: string, englishLevel: string) => string | null
  logout: () => void
  resetData: () => void
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
    window.setTimeout(() => setToasts((list) => list.filter((toast) => toast.id !== id)), 3600)
  }

  const dismissToast = (id: number) => setToasts((list) => list.filter((toast) => toast.id !== id))

  const login = (email: string, password: string): string | null => {
    const clean = email.trim().toLowerCase()
    if (!clean || !clean.includes('@')) return 'Veuillez saisir une adresse e-mail valide.'
    if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.'

    const account = readAccounts().find((item) => item.email === clean)
    if (!account || account.pw !== hash(password)) {
      return 'E-mail ou mot de passe incorrect. Créez un compte si c’est votre première visite.'
    }

    dispatch({
      type: 'LOGIN',
      account: {
        name: account.name,
        email: account.email,
        phone: account.phone,
        city: account.city,
        bio: 'Apprenant AfricaSkills.',
        role: 'Apprenant AfricaSkills',
        englishLevel: account.englishLevel ?? 'A1',
      },
    })
    return null
  }

  const register = (
    name: string,
    email: string,
    password: string,
    city: string,
    englishLevel: string,
  ): string | null => {
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanCity = city.trim() || 'Cotonou, Bénin'
    if (cleanName.length < 2) return 'Veuillez entrer votre nom complet.'
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) return 'Veuillez saisir une adresse e-mail valide.'
    if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.'
    if (readAccounts().some((item) => item.email === cleanEmail)) {
      return 'Un compte existe déjà avec cet e-mail.'
    }
    const account: StoredAccount = {
      name: cleanName,
      email: cleanEmail,
      city: cleanCity,
      phone: '',
      pw: hash(password),
      englishLevel,
    }
    writeAccounts([...readAccounts(), account])
    dispatch({
      type: 'REGISTER',
      account: {
        name: cleanName,
        email: cleanEmail,
        phone: '',
        city: cleanCity,
        bio: '',
        role: 'Apprenant AfricaSkills',
        englishLevel,
      },
    })
    return null
  }

  const logout = () => dispatch({ type: 'LOGOUT' })
  const resetData = () => dispatch({ type: 'RESET' })

  const value = useMemo(
    () => ({ state, dispatch, toasts, notify, dismissToast, login, register, logout, resetData }),
    [state, toasts],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export { formatFcfa }
export { initials } from './lib/format'
