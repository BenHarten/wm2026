import { useState } from 'react'
import { STADIUM_TZ } from '../api/timezone'
import type { Game, RawStadium, RawTeam } from '../api/types'
import { useLocale } from '../hooks/useLocale'
import { localizeLabel } from '../i18n/strings'
import { TeamFlag } from './TeamFlag'

interface Props {
  game: Game
  teamById: Map<string, RawTeam>
  stadiumById: Map<string, RawStadium>
}

function ScorerList({ scorers, align }: { scorers: string[]; align: 'left' | 'right' }) {
  if (scorers.length === 0) return <div />
  return (
    <ul className={`space-y-0.5 text-[11px] text-ink-dim ${align === 'right' ? 'text-right' : ''}`}>
      {scorers.map((s, i) => (
        <li key={i}>⚽ {s}</li>
      ))}
    </ul>
  )
}

export function MatchCard({ game, teamById, stadiumById }: Props) {
  const { locale, tr, teamName } = useLocale()
  const [open, setOpen] = useState(false)

  const home = teamById.get(game.homeTeamId)
  const away = teamById.get(game.awayTeamId)
  const stadium = stadiumById.get(game.stadiumId)

  const homeName = home ? teamName(home) : game.homeLabel ? localizeLabel(game.homeLabel, locale) : (game.homeTeamName ?? '–')
  const awayName = away ? teamName(away) : game.awayLabel ? localizeLabel(game.awayLabel, locale) : (game.awayTeamName ?? '–')
  const unresolved = !home && !!game.homeLabel

  const isLive = game.status === 'live'
  const isFinished = game.status === 'finished'
  const kickoffTime = game.kickoff.toLocaleTimeString(locale === 'de' ? 'de-DE' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const roundLabel =
    game.type === 'group'
      ? `${tr('group')} ${game.group} · ${tr('matchday')} ${game.matchday}`
      : tr(
          (
            {
              r32: 'roundOf32',
              r16: 'roundOf16',
              qf: 'quarterFinals',
              sf: 'semiFinals',
              third: 'thirdPlace',
              final: 'final',
            } as const
          )[game.type],
        )

  return (
    <article
      className={`overflow-hidden rounded-lg border bg-pitch-800/60 transition-colors ${
        isLive ? 'border-hot/50 shadow-[0_0_18px_-6px_rgb(255_83_64/0.45)]' : 'border-pitch-700/60'
      }`}
    >
      <button
        className="relative grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-3 pb-4 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {/* expand affordance */}
        <svg
          viewBox="0 0 24 24"
          className={`absolute bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 text-ink-dim/60 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        {/* home */}
        <div className="flex items-center justify-end gap-2 overflow-hidden">
          <span
            className={`truncate text-sm font-semibold ${unresolved ? 'text-ink-dim italic' : ''}`}
          >
            {homeName}
          </span>
          <TeamFlag src={home?.flag} alt="" />
        </div>

        {/* score / time */}
        <div className="flex min-w-[72px] flex-col items-center">
          {game.status === 'upcoming' ? (
            <span className="font-display text-lg text-ink-dim">{kickoffTime}</span>
          ) : (
            <span className={`font-display text-2xl leading-none ${isLive ? 'text-volt' : ''}`}>
              {game.homeScore}
              <span className="px-1 text-ink-dim">:</span>
              {game.awayScore}
            </span>
          )}
          {isLive && (
            <span className="mt-1 flex items-center gap-1 text-[10px] font-bold tracking-widest text-hot">
              <span className="h-1 w-1 rounded-full bg-hot animate-pulse-dot" />
              {/^\d+$/.test(game.minute ?? '') ? `${game.minute}'` : tr('live')}
            </span>
          )}
          {isFinished && (
            <span className="mt-0.5 text-[10px] font-semibold tracking-widest text-ink-dim">
              {tr('finished')}
            </span>
          )}
        </div>

        {/* away */}
        <div className="flex items-center gap-2 overflow-hidden">
          <TeamFlag src={away?.flag} alt="" />
          <span
            className={`truncate text-sm font-semibold ${!away && game.awayLabel ? 'text-ink-dim italic' : ''}`}
          >
            {awayName}
          </span>
        </div>
      </button>

      {open && (
        <div className="rise-in space-y-2 border-t border-pitch-700/60 px-3 py-2.5">
          {(game.homeScorers.length > 0 || game.awayScorers.length > 0) && (
            <div className="grid grid-cols-2 gap-2">
              <ScorerList scorers={game.homeScorers} align="right" />
              <ScorerList scorers={game.awayScorers} align="left" />
            </div>
          )}
          <p className="text-[11px] font-semibold tracking-wide text-volt/90 uppercase">
            {roundLabel}
          </p>
          <p className="text-[11px] text-ink-dim">
            📅{' '}
            {game.kickoff.toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {' · '}
            {game.kickoff.toLocaleTimeString(locale === 'de' ? 'de-DE' : 'en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: STADIUM_TZ[game.stadiumId],
            })}{' '}
            {tr('localTime')}
          </p>
          {stadium && (
            <p className="text-[11px] text-ink-dim">
              🏟 {stadium.name_en} · {stadium.city_en}, {stadium.country_en}
              {' · '}
              {tr('capacity')}{' '}
              {stadium.capacity.toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB')}
            </p>
          )}
        </div>
      )}
    </article>
  )
}
