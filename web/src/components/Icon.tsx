import React from 'react'

export type IconName =
  | 'home' | 'book' | 'cards' | 'award' | 'globe' | 'moon' | 'sun' | 'flame'
  | 'back' | 'next' | 'play' | 'check' | 'close' | 'search' | 'briefcase'
  | 'kanban' | 'chat' | 'send' | 'user' | 'logout' | 'lock' | 'mail' | 'phone'
  | 'pin' | 'sparkles' | 'clock' | 'star' | 'shield' | 'download' | 'refresh'
  | 'chevron' | 'menu' | 'target' | 'users' | 'code' | 'live'
  | 'gamepad' | 'trophy' | 'bulb' | 'bolt' | 'info' | 'external' | 'pause' | 'trash'

const paths: Record<IconName, React.ReactNode> = {
  pause: <><rect x="8" y="5" width="3.4" height="14" rx="1.2" /><rect x="14" y="5" width="3.4" height="14" rx="1.2" /></>,
  trash: <><path d="M4 7h16" /><path d="M9.5 7V4.8h5V7" /><path d="M6.5 7l1 13h9l1-13" /></>,
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" /></>,
  cards: <><rect x="3" y="6" width="13" height="15" rx="2.5" /><path d="M8 3h8.5A2.5 2.5 0 0 1 19 5.5V17" /><path d="M6.5 12h6" /><path d="M6.5 16h4" /></>,
  award: <><circle cx="12" cy="9" r="5.5" /><path d="m8.2 13.6-1.7 7 5.5-3 5.5 3-1.7-7" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9Z" /></>,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" /></>,
  flame: <path d="M12 22c3.9 0 6.5-2.6 6.5-6.2 0-2.6-1.4-4.6-3.1-6.3-.6 1.6-1.6 2.4-2.6 2.9.3-2.8-1-5.6-3.3-7.4.2 3.1-3.9 5.2-3.9 10.2C5.6 19.2 8.2 22 12 22Z" />,
  back: <><path d="M15 19 8 12l7-7" /></>,
  next: <><path d="m9 5 7 7-7 7" /></>,
  play: <path d="M8 5.5v13l10-6.5-10-6.5Z" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  briefcase: <><rect x="3" y="7.5" width="18" height="12.5" rx="2.5" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" /><path d="M3 12.5h18" /></>,
  kanban: <><rect x="3" y="4" width="5" height="16" rx="1.6" /><rect x="9.5" y="4" width="5" height="10" rx="1.6" /><rect x="16" y="4" width="5" height="13" rx="1.6" /></>,
  chat: <><path d="M21 12a8.2 8.2 0 0 1-8.5 8.2 9.3 9.3 0 0 1-2.9-.5L4 21l1.4-4.1A8 8 0 0 1 3.5 12 8.2 8.2 0 0 1 12 3.8 8.2 8.2 0 0 1 21 12Z" /></>,
  send: <><path d="m4 4 17 8-17 8 3.2-8L4 4Z" /><path d="M7.2 12H21" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
  logout: <><path d="M9 21H6a2.5 2.5 0 0 1-2.5-2.5v-13A2.5 2.5 0 0 1 6 3h3" /><path d="M16 16.5 20.5 12 16 7.5" /><path d="M20 12H9" /></>,
  lock: <><rect x="4" y="10.5" width="16" height="10.5" rx="2.5" /><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.8 6.5 8.2 6 8.2-6" /></>,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.6a12 12 0 0 0 5.9 5.9l1.6-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />,
  pin: <><path d="M12 21s7-5.8 7-11a7 7 0 1 0-14 0c0 5.2 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>,
  sparkles: <><path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.7 10.4 12.2 5 10.6 10.4 9 12 3.5Z" /><path d="M18.5 16.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5.4l3.5 2.1" /></>,
  star: <path d="m12 3.5 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9L12 3.5Z" />,
  shield: <><path d="M12 3 20 6v5.5c0 4.6-3.3 7.9-8 9.5-4.7-1.6-8-4.9-8-9.5V6l8-3Z" /><path d="m8.6 12 2.3 2.3 4.5-4.6" /></>,
  download: <><path d="M12 4v11" /><path d="m7.5 11 4.5 4.5 4.5-4.5" /><path d="M4.5 20h15" /></>,
  refresh: <><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4.5V10h-5.5" /></>,
  chevron: <><path d="m6 9 6 6 6-6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
  users: <><circle cx="9" cy="8" r="3.6" /><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" /><path d="M16.5 5.2a3.5 3.5 0 0 1 0 6.6" /><path d="M17.8 14.4a6 6 0 0 1 3.4 5.6" /></>,
  code: <><path d="m8.5 8-4.5 4 4.5 4" /><path d="m15.5 8 4.5 4-4.5 4" /><path d="m13.5 5-3 14" /></>,
  live: <><circle cx="12" cy="12" r="2.6" /><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4" /><path d="M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" /></>,
  gamepad: <><path d="M7.5 8h9a5 5 0 0 1 4.8 6.4l-.6 2.1a2.6 2.6 0 0 1-4.4 1L14.8 16H9.2l-1.5 1.5a2.6 2.6 0 0 1-4.4-1l-.6-2.1A5 5 0 0 1 7.5 8Z" /><path d="M8 12.5h3M9.5 11v3" /><circle cx="15.5" cy="12" r=".9" /><circle cx="17.5" cy="14" r=".9" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 5H5.5a2.5 2.5 0 0 0 0 5H8M16 5h2.5a2.5 2.5 0 0 1 0 5H16" /><path d="M12 13v3M9 20h6M10 16h4l.8 4H9.2L10 16Z" /></>,
  bulb: <><path d="M9 17a6 6 0 1 1 6 0v2H9v-2Z" /><path d="M9.5 21h5" /><path d="M12 5.5a3.5 3.5 0 0 0-2 6.4" /></>,
  bolt: <path d="M13.5 2 5 13.5h5.5L10 22l8.5-11.5H13L13.5 2Z" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><circle cx="12" cy="7.8" r=".9" /></>,
  external: <><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7.5A1.5 1.5 0 0 1 5 6h4.5" /></>,
}

export function Icon({ name, size = 22, filled = false }: { name: IconName; size?: number; filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
