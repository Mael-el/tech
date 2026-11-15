import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './Icon'
import { courseById, domainById, seed, useApp } from '../store'
import { buildIndex, searchEntries, type SearchEntry } from '../lib/search'

const KIND_ICON: Record<string, React.ComponentProps<typeof Icon>['name']> = {
  cours: 'book',
  leçon: 'play',
  carte: 'cards',
  emploi: 'briefcase',
  projet: 'kanban',
}

export function CommandPalette({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean
  onClose: () => void
  onNavigate: (path: string) => void
}) {
  const { state } = useApp()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const index = useMemo(
    () =>
      buildIndex(
        seed.courses,
        seed.lessons,
        [...seed.flashcards, ...state.customCards],
        seed.jobs,
        seed.projects,
        (id) => courseById(id)?.title ?? '',
        (id) => domainById(id).label,
      ),
    [state.customCards],
  )

  const results = useMemo(() => searchEntries(index, query, 9), [index, query])

  const suggestions = useMemo<SearchEntry[]>(
    () =>
      seed.courses
        .filter((c) => state.enrolled.includes(c.id))
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          kind: 'cours',
          title: c.title,
          subtitle: `Reprendre · ${domainById(c.domainId).label}`,
          path: `#/cours/${c.id}`,
          haystack: '',
        })),
    [state.enrolled],
  )

  const items = query ? results : suggestions

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [query])

  if (!open) return null

  const go = (entry: SearchEntry) => {
    onNavigate(entry.path)
    onClose()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (items.length ? (i + 1) % items.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (items.length ? (i - 1 + items.length) % items.length : 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (items[active]) go(items[active])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Recherche globale">
        <div className="palette-input">
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Rechercher un cours, une leçon, une carte, un emploi…"
            aria-label="Rechercher"
          />
          <kbd>esc</kbd>
        </div>

        <div className="palette-list">
          {!query && <p className="palette-hint">Reprendre l'apprentissage</p>}
          {items.map((entry, i) => (
            <button
              key={`${entry.kind}-${entry.id}`}
              type="button"
              className={`palette-item ${i === active ? 'active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(entry)}
            >
              <span className="palette-icon">
                <Icon name={KIND_ICON[entry.kind] ?? 'search'} size={16} />
              </span>
              <span className="palette-text">
                <strong>{entry.title}</strong>
                <small>{entry.subtitle}</small>
              </span>
              <span className="palette-kind">{entry.kind}</span>
            </button>
          ))}
          {query && items.length === 0 && (
            <p className="palette-empty">
              Aucun résultat pour « {query} ». Essayez « Kotlin », « Bayes », « Mobile Money »…
            </p>
          )}
        </div>

        <div className="palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span>
          <span><kbd>↵</kbd> ouvrir</span>
          <span><kbd>esc</kbd> fermer</span>
        </div>
      </div>
    </div>
  )
}
