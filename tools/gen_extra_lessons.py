"""Génère app/src/main/java/com/example/data/local/ExtraLessons.kt

Source de vérité : web/src/data/extra-lessons.json (contenu commun à l'aperçu web
et à l'application Android). Les deux plateformes restent ainsi alignées.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
lessons = json.loads((ROOT / 'web/src/data/extra-lessons.json').read_text(encoding='utf-8'))


def kstr(value: str) -> str:
    return '"' + value.replace('\\', '\\\\').replace('"', '\\"').replace('$', '\\$') + '"'


blocks = []
for lesson in lessons:
    options = '|'.join(lesson['options']).replace('$', '\\$')
    blocks.append(f"""  LessonEntity(
    id = {kstr(lesson['id'])},
    courseId = {kstr(lesson['courseId'])},
    title = {kstr(lesson['title'])},
    durationMinutes = {lesson['durationMinutes']},
    orderIndex = {lesson['orderIndex']},
    contentMarkdown = {kstr(lesson['contentMarkdown'])},
    isCompleted = false,
    quizQuestion = {kstr(lesson['quizQuestion'])},
    quizOptionsSerialized = {kstr(options)},
    quizCorrectIndex = {lesson['quizCorrectIndex']},
    quizExplanation = {kstr(lesson['quizExplanation'])}
  )""")

kotlin = """package com.example.data.local

/**
 * Leçons complémentaires (contenu commun avec l'aperçu web).
 *
 * Fichier GÉNÉRÉ par tools/gen_extra_lessons.py depuis
 * web/src/data/extra-lessons.json — ne pas modifier à la main.
 * Régénérer avec : python3 tools/gen_extra_lessons.py
 */
val extraLessons: List<LessonEntity> = listOf(
""" + ",\n".join(blocks) + "\n)\n"

target = ROOT / 'app/src/main/java/com/example/data/local/ExtraLessons.kt'
target.write_text(kotlin, encoding='utf-8')
print(f'{len(lessons)} leçons écrites dans {target.relative_to(ROOT)}')
