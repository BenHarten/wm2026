import { useMemo } from 'react'
import { useGames } from '../hooks/useWorldCupData'
import { useLookups } from '../hooks/useLookups'
import { useLocale } from '../hooks/useLocale'
import { localizeLabel, type StringKey } from '../i18n/strings'
import { ErrorNote, SkeletonList } from '../components/Skeleton'
import { TeamFlag } from '../components/TeamFlag'
import type { Game, GameType } from '../api/types'

const rounds: { type: GameType; labelKey: StringKey }[] = [
  { type: 'r32', labelKey: 'roundOf32' },
  { type: 'r16', labelKey: 'roundOf16' },
  { type: 'qf', labelKey: 'quarterFinals' },
  { type: 'sf', labelKey: 'semiFinals' },
  { type: 'final', labelKey: 'final' },
]

function TeamRow({ game, side }: { game: Game; side: 'home' | 'away' }) {
  const { teamById } = useLookups()
  const { locale, teamName } = useLocale()
  const id = side === 'home' ? game.homeTeamId : game.awayTeamId
  const label = side === 'home' ? game.homeLabel : game.awayLabel
  const score = side === 'home' ? game.homeScore : game.awayScore
  const otherScore = side === 'home' ? game.awayScore : game.homeScore
  const team = teamById.get(id)
  const finished = game.status === 'finished'
  const winner = finished && score > otherScore

  return (
    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
      <span className="flex min-w-0 items-center gap-1.5">
        <TeamFlag src={team?.flag} alt="" className="h-3 w-4.5" />
        <span
          className={`truncate text-xs ${
            team ? (winner ? 'font-bold text-volt' : finished ? 'text-ink-dim' : 'font-medium') : 'text-ink-dim italic'
          }`}
        >
          {team ? teamName(team) : label ? localizeLabel(label, locale) : '–'}
        </span>
      </span>
      {game.status !== 'upcoming' && (
        <span className={`font-display text-sm ${winner ? 'text-volt' : 'text-ink-dim'}`}>
          {score}
        </span>
      )}
    </div>
  )
}

function KoCard({ game }: { game: Game }) {
  const { locale } = useLocale()
  const isLive = game.status === 'live'
  return (
    <div
      className={`overflow-hidden rounded-md border bg-pitch-800/70 ${
        isLive ? 'border-hot/50' : 'border-pitch-700/60'
      }`}
    >
      <div className="flex items-center justify-between border-b border-pitch-700/40 px-2.5 py-1 text-[9px] tracking-wider text-ink-dim uppercase">
        <span>
          {game.kickoff.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
            day: 'numeric',
            month: 'short',
          })}{' '}
          ·{' '}
          {game.kickoff.toLocaleTimeString(locale === 'de' ? 'de-DE' : 'en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {isLive && (
          <span className="flex items-center gap-1 font-bold text-hot">
            <span className="h-1 w-1 rounded-full bg-hot animate-pulse-dot" />
            {/^\d+$/.test(game.minute ?? '') ? `${game.minute}'` : 'LIVE'}
          </span>
        )}
      </div>
      <TeamRow game={game} side="home" />
      <div className="mx-2.5 border-t border-pitch-700/30" />
      <TeamRow game={game} side="away" />
    </div>
  )
}

export function Bracket() {
  const { data: games, isPending, isError, refetch } = useGames()
  const { tr } = useLocale()

  const byType = useMemo(() => {
    const map = new Map<GameType, Game[]>()
    games?.forEach((g) => {
      if (g.type === 'group') return
      const list = map.get(g.type) ?? []
      list.push(g)
      map.set(g.type, list)
    })
    return map
  }, [games])

  if (isPending) return <SkeletonList rows={6} />
  if (isError) return <ErrorNote message={tr('error')} onRetry={() => refetch()} retryLabel={tr('retry')} />

  return (
    <div className="-mx-3 overflow-x-auto px-3 pt-4 sm:-mx-4 sm:px-4">
      <div className="flex snap-x snap-mandatory gap-4 pb-4" style={{ minWidth: 'max-content' }}>
        {rounds.map(({ type, labelKey }) => {
          const list = byType.get(type) ?? []
          const third = type === 'final' ? (byType.get('third') ?? []) : []
          return (
            <section key={type} className="w-60 shrink-0 snap-start">
              <h2 className="mb-2 font-display text-sm tracking-widest text-volt uppercase">
                {tr(labelKey)}
              </h2>
              <div className="flex h-full flex-col justify-around gap-2.5 pb-10">
                {list.map((g) => (
                  <KoCard key={g.id} game={g} />
                ))}
                {third.length > 0 && (
                  <>
                    <h3 className="mt-4 font-display text-xs tracking-widest text-ink-dim uppercase">
                      {tr('thirdPlace')}
                    </h3>
                    {third.map((g) => (
                      <KoCard key={g.id} game={g} />
                    ))}
                  </>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
