import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon, type IconName } from './Icon'
import { initials, useApp } from '../store'

export function Card({
  children,
  className = '',
  onClick,
  style,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`card ${onClick ? 'card-tap' : ''} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {children}
    </div>
  )
}

export function Progress({ value, color }: { value: number; color?: string }) {
  return (
    <div className="progress" aria-hidden="true">
      <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  )
}

export function Chip({
  label,
  active = false,
  color,
  onClick,
  icon,
}: {
  label: string
  active?: boolean
  color?: string
  onClick?: () => void
  icon?: IconName
}) {
  return (
    <button
      type="button"
      className={`chip ${active ? 'chip-active' : ''}`}
      onClick={onClick}
      style={active && color ? { background: color, borderColor: color, color: '#fff' } : undefined}
    >
      {icon && <Icon name={icon} size={14} />}
      {label}
    </button>
  )
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  full = false,
  disabled = false,
  icon,
  type = 'button',
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'soft' | 'gold'
  full?: boolean
  disabled?: boolean
  icon?: IconName
  type?: 'button' | 'submit'
}) {
  return (
    <button type={type} className={`btn btn-${variant} ${full ? 'btn-full' : ''}`} onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} size={17} />}
      {children}
    </button>
  )
}

export function Avatar({ name, size = 42 }: { name: string; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  )
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {action && (
        <button type="button" className="link" onClick={onAction}>
          {action}
          <Icon name="next" size={13} />
        </button>
      )}
    </div>
  )
}

export function Stat({ icon, value, label, tone }: { icon: IconName; value: string; label: string; tone?: string }) {
  return (
    <div className="stat">
      <span className="stat-icon" style={tone ? { color: tone } : undefined}>
        <Icon name={icon} size={18} />
      </span>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    document.body.dataset.sheet = 'open'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      delete document.body.dataset.sheet
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const host = typeof document !== 'undefined' ? document.getElementById('sheet-root') : null

  const content = (
    <div className="overlay" onClick={onClose}>
      <div className={`sheet ${wide ? 'sheet-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        {title && (
          <div className="sheet-head">
            <h3>{title}</h3>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">
              <Icon name="close" size={19} />
            </button>
          </div>
        )}
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )

  return host ? createPortal(content, host) : content
}

export function scrollContentTop() {
  document.querySelector('.content')?.scrollTo({ top: 0 })
}

export function Toasts({ bottom = 84 }: { bottom?: number }) {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="toasts" style={{ bottom }} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.error ? 'toast-error' : ''}`} onClick={() => dismissToast(t.id)}>
          <Icon name={t.error ? 'close' : 'check'} size={16} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={26} />
      </span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}
