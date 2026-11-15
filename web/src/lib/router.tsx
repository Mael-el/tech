import { useCallback, useEffect, useState } from 'react'

export type Tab = 'home' | 'courses' | 'cards' | 'badges' | 'network' | 'profile'

export interface Route {
  tab: Tab
  courseId?: string
  lessonId?: string
  cardId?: string
}

const SEGMENTS: Record<Tab, string> = {
  home: '',
  courses: 'cours',
  cards: 'revision',
  badges: 'certifications',
  network: 'reseau',
  profile: 'profil',
}

const ALIASES: Record<string, Tab> = {
  '': 'home',
  accueil: 'home',
  home: 'home',
  cours: 'courses',
  courses: 'courses',
  revision: 'cards',
  cards: 'cards',
  certifications: 'badges',
  badges: 'badges',
  reseau: 'network',
  network: 'network',
  profil: 'profile',
  profile: 'profile',
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '').split('?')[0]
  const parts = raw.split('/').filter(Boolean)
  if (parts.length === 0) return { tab: 'home' }
  const tab = ALIASES[parts[0].toLowerCase()] ?? 'home'
  if (tab === 'courses') {
    return { tab, courseId: parts[1], lessonId: parts[2] }
  }
  if (tab === 'cards') {
    return { tab, cardId: parts[1] }
  }
  return { tab }
}

export function routePath(route: Route): string {
  const base = SEGMENTS[route.tab]
  const parts = [base]
  if (route.tab === 'courses') {
    if (route.courseId) parts.push(route.courseId)
    if (route.lessonId) parts.push(route.lessonId)
  }
  if (route.tab === 'cards' && route.cardId) parts.push(route.cardId)
  return `#/${parts.filter(Boolean).join('/')}`
}

export function useRoute(): [Route, (next: Route | string) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((next: Route | string) => {
    const path = typeof next === 'string' ? (next.startsWith('#') ? next : `#${next}`) : routePath(next)
    if (window.location.hash === path) {
      // Force un rafraîchissement de la route même si le hash est identique.
      setRoute(parseHash(path))
      return
    }
    window.location.hash = path
  }, [])

  return [route, navigate]
}
