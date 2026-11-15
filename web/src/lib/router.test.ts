import { describe, expect, it } from 'vitest'
import { parseHash, routePath } from './router'

describe('routage par hash', () => {
  it('route la racine vers l’accueil', () => {
    expect(parseHash('')).toEqual({ tab: 'home' })
    expect(parseHash('#/')).toEqual({ tab: 'home' })
  })

  it('ouvre un cours puis une leçon', () => {
    expect(parseHash('#/cours/c_dev_01')).toEqual({ tab: 'courses', courseId: 'c_dev_01', lessonId: undefined })
    expect(parseHash('#/cours/c_dev_01/les_dev_02')).toEqual({
      tab: 'courses',
      courseId: 'c_dev_01',
      lessonId: 'les_dev_02',
    })
  })

  it('ouvre une carte de révision', () => {
    expect(parseHash('#/revision/fc_03')).toEqual({ tab: 'cards', cardId: 'fc_03' })
  })

  it('ouvre l’arcade et les fiches chiffrées', () => {
    expect(parseHash('#/arcade')).toEqual({ tab: 'arcade' })
    expect(parseHash('#/defis')).toEqual({ tab: 'arcade' })
    expect(parseHash('#/infos')).toEqual({ tab: 'facts', factId: undefined })
    expect(parseHash('#/infos/f_gsma_11')).toEqual({ tab: 'facts', factId: 'f_gsma_11' })
    expect(routePath({ tab: 'facts', factId: 'f_waka' })).toBe('#/infos/f_waka')
  })

  it('accepte les alias et retombe sur l’accueil', () => {
    expect(parseHash('#/profile')).toEqual({ tab: 'profile' })
    expect(parseHash('#/inconnu')).toEqual({ tab: 'home' })
  })

  it('génère un chemin stable', () => {
    const path = routePath({ tab: 'courses', courseId: 'c_eng_01', lessonId: 'les_eng_01' })
    expect(path).toBe('#/cours/c_eng_01/les_eng_01')
    expect(routePath(parseHash(path))).toBe(path)
  })
})
