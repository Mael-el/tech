import { describe, expect, it } from 'vitest'
import { allSources, factById, factOfTheDay, facts, factThemes, freeResources, themeById } from './facts'

describe('fiches chiffrées', () => {
  it('a des identifiants uniques', () => {
    const ids = facts.map((fact) => fact.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(freeResources.map((resource) => resource.id)).size).toBe(freeResources.length)
  })

  it('cite toujours une source https et une date', () => {
    for (const fact of facts) {
      expect(fact.source.url.startsWith('https://'), fact.id).toBe(true)
      expect(fact.source.name.length, fact.id).toBeGreaterThan(3)
      expect(fact.source.date, fact.id).toMatch(/\d{4}/)
      expect(fact.detail.length, fact.id).toBeGreaterThan(40)
      expect(fact.stat.length, fact.id).toBeGreaterThan(0)
    }
  })

  it('rattache chaque fiche à un thème connu', () => {
    const themes = new Set(factThemes.map((theme) => theme.id))
    for (const fact of facts) expect(themes.has(fact.theme), fact.id).toBe(true)
    expect(themeById('inconnu')).toBe(factThemes[0])
  })

  it('dédoublonne les sources', () => {
    const sources = allSources()
    const urls = sources.map((source) => source.url)
    expect(new Set(urls).size).toBe(urls.length)
    expect(sources.length).toBeGreaterThanOrEqual(10)
  })

  it('fournit une fiche du jour stable', () => {
    const day = new Date('2026-11-15T09:00:00')
    const first = factOfTheDay(day)
    const second = factOfTheDay(day)
    expect(first.id).toBe(second.id)
    expect(facts.some((fact) => fact.id === first.id)).toBe(true)
    expect(factById(first.id)?.id).toBe(first.id)
  })
})
