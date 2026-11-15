import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Btn, Card, Chip, EmptyState, Progress, SectionTitle, scrollContentTop } from '../components/ui'
import {
  courseById,
  domainById,
  lessonsFor,
  seed,
  useApp,
} from '../store'
import type { Course, Lesson } from '../types'

export function CoursesScreen({
  openCourseId,
  onCourseConsumed,
  onImmersive,
  onOpenLive,
}: {
  openCourseId: string | null
  onCourseConsumed: () => void
  onImmersive: (value: boolean) => void
  onOpenLive: (title: string, instructor: string) => void
}) {
  const { state, dispatch, notify } = useApp()
  const [domain, setDomain] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [course, setCourse] = useState<Course | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!openCourseId) return
    const target = courseById(openCourseId)
    if (target) {
      setCourse(target)
      setLesson(null)
      setDomain(null)
      setSearch('')
      onCourseConsumed()
    }
  }, [openCourseId, onCourseConsumed])

  useEffect(() => {
    scrollContentTop()
  }, [course, lesson])

  useEffect(() => {
    onImmersive(Boolean(lesson))
    return () => onImmersive(false)
  }, [lesson, onImmersive])

  const courses = useMemo(() => {
    const q = search.trim().toLowerCase()
    return seed.courses.filter((c) => {
      const matchDomain = !domain || c.domainId === domain
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q) ||
        domainById(c.domainId).label.toLowerCase().includes(q)
      return matchDomain && matchQuery
    })
  }, [domain, search])

  const closeCourse = () => {
    setCourse(null)
    setLesson(null)
  }

  const openLesson = (l: Lesson) => {
    setLesson(l)
    setSelected(null)
    setSubmitted(false)
  }

  const submitQuiz = () => {
    if (!lesson || selected === null || submitted) return
    setSubmitted(true)
    const isCorrect = selected === lesson.quizCorrectIndex
    if (isCorrect) {
      const already = state.completedLessons.includes(lesson.id)
      dispatch({ type: 'COMPLETE_LESSON', lessonId: lesson.id, courseId: lesson.courseId })
      notify(already ? 'Leçon déjà validée — révision enregistrée.' : 'Bonne réponse ! +50 XP')
    } else {
      notify("Réponse incorrecte. Lisez l'explication et réessayez.", true)
    }
  }

  /* ----------------------------- Leçon ----------------------------- */
  if (lesson) {
    const courseOfLesson = courseById(lesson.courseId)!
    const lessons = lessonsFor(lesson.courseId)
    const index = lessons.findIndex((l) => l.id === lesson.id)
    const next = lessons[index + 1]
    const isCorrect = submitted && selected === lesson.quizCorrectIndex
    const isWrong = submitted && selected !== lesson.quizCorrectIndex
    const isDone = state.completedLessons.includes(lesson.id)

    return (
      <div className="screen lesson">
        <div className="lesson-top">
          <button type="button" className="icon-btn" onClick={() => setLesson(null)} aria-label="Retour au cours">
            <Icon name="back" size={20} />
          </button>
          <div>
            <span className="eyebrow">{domainById(courseOfLesson.domainId).label}</span>
            <strong>{courseOfLesson.title}</strong>
          </div>
          {isDone && <span className="done-pill"><Icon name="check" size={13} /> validée</span>}
        </div>

        <h1 className="lesson-title">{lesson.title}</h1>
        <p className="lesson-meta">
          <Icon name="clock" size={14} /> {lesson.durationMinutes} min · Leçon {index + 1}/{lessons.length}
        </p>

        <Card className="lesson-content">
          <p>{lesson.contentMarkdown}</p>
        </Card>

        <Card className="quiz">
          <div className="quiz-head">
            <span className="quiz-badge"><Icon name="target" size={15} /> Quiz</span>
            <span className="quiz-xp">+50 XP</span>
          </div>
          <h3>{lesson.quizQuestion}</h3>
          <div className="options">
            {lesson.options.map((option, i) => {
              const chosen = selected === i
              const good = submitted && i === lesson.quizCorrectIndex
              const bad = submitted && chosen && i !== lesson.quizCorrectIndex
              return (
                <button
                  key={option}
                  type="button"
                  disabled={submitted}
                  className={`option ${chosen ? 'chosen' : ''} ${good ? 'good' : ''} ${bad ? 'bad' : ''}`}
                  onClick={() => setSelected(i)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                  <span>{option}</span>
                  {good && <Icon name="check" size={17} />}
                  {bad && <Icon name="close" size={17} />}
                </button>
              )
            })}
          </div>

          {submitted && (
            <div className={`quiz-feedback ${isCorrect ? 'ok' : 'ko'}`}>
              <strong>{isCorrect ? 'Correct' : 'Pas encore'}</strong>
              <p>{lesson.quizExplanation}</p>
            </div>
          )}

          {!submitted ? (
            <Btn full onClick={submitQuiz} disabled={selected === null}>
              Valider ma réponse
            </Btn>
          ) : (
            <div className="quiz-actions">
              {isWrong && (
                <Btn
                  variant="soft"
                  full
                  icon="refresh"
                  onClick={() => {
                    setSubmitted(false)
                    setSelected(null)
                  }}
                >
                  Réessayer
                </Btn>
              )}
              {isCorrect && next && (
                <Btn full icon="next" onClick={() => openLesson(next)}>
                  Leçon suivante
                </Btn>
              )}
              {isCorrect && !next && (
                <Btn full icon="check" onClick={() => setLesson(null)}>
                  Terminer le cours
                </Btn>
              )}
            </div>
          )}
        </Card>

        {isDone && !isCorrect && (
          <p className="lesson-done-note"><Icon name="check" size={14} /> Cette leçon est déjà validée.</p>
        )}
      </div>
    )
  }

  /* -------------------------- Détail cours -------------------------- */
  if (course) {
    const lessons = lessonsFor(course.id)
    const domainInfo = domainById(course.domainId)
    const enrolled = state.enrolled.includes(course.id)
    const progress = state.progress[course.id] ?? 0

    return (
      <div className="screen">
        <button type="button" className="back-link" onClick={closeCourse}>
          <Icon name="back" size={16} /> Tous les cours
        </button>

        <div className="course-hero" style={{ background: `linear-gradient(135deg, ${domainInfo.color}, ${domainInfo.color}cc)` }}>
          <span className="course-hero-domain">{domainInfo.label}</span>
          <h1>{course.title}</h1>
          <p>{course.instructorName}</p>
          <div className="course-hero-meta">
            <span><Icon name="star" size={14} filled /> {course.rating.toFixed(1)}</span>
            <span><Icon name="clock" size={14} /> {course.durationHours} h</span>
            <span><Icon name="book" size={14} /> {course.modulesCount} modules</span>
            <span><Icon name="users" size={14} /> {course.level}</span>
          </div>
        </div>

        <Card>
          <p className="muted">{course.description}</p>
          <div className="resume-progress">
            <Progress value={progress} color={domainInfo.color} />
            <strong>{progress}%</strong>
          </div>
          {!enrolled ? (
            <Btn
              full
              icon="check"
              onClick={() => {
                dispatch({ type: 'ENROLL', courseId: course.id })
                notify('Inscription au cours confirmée.')
              }}
            >
              S'inscrire à ce cours
            </Btn>
          ) : (
            <p className="enrolled-note"><Icon name="check" size={14} /> Vous êtes inscrit à ce cours.</p>
          )}
        </Card>

        {course.nextSessionFata && (
          <Card className="fata-row" onClick={() => onOpenLive(course.title, course.instructorName)}>
            <span className="live-icon"><Icon name="live" size={18} /></span>
            <div>
              <strong>Classe virtuelle FATA</strong>
              <p>{course.nextSessionFata} · {course.instructorName}</p>
            </div>
            <Icon name="next" size={17} />
          </Card>
        )}

        <SectionTitle title={`Programme · ${lessons.length} leçon${lessons.length > 1 ? 's' : ''}`} />
        {lessons.length === 0 ? (
          <EmptyState
            icon="book"
            title="Contenu en préparation"
            text="Ce cours fait partie du catalogue de démonstration : ses leçons n'ont pas encore été rédigées dans l'app Android."
          />
        ) : (
          <div className="lessons">
            {lessons.map((l) => {
              const done = state.completedLessons.includes(l.id)
              return (
                <button key={l.id} type="button" className="lesson-row" onClick={() => openLesson(l)}>
                  <span className={`lesson-index ${done ? 'done' : ''}`}>
                    {done ? <Icon name="check" size={15} /> : l.orderIndex}
                  </span>
                  <span className="lesson-row-body">
                    <strong>{l.title}</strong>
                    <small>{l.durationMinutes} min · quiz (+50 XP)</small>
                  </span>
                  <Icon name="next" size={16} />
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  /* ---------------------------- Catalogue ---------------------------- */
  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Cours &amp; domaines</h1>
        <p>{seed.courses.length} cours · {seed.domains.length} domaines · contenu bilingue</p>
      </header>

      <div className="input-wrap search">
        <Icon name="search" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un cours, un mentor…"
        />
      </div>

      <div className="chip-row">
        <Chip label="Tous" active={!domain} onClick={() => setDomain(null)} />
        {seed.domains.map((d) => (
          <Chip
            key={d.id}
            label={d.label}
            color={d.color}
            active={domain === d.id}
            onClick={() => setDomain(domain === d.id ? null : d.id)}
          />
        ))}
      </div>

      <div className="stack">
        {courses.map((c) => {
          const d = domainById(c.domainId)
          const progress = state.progress[c.id] ?? 0
          const lessons = lessonsFor(c.id).length
          return (
            <Card
              key={c.id}
              className="course-card"
              onClick={() => setCourse(c)}
              style={{ borderLeftColor: d.color }}
            >
              <div className="course-card-body">
                <span className="eyebrow" style={{ color: d.color }}>{d.label}</span>
                <h3>{c.title}</h3>
                <p>{c.instructorName} · {c.durationHours} h · {c.level}</p>
                <div className="course-card-meta">
                  <span><Icon name="star" size={13} filled /> {c.rating.toFixed(1)}</span>
                  <span><Icon name="book" size={13} /> {lessons} leçon{lessons > 1 ? 's' : ''}</span>
                  {state.enrolled.includes(c.id) && (
                    <span className="enrolled-tag"><Icon name="check" size={12} /> inscrit</span>
                  )}
                </div>
                {progress > 0 && <Progress value={progress} color={d.color} />}
              </div>
            </Card>
          )
        })}
        {courses.length === 0 && (
          <EmptyState icon="search" title="Aucun cours trouvé" text="Essayez un autre mot-clé ou retirez le filtre de domaine." />
        )}
      </div>
    </div>
  )
}
