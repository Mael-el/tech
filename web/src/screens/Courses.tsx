import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Btn, Card, Chip, EmptyState, Progress, SectionTitle } from '../components/ui'
import { courseById, domainById, lessonsFor, seed, useApp } from '../store'
import type { Course, Lesson } from '../types'

export function CoursesScreen({
  courseId,
  lessonId,
  onOpenCourse,
  onOpenLesson,
  onBack,
  onOpenLive,
}: {
  courseId: string | null
  lessonId: string | null
  onOpenCourse: (id: string) => void
  onOpenLesson: (courseId: string, lessonId: string) => void
  onBack: () => void
  onOpenLive: (title: string, instructor: string) => void
}) {
  const { state, dispatch, notify } = useApp()
  const [domain, setDomain] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const course: Course | null = courseId ? courseById(courseId) ?? null : null
  const lesson: Lesson | null = lessonId ? seed.lessons.find((l) => l.id === lessonId) ?? null : null

  useEffect(() => {
    setSelected(null)
    setSubmitted(false)
  }, [lessonId])

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

  const submitQuiz = () => {
    if (!lesson || selected === null || submitted) return
    setSubmitted(true)
    const isCorrect = selected === lesson.quizCorrectIndex
    dispatch({ type: 'QUIZ_ANSWER', correct: isCorrect })
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
    const note = state.notes[lesson.id] ?? ''
    const isFavorite = state.favorites.courses.includes(lesson.courseId)

    return (
      <div className="screen lesson">
        <div className="lesson-top">
          <button type="button" className="icon-btn" onClick={() => onOpenCourse(lesson.courseId)} aria-label="Retour au cours">
            <Icon name="back" size={20} />
          </button>
          <div>
            <span className="eyebrow">{domainById(courseOfLesson.domainId).label}</span>
            <strong>{courseOfLesson.title}</strong>
          </div>
          <button
            type="button"
            className={`icon-btn ${isFavorite ? 'fav-on' : ''}`}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            onClick={() => {
              dispatch({ type: 'TOGGLE_FAV_COURSE', courseId: lesson.courseId })
              notify(isFavorite ? 'Cours retiré des favoris.' : 'Cours ajouté aux favoris.')
            }}
          >
            <Icon name="star" size={18} filled={isFavorite} />
          </button>
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
                <Btn full icon="next" onClick={() => onOpenLesson(next.courseId, next.id)}>
                  Leçon suivante
                </Btn>
              )}
              {isCorrect && !next && (
                <Btn full icon="check" onClick={() => onOpenCourse(lesson.courseId)}>
                  Terminer le cours
                </Btn>
              )}
            </div>
          )}
        </Card>

        <Card className="notes">
          <div className="notes-head">
            <span className="eyebrow"><Icon name="code" size={13} /> Mes notes</span>
            <span className="muted small">{note.length} caractères · sauvegarde locale</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => dispatch({ type: 'SET_NOTE', lessonId: lesson.id, text: e.target.value })}
            placeholder="Idée clé, exemple à retenir, question à poser au mentor…"
            rows={3}
          />
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
    const favorite = state.favorites.courses.includes(course.id)
    const completed = lessons.filter((l) => state.completedLessons.includes(l.id)).length
    const nextLesson = lessons.find((l) => !state.completedLessons.includes(l.id))

    return (
      <div className="screen">
        <div className="detail-actions">
          <button type="button" className="back-link" onClick={onBack}>
            <Icon name="back" size={16} /> Tous les cours
          </button>
          <button
            type="button"
            className={`icon-btn ${favorite ? 'fav-on' : ''}`}
            aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            onClick={() => {
              dispatch({ type: 'TOGGLE_FAV_COURSE', courseId: course.id })
              notify(favorite ? 'Cours retiré des favoris.' : 'Cours ajouté aux favoris.')
            }}
          >
            <Icon name="star" size={18} filled={favorite} />
          </button>
        </div>

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
            <div className="course-cta">
              <p className="enrolled-note">
                <Icon name="check" size={14} /> Inscrit · {completed}/{lessons.length} leçons validées
              </p>
              {nextLesson && (
                <Btn full icon="play" onClick={() => onOpenLesson(course.id, nextLesson.id)}>
                  {completed > 0 ? 'Continuer le cours' : 'Commencer la première leçon'}
                </Btn>
              )}
            </div>
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
            text="Ce cours fait partie du catalogue de démonstration : ses leçons n'ont pas encore été rédigées."
          />
        ) : (
          <div className="lessons">
            {lessons.map((l) => {
              const done = state.completedLessons.includes(l.id)
              return (
                <button key={l.id} type="button" className="lesson-row" onClick={() => onOpenLesson(course.id, l.id)}>
                  <span className={`lesson-index ${done ? 'done' : ''}`}>
                    {done ? <Icon name="check" size={15} /> : l.orderIndex}
                  </span>
                  <span className="lesson-row-body">
                    <strong>{l.title}</strong>
                    <small>
                      {l.durationMinutes} min · quiz (+50 XP)
                      {state.notes[l.id] ? ' · note' : ''}
                    </small>
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
        <p>
          {seed.courses.length} cours · {seed.domains.length} domaines · {seed.lessons.length} leçons
        </p>
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

      {state.favorites.courses.length > 0 && !search && !domain && (
        <Card className="fav-strip">
          <span className="eyebrow"><Icon name="star" size={12} /> Favoris</span>
          <div className="chip-row">
            {state.favorites.courses.map((id) => {
              const c = courseById(id)
              if (!c) return null
              return (
                <Chip key={id} label={c.title} onClick={() => onOpenCourse(id)} />
              )
            })}
          </div>
        </Card>
      )}

      <div className="stack">
        {courses.map((c) => {
          const d = domainById(c.domainId)
          const progress = state.progress[c.id] ?? 0
          const lessons = lessonsFor(c.id).length
          const doneLessons = lessonsFor(c.id).filter((l) => state.completedLessons.includes(l.id)).length
          return (
            <Card
              key={c.id}
              className="course-card"
              onClick={() => onOpenCourse(c.id)}
              style={{ borderLeftColor: d.color }}
            >
              <div className="course-card-body">
                <div className="course-card-top">
                  <span className="eyebrow" style={{ color: d.color }}>{d.label}</span>
                  {state.favorites.courses.includes(c.id) && <Icon name="star" size={14} filled />}
                </div>
                <h3>{c.title}</h3>
                <p>{c.instructorName} · {c.durationHours} h · {c.level}</p>
                <div className="course-card-meta">
                  <span><Icon name="star" size={13} filled /> {c.rating.toFixed(1)}</span>
                  <span><Icon name="book" size={13} /> {doneLessons}/{lessons} leçons</span>
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
