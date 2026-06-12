import { NavLink } from 'react-router-dom'
import { useLocale } from '../hooks/useLocale'
import type { StringKey } from '../i18n/strings'

const tabs: { to: string; labelKey: StringKey; icon: string }[] = [
  // simple inline SVG paths keep the bundle tiny
  { to: '/', labelKey: 'tabMatches', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5l3.5 2.5-1.3 4.1h-4.4L8.5 9.5z' },
  { to: '/groups', labelKey: 'tabGroups', icon: 'M3 5h18v3H3zm0 5.5h18v3H3zM3 16h18v3H3z' },
  { to: '/bracket', labelKey: 'tabBracket', icon: 'M4 4h6v4H4zm0 12h6v4H4zm10-6h6v4h-6zM10 6h2v3h2v6h-2v3h-2z' },
]

export function TabBar() {
  const { tr } = useLocale()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-pitch-700/60 bg-pitch-900/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-3xl">
        {tabs.map(({ to, labelKey, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold tracking-wide transition-colors ${
                isActive ? 'text-volt' : 'text-ink-dim hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d={icon} />
                </svg>
                <span className={isActive ? 'underline decoration-volt decoration-2 underline-offset-4' : ''}>
                  {tr(labelKey)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
