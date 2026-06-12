import { useEffect, useMemo, useRef } from 'react'
import { useGames } from '../hooks/useWorldCupData'
import { useLookups } from '../hooks/useLookups'
import { useLocale } from '../hooks/useLocale'
import { MatchCard } from '../components/MatchCard'
import { ErrorNote, SkeletonList } from '../components/Skeleton'
import type { Game } from '../api/types'

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function Matches() {
  const { data: games, isPending, isError, refetch } = useGames()
  const { teamById, stadiumById } = useLookups()
  const { locale, tr } = useLocale()
  const todayRef = useRef<HTMLDivElement>(null)
  const didScroll = useRef(false)

  const { live, days } = useMemo(() => {
    const live = games?.filter((g) => g.status === 'live') ?? []
    const days = new Map<string, Game[]>()
    games?.forEach((g) => {
      const key = dayKey(g.kickoff)
      const list = days.get(key) ?? []
      list.push(g)
      days.set(key, list)
    })
    return { live, days }
  }, [games])

  const todayKey = dayKey(new Date())

  useEffect(() => {
    if (games && !didScroll.current && todayRef.current) {
      didScroll.current = true
      todayRef.current.scrollIntoView({ block: 'start' })
      // compensate for the sticky header
      window.scrollBy(0, -110)
    }
  }, [games])

  if (isPending) return <SkeletonList rows={8} />
  if (isError) return <ErrorNote message={tr('error')} onRetry={() => refetch()} retryLabel={tr('retry')} />

  const dayLabel = (key: string, sample: Game) => {
    const today = new Date()
    const rel = new Date(today)
    if (key === dayKey(today)) return tr('today')
    rel.setDate(today.getDate() + 1)
    if (key === dayKey(rel)) return tr('tomorrow')
    rel.setDate(today.getDate() - 1)
    if (key === dayKey(rel)) return tr('yesterday')
    return sample.kickoff.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="space-y-5 pt-4">
      {live.length > 0 && (
        <section aria-label={tr('live')}>
          <h2 className="mb-2 flex items-center gap-2 font-display text-sm tracking-widest text-hot uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-hot animate-pulse-dot" />
            {tr('live')}
          </h2>
          <div className="space-y-2">
            {live.map((g) => (
              <MatchCard key={g.id} game={g} teamById={teamById} stadiumById={stadiumById} />
            ))}
          </div>
        </section>
      )}

      {[...days.entries()].map(([key, dayGames]) => (
        <section key={key} ref={key === todayKey ? todayRef : undefined}>
          <h2
            className={`sticky top-[88px] z-30 -mx-3 mb-2 border-b border-pitch-700/40 bg-pitch-950/95 px-3 py-1.5 font-display text-sm tracking-widest uppercase backdrop-blur-sm sm:-mx-4 sm:px-4 ${
              key === todayKey ? 'text-volt' : 'text-ink-dim'
            }`}
          >
            {dayLabel(key, dayGames[0])}
          </h2>
          <div className="space-y-2">
            {dayGames.map((g) => (
              <MatchCard key={g.id} game={g} teamById={teamById} stadiumById={stadiumById} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
