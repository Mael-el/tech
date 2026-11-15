import type { Course, Flashcard, Job, Lesson, Project } from '../types'

export type SearchKind = 'cours' | 'leçon' | 'carte' | 'emploi' | 'projet' | 'fait' | 'page'

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
  jobs: Job[],
  projects: Project[],
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

  for (const job of jobs) {
    entries.push({
      id: job.id,
      kind: 'emploi',
      title: job.title,
      subtitle: `${job.companyName} · ${job.location}`,
      path: '#/reseau',
      haystack: normalize(`${job.title} ${job.companyName} ${job.description} ${job.requirements} ${job.location} ${domainLabel(job.domainId)}`),
    })
  }

  for (const project of projects) {
    entries.push({
      id: project.id,
      kind: 'projet',
      title: project.title,
      subtitle: `${domainLabel(project.domainId)} · ${project.mentorName}`,
      path: '#/reseau',
      haystack: normalize(`${project.title} ${project.description} ${project.mentorName} ${project.targetKpi}`),
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
