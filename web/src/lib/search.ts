import type { Course, Flashcard, Lesson } from '../types'

export type SearchKind = 'cours' | 'leçon' | 'carte' | 'candidature' | 'projet' | 'fait' | 'page'

/** Données saisies par la personne : candidatures et projets suivis. */
export interface SearchApplication {
  id: string
  role: string
  company: string
  status: string
}

export interface SearchProject {
  id: string
  title: string
  note: string
  stage: string
}

export interface SearchEntry {
  id: string
  kind: SearchKind
  title: string
  subtitle: string
  path: string
  haystack: string
}

export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function buildIndex(
  courses: Course[],
  lessons: Lesson[],
  cards: Flashcard[],
  applications: SearchApplication[],
  projects: SearchProject[],
  courseTitle: (id: string) => string,
  domainLabel: (id: string) => string,
): SearchEntry[] {
  const entries: SearchEntry[] = []

  for (const course of courses) {
    entries.push({
      id: course.id,
      kind: 'cours',
      title: course.title,
      subtitle: `${domainLabel(course.domainId)} · ${course.instructorName}`,
      path: `#/cours/${course.id}`,
      haystack: normalize(`${course.title} ${course.description} ${course.instructorName} ${domainLabel(course.domainId)} ${course.level}`),
    })
  }

  for (const lesson of lessons) {
    entries.push({
      id: lesson.id,
      kind: 'leçon',
      title: lesson.title,
      subtitle: courseTitle(lesson.courseId),
      path: `#/cours/${lesson.courseId}/${lesson.id}`,
      haystack: normalize(`${lesson.title} ${lesson.contentMarkdown} ${courseTitle(lesson.courseId)}`),
    })
  }

  for (const card of cards) {
    entries.push({
      id: card.id,
      kind: 'carte',
      title: card.front,
      subtitle: `${domainLabel(card.domainId)} · flashcard`,
      path: `#/revision/${card.id}`,
      haystack: normalize(`${card.front} ${card.back} ${card.hint} ${domainLabel(card.domainId)}`),
    })
  }

  for (const application of applications) {
    entries.push({
      id: application.id,
      kind: 'candidature',
      title: `${application.role} — ${application.company}`,
      subtitle: `Candidature · ${application.status}`,
      path: '#/reseau',
      haystack: normalize(`${application.role} ${application.company} ${application.status} candidature`),
    })
  }

  for (const project of projects) {
    entries.push({
      id: project.id,
      kind: 'projet',
      title: project.title,
      subtitle: `Projet personnel · ${project.stage}`,
      path: '#/reseau',
      haystack: normalize(`${project.title} ${project.note} ${project.stage} projet`),
    })
  }

  return entries
}

export function searchEntries(entries: SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const q = normalize(query)
  if (!q) return []
  const terms = q.split(/\s+/).filter(Boolean)

  return entries
    .map((entry) => {
      let score = 0
      const title = normalize(entry.title)
      if (title === q) score += 120
      if (title.startsWith(q)) score += 60
      if (title.includes(q)) score += 30
      for (const term of terms) {
        if (title.includes(term)) score += 10
        if (entry.haystack.includes(term)) score += 4
      }
      return { entry, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((item) => item.entry)
}
