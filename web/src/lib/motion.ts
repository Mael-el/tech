/** Petits utilitaires d'animation partagés par l'interface. */
import { useEffect, useRef, useState } from 'react'

/** Respecte le réglage système « réduire les animations ». */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => prefersReducedMotion())

  useEffect(() => {
    if (!window.matchMedia) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t))

/** Compteur animé : part de la valeur courante pour rejoindre `target`. */
export function useCountUp(target: number, duration = 900, delay = 0): number {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(() => (reduced ? target : 0))
  const current = useRef(value)
  const frame = useRef<number | null>(null)
  const mounted = useRef(false)

  useEffect(() => {
    current.current = value
  }, [value])

  useEffect(() => {
    if (reduced) {
      setValue(target)
      return
    }
    const from = mounted.current ? current.current : 0
    if (from === target) return
    const wait = mounted.current ? 0 : delay
    mounted.current = true
    let start: number | null = null
    let timeout = 0

    const step = (now: number) => {
      if (start === null) start = now
      const progress = Math.min(1, (now - start) / duration)
      const eased = easeOutExpo(progress)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) frame.current = requestAnimationFrame(step)
    }

    timeout = window.setTimeout(() => {
      frame.current = requestAnimationFrame(step)
    }, wait)

    return () => {
      window.clearTimeout(timeout)
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [target, duration, delay, reduced])

  return value
}

const NUMERIC = /(-?\d(?:[\d\s\u00a0\u202f]*\d)?)/

/** Sépare un libellé en préfixe / valeur numérique / suffixe (« 1 234 XP »). */
export function splitNumeric(text: string): { before: string; value: number; after: string } | null {
  const match = text.match(NUMERIC)
  if (!match || match.index === undefined) return null
  const raw = Number(match[1].replace(/[\s\u00a0\u202f]/g, ''))
  if (Number.isNaN(raw)) return null
  return {
    before: text.slice(0, match.index),
    value: raw,
    after: text.slice(match.index + match[0].length),
  }
}

/** Révèle les blocs d'un écran quand ils entrent dans la zone visible. */
export function useScrollReveal(container: React.RefObject<HTMLElement | null>, key: string) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = container.current
    if (!root || reduced || typeof IntersectionObserver === 'undefined') return

    const scroller = root.classList.contains('content') ? root : root.querySelector('.content')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      },
      { root: scroller, rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    )

    let index = 0
    const tag = (node: Element) => {
      const element = node as HTMLElement
      if (element.dataset.reveal) return
      element.dataset.reveal = '1'
      element.style.setProperty('--i', String(Math.min(index, 10)))
      index += 1
      if (!element.classList.contains('no-reveal')) observer.observe(element)
    }

    const scan = () => {
      index = 0
      root.querySelectorAll('.screen > *').forEach(tag)
    }

    scan()
    const mutations = new MutationObserver((records) => {
      let added = false
      for (const record of records) if (record.addedNodes.length) added = true
      if (added) scan()
    })
    mutations.observe(root, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutations.disconnect()
    }
  }, [container, key, reduced])
}

/** Parallaxe douce : renvoie les décalages à appliquer aux halos du fond. */
export function useParallax(strength = 18): { x: number; y: number } {
  const reduced = useReducedMotion()
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (reduced) return
    let frame: number | null = null
    const onMove = (event: PointerEvent) => {
      if (frame !== null) return
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5
        const y = event.clientY / window.innerHeight - 0.5
        setOffset({ x: x * strength, y: y * strength })
        frame = null
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [strength, reduced])

  return offset
}
