import { describe, expect, it } from 'vitest'
import { APPLICATION_STATUSES, JOB_BOARDS, PROJECT_STAGES, PROJECT_STAGE_LABELS } from './user-projects'

describe('suivi de candidatures', () => {
  it('propose les cinq statuts dans l’ordre du parcours', () => {
    expect(APPLICATION_STATUSES).toEqual(['À postuler', 'Envoyée', 'Entretien', 'Offre', 'Refus'])
  })

  it('ne duplique aucun statut', () => {
    expect(new Set(APPLICATION_STATUSES).size).toBe(APPLICATION_STATUSES.length)
  })
})

describe('projets personnels', () => {
  it('couvre les trois étapes avec un libellé français', () => {
    expect(PROJECT_STAGES).toEqual(['idée', 'en cours', 'terminé'])
    expect(PROJECT_STAGE_LABELS['en cours']).toBe('En cours')
  })
})

describe('job boards', () => {
  it('pointe vers des sites réels en https', () => {
    expect(JOB_BOARDS.length).toBeGreaterThanOrEqual(5)
    for (const board of JOB_BOARDS) {
      expect(board.url.startsWith('https://')).toBe(true)
      expect(board.description.length).toBeGreaterThan(20)
    }
  })

  it('n’expose aucune URL de démonstration', () => {
    expect(JOB_BOARDS.some((board) => /example|demo|test\./i.test(board.url))).toBe(false)
  })
})
