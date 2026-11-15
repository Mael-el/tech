import { describe, expect, it } from 'vitest'
import { prefersReducedMotion, splitNumeric } from './motion'

describe('valeurs animées', () => {
  it('sépare un nombre et son suffixe', () => {
    expect(splitNumeric('82 %')).toEqual({ before: '', value: 82, after: ' %' })
  })

  it('gère les espaces insécables des milliers', () => {
    expect(splitNumeric('1\u202f234 XP')).toEqual({ before: '', value: 1234, after: ' XP' })
  })

  it('conserve un préfixe et un quotient', () => {
    expect(splitNumeric('0/5')).toEqual({ before: '', value: 0, after: '/5' })
  })

  it('gère les valeurs négatives', () => {
    expect(splitNumeric('-12 j')).toEqual({ before: '', value: -12, after: ' j' })
  })

  it('renvoie null sans chiffre', () => {
    expect(splitNumeric('aucun')).toBeNull()
  })

  it('ne détecte pas d’animation hors navigateur', () => {
    expect(prefersReducedMotion()).toBe(false)
  })
})
