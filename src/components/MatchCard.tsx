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

  const hasDetails = game.homeScorers.length > 0 || game.awayScorers.length > 0 || !!stadium

  return (
    <article
      className={`overflow-hidden rounded-lg border bg-pitch-800/60 transition-colors ${
        isLive ? 'border-hot/50 shadow-[0_0_18px_-6px_rgb(255_83_64/0.45)]' : 'border-pitch-700/60'
      }`}
    >
      <button
        className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-3 text-left"
        onClick={() => hasDetails && setOpen((o) => !o)}
        aria-expanded={open}
      >
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

      {open && hasDetails && (
        <div className="rise-in border-t border-pitch-700/60 px-3 py-2.5">
          <div className="grid grid-cols-2 gap-2">
            <ScorerList scorers={game.homeScorers} align="right" />
            <ScorerList scorers={game.awayScorers} align="left" />
          </div>
          {stadium && (
            <p className="mt-2 text-[11px] text-ink-dim">
              🏟 {stadium.name_en} · {stadium.city_en}, {stadium.country_en}
              {' · '}
              {game.kickoff.toLocaleTimeString(locale === 'de' ? 'de-DE' : 'en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: STADIUM_TZ[game.stadiumId],
              })}{' '}
              {tr('localTime')}
            </p>
          )}
        </div>
      )}
    </article>
  )
}
