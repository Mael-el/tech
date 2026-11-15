import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import seedJson from './data/seed.json'
import type { Account, Message, Seed } from './types'

export const seed = seedJson as unknown as Seed

/* ------------------------------------------------------------------ */
/*  Constantes de démonstration (identiques à l'app Android)          */
/* ------------------------------------------------------------------ */

export const DEMO_EMAIL = seed.profile.email
export const DEMO_PASSWORD = 'Africa2026'
const STORAGE_KEY = 'africaskills.preview.v1'
const ACCOUNTS_KEY = 'africaskills.preview.accounts'

export const ENGLISH_RANK: Record<string, number> = {
  A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5,
}

/* ------------------------------------------------------------------ */
/*  État persistant                                                   */
/* ------------------------------------------------------------------ */

export interface CardState {
  ef: number
  interval: number
  reps: number
  next: number
}

export interface Persist {
  account: Account | null
  points: number
  streak: number
  extraCourses: number
  enrolled: string[]
  progress: Record<string, number>
  completedLessons: string[]
  cards: Record<string, CardState>
  badges: Record<string, string | null>
  attestations: Record<string, { method: string; date: string }>
  appliedJobs: string[]
  projectStatus: Record<string, string>
  messages: Message[]
  theme: 'light' | 'dark'
}

const today = () =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

export function initialState(): Persist {
  return {
    account: null,
    points: seed.profile.points,
    streak: seed.profile.streakDays,
    extraCourses: 0,
    enrolled: seed.courses.filter((c) => c.isEnrolled).map((c) => c.id),
    progress: Object.fromEntries(seed.courses.map((c) => [c.id, c.progressPercent])),
    completedLessons: seed.lessons.filter((l) => l.isCompleted).map((l) => l.id),
    cards: Object.fromEntries(
      seed.flashcards.map((c) => [
        c.id,
        { ef: c.easeFactor, interval: c.intervalDays, reps: c.repetitions, next: Date.now() },
      ]),
    ),
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
  }
}

function load(): Persist {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<Persist>
    return { ...initialState(), ...parsed }
  } catch {
    return initialState()
  }
}

/* ------------------------------------------------------------------ */
/*  Badges                                                            */
/* ------------------------------------------------------------------ */

export function currentEnglishRank(): number {
  const level = seed.profile.englishLevel.trim().slice(0, 2).toUpperCase()
  return ENGLISH_RANK[level] ?? 2
}

export function coursesCompleted(state: Persist): number {
  return seed.profile.completedCoursesCount + state.extraCourses
}

function withBadges(state: Persist): Persist {
  const english = currentEnglishRank()
  const points = state.points
  const done = coursesCompleted(state)
  const badges = { ...state.badges }
  let changed = false
  for (const tier of seed.tiers) {
    const badge = seed.badges.find((b) => b.tier === tier.name)
    if (!badge || badges[badge.id]) continue
    if (points >= tier.minPoints && done >= tier.minCourses && english >= ENGLISH_RANK[tier.requiredEnglish]) {
      badges[badge.id] = today()
      changed = true
    }
  }
  return changed ? { ...state, badges } : state
}

export function unlockedTiers(state: Persist) {
  return seed.tiers.filter((t) => {
    const badge = seed.badges.find((b) => b.tier === t.name)
    return badge ? Boolean(state.badges[badge.id]) : false
  })
}

export function currentTier(state: Persist) {
  const unlocked = unlockedTiers(state)
  return unlocked.length ? unlocked[unlocked.length - 1] : null
}

export function nextTier(state: Persist) {
  const unlocked = unlockedTiers(state)
  return seed.tiers[unlocked.length] ?? null
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
  | { type: 'REVIEW_CARD'; cardId: string; quality: number }
  | { type: 'PAY'; attestationId: string; method: string }
  | { type: 'APPLY'; jobId: string }
  | { type: 'MOVE_PROJECT'; projectId: string; status: string }
  | { type: 'SEND_MESSAGE'; domainId: string; text: string; author: string }
  | { type: 'UPDATE_PROFILE'; patch: Partial<Account> }
  | { type: 'RESET' }

function reducer(state: Persist, action: Action): Persist {
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
      return withBadges({
        ...state,
        points: state.points + (already ? 0 : 50),
        completedLessons: already ? state.completedLessons : [...state.completedLessons, action.lessonId],
        progress: { ...state.progress, [action.courseId]: newProgress },
        extraCourses: state.extraCourses + (newlyFinished ? 1 : 0),
      })
    }

    case 'REVIEW_CARD': {
      const card = seed.flashcards.find((c) => c.id === action.cardId)
      if (!card) return state
      const gp = state.cards[action.cardId] ?? { ef: card.easeFactor, interval: card.intervalDays, reps: card.repetitions, next: 0 }
      const q = Math.max(0, Math.min(5, action.quality))
      const ef = Math.max(1.3, gp.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
      let reps: number
      let interval: number
      if (q < 3) {
        reps = 0
        interval = 1
      } else {
        reps = gp.reps + 1
        interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.max(1, Math.round(gp.interval * ef))
      }
      const next = Date.now() + interval * 86_400_000
      return withBadges({
        ...state,
        points: state.points + 15,
        cards: { ...state.cards, [action.cardId]: { ef, interval, reps, next } },
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

    case 'RESET': {
      const fresh = initialState()
      return { ...fresh, account: state.account, theme: state.theme }
    }

    default:
      return state
  }
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
}

const AppContext = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme
    document.documentElement.style.colorScheme = state.theme
  }, [state.theme])

  const notify = (message: string, error = false) => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, message, error }])
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3600)
  }

  const dismissToast = (id: number) => setToasts((list) => list.filter((t) => t.id !== id))

  const login = (email: string, password: string): string | null => {
    const clean = email.trim().toLowerCase()
    if (!clean || !clean.includes('@')) return "Veuillez saisir une adresse e-mail valide."
    if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.'

    if (clean === DEMO_EMAIL && password === DEMO_PASSWORD) {
      dispatch({ type: 'LOGIN', account: profileAccount() })
      return null
    }
    const account = readAccounts().find((a) => a.email === clean)
    if (!account || account.pw !== hash(password)) {
      return 'Identifiants incorrects. Utilisez le compte de démonstration ou créez un compte.'
    }
    dispatch({
      type: 'LOGIN',
      account: { name: account.name, email: account.email, phone: account.phone, city: account.city, bio: seed.profile.bio, role: 'Apprenant AfricaSkills' },
    })
    return null
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
      account: { name: cleanName, email: cleanEmail, phone: account.phone, city: cleanCity, bio: 'Nouvel apprenant AfricaSkills.', role: 'Apprenant AfricaSkills' },
    })
    return null
  }

  const logout = () => dispatch({ type: 'LOGOUT' })

  const value = useMemo(
    () => ({ state, dispatch, toasts, notify, dismissToast, login, register, logout }),
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

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function formatFcfa(value: number): string {
  return `${value.toLocaleString('fr-FR')} FCFA`
}
