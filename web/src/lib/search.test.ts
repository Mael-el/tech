import { describe, expect, it } from 'vitest'
import { buildIndex, normalize, searchEntries } from './search'
import type { Course, Flashcard, Lesson } from '../types'

const course = (id: string, title: string, description = ''): Course => ({
  id, domainId: 'dev', title, description, instructorName: 'Amina Diallo', level: 'Intermédiaire',
  durationHours: 20, progressPercent: 0, isEnrolled: false, isCompleted: false, modulesCount: 4,
  rating: 4.8, nextSessionFata: null,
})

const lesson = (id: string, courseId: string, title: string, content = ''): Lesson => ({
  id, courseId, title, contentMarkdown: content, durationMinutes: 20, orderIndex: 1, isCompleted: false,
  quizQuestion: '', options: [], quizCorrectIndex: 0, quizExplanation: '',
})

const index = buildIndex(
  [course('c_dev', 'Architecture Kotlin & Compose'), course('c_math', 'Probabilités, Statistiques & Algèbre')],
  [lesson('l1', 'c_math', '1. Théorème de Bayes', 'précision et prévalence')],
  [{ id: 'fc_1', domainId: 'dev', front: 'Clé d’idempotence', back: 'évite le double débit', hint: '', easeFactor: 2.5, intervalDays: 1, repetitions: 0 }] as Flashcard[],
  [{ id: 'app_1', role: 'Ingénieur Android', company: 'Wave', status: 'Entretien' }],
  [{ id: 'proj_1', title: 'KiliPay', note: 'paiement mobile', stage: 'en cours' }],
  (id) => (id === 'c_math' ? 'Probabilités, Statistiques & Algèbre' : 'Architecture Kotlin & Compose'),
  (id) => (id === 'dev' ? 'Développement' : 'Mathématiques'),
)

describe('normalisation', () => {
  it('ignore accents et casse', () => {
    expect(normalize('Sécurité Défensive')).toBe('securite defensive')
  })
})

describe('recherche globale', () => {
  it('trouve une leçon par son contenu', () => {
    const results = searchEntries(index, 'bayes')
    expect(results[0]?.id).toBe('l1')
    expect(results[0]?.path).toBe('#/cours/c_math/l1')
  })

  it('trouve un cours sans accent', () => {
    const results = searchEntries(index, 'probabilites')
    expect(results.some((entry) => entry.id === 'c_math')).toBe(true)
  })

  it('classe le titre exact avant le contenu', () => {
    const results = searchEntries(index, 'idempotence')
    expect(results[0]?.kind).toBe('carte')
  })

  it('retrouve une candidature suivie', () => {
    const results = searchEntries(index, 'wave')
    expect(results.some((entry) => entry.id === 'app_1' && entry.kind === 'candidature')).toBe(true)
  })

  it('retrouve un projet personnel par sa note', () => {
    const results = searchEntries(index, 'paiement mobile')
    expect(results.some((entry) => entry.id === 'proj_1' && entry.kind === 'projet')).toBe(true)
  })

  it('renvoie une liste vide sans requête', () => {
    expect(searchEntries(index, '   ')).toEqual([])
    expect(searchEntries(index, 'zzzz')).toEqual([])
  })
})
