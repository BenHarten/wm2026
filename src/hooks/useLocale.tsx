/* eslint-disable react-refresh/only-export-components -- context module: provider + hook belong together */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { t, type Locale, type StringKey } from '../i18n/strings'
import type { RawTeam } from '../api/types'

const STORAGE_KEY = 'wm2026.locale'

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  /** Translate a UI string. */
  tr: (key: StringKey) => string
  /** Localized team name via Intl.DisplayNames, falling back to name_en. */
  teamName: (team: RawTeam | undefined) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function initialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'de') return stored
  return navigator.language.startsWith('de') ? 'de' : 'en'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l)
    setLocaleState(l)
  }, [])

  const value = useMemo<LocaleContextValue>(() => {
    const displayNames = (() => {
      try {
        return new Intl.DisplayNames([locale], { type: 'region' })
      } catch {
        return null
      }
    })()
    return {
      locale,
      setLocale,
      tr: (key) => t(key, locale),
      teamName: (team) => {
        if (!team) return '–'
        // iso2 like "GB-SCT" or "SCO" won't resolve as a region — fall back.
        const iso = team.iso2?.toUpperCase()
        if (displayNames && iso && /^[A-Z]{2}$/.test(iso)) {
          try {
            const name = displayNames.of(iso)
            if (name && name !== iso) return name
          } catch {
            /* fall through */
          }
        }
        return team.name_en
      },
    }
  }, [locale, setLocale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
