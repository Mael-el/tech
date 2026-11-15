/**
 * Données factuelles vérifiées (chiffres publics) + ressources gratuites.
 * Chaque fiche porte sa source et sa date ; l'écran « Vrai » les affiche telles quelles.
 */
import factsJson from '../data/facts.json'
import { dayKey } from './progress'

export interface FactSource {
  name: string
  url: string
  date: string
}

export interface Fact {
  id: string
  theme: string
  stat: string
  title: string
  detail: string
  source: FactSource
}

export interface FactTheme {
  id: string
  label: string
  color: string
  icon: string
}

export interface FreeResource {
  id: string
  name: string
  url: string
  kind: string
  description: string
}

interface FactsFile {
  verifiedAt: string
  note: string
  themes: FactTheme[]
  facts: Fact[]
  resources: FreeResource[]
}

const data = factsJson as unknown as FactsFile

export const verifiedAt = data.verifiedAt
export const methodology = data.note
export const facts: Fact[] = data.facts
export const factThemes: FactTheme[] = data.themes
export const freeResources: FreeResource[] = data.resources

export function themeById(id: string): FactTheme {
  return data.themes.find((theme) => theme.id === id) ?? data.themes[0]
}

export function factById(id: string): Fact | undefined {
  return data.facts.find((fact) => fact.id === id)
}

export function factsByTheme(theme: string | null): Fact[] {
  return theme ? data.facts.filter((fact) => fact.theme === theme) : data.facts
}

/** Toutes les sources, dédoublonnées par URL, dans l'ordre d'apparition. */
export function allSources(): FactSource[] {
  const seen = new Set<string>()
  const list: FactSource[] = []
  for (const fact of data.facts) {
    if (seen.has(fact.source.url)) continue
    seen.add(fact.source.url)
    list.push(fact.source)
  }
  return list
}

/** Fiche du jour : rotation déterministe, identique pour tous les appareils. */
export function factOfTheDay(date = new Date()): Fact {
  const key = dayKey(date)
  let hash = 0
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return data.facts[hash % data.facts.length]
}
