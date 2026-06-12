import { useEffect, useState } from 'react'
import { useLocale } from '../hooks/useLocale'

const DISMISS_KEY = 'wm2026.installDismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  )
}

function isIos(): boolean {
  const ua = navigator.userAgent
  // iPadOS masquerades as macOS but has touch
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

/** Home-screen shortcuts only make sense on mobile; desktop Chrome has its own omnibox install icon. */
function isMobile(): boolean {
  return /Android|Mobi/i.test(navigator.userAgent) || isIos()
}

export function InstallBanner() {
  const { tr } = useLocale()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')
  // iOS Safari: no programmatic install — show a one-time hint instead
  const [showIosHint] = useState(() => !isStandalone() && isIos())

  useEffect(() => {
    if (dismissed || isStandalone() || !isMobile()) return

    // Android/Chromium: capture the native prompt for our own button
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstallEvent(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [dismissed])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  const install = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') setInstallEvent(null)
    else dismiss()
  }

  if (dismissed || (!installEvent && !showIosHint)) return null

  return (
    <div className="rise-in fixed inset-x-0 bottom-[calc(3.6rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-3xl px-3 pb-2">
      <div className="flex items-center gap-3 rounded-lg border border-volt/40 bg-pitch-800/95 px-3 py-2.5 shadow-lg backdrop-blur-md">
        <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-volt" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5l3.5 2.5-1.3 4.1h-4.4L8.5 9.5z" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{tr('installTitle')}</p>
          <p className="truncate text-[11px] text-ink-dim">
            {installEvent ? tr('installBody') : tr('installIosHint')}
          </p>
        </div>
        {installEvent && (
          <button
            onClick={install}
            className="shrink-0 rounded-md bg-volt px-3 py-1.5 text-xs font-bold text-pitch-950"
          >
            {tr('installButton')}
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label={tr('dismiss')}
          className="shrink-0 p-1 text-ink-dim hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
