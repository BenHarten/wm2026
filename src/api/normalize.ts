import { STADIUM_TZ, zonedWallTimeToDate } from './timezone'
import type { Game, GameStatus, Group, RawGame, RawGroup, RawGroupTeam } from './types'

/**
 * Scorer strings from the API are messy: `{"A 9'","B 67'"}` with straight,
 * curly (“ ” ‘ ’) or mixed quotes, or the literal string "null".
 * Extract the quoted segments defensively.
 */
export function parseScorers(raw: string | undefined): string[] {
  if (!raw || raw === 'null' || raw === '{}') return []
  const normalized = raw.replace(/[“”„]/g, '"').replace(/[‘’]/g, "'")
  const matches = normalized.match(/"([^"]+)"/g)
  if (!matches) return []
  return matches.map((m) => m.slice(1, -1).trim()).filter(Boolean)
}

/**
 * Parse "MM/DD/YYYY HH:mm" (stadium-local wall time) into the actual UTC
 * instant using the stadium's timezone, so the UI can render it in the
 * browser's timezone. Unknown stadium → assume Eastern Time (most venues).
 */
function parseLocalDate(raw: string, stadiumId: string): Date {
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/)
  if (!m) return new Date(NaN)
  const [, month, day, year, hours, minutes] = m
  const tz = STADIUM_TZ[stadiumId] ?? 'America/New_York'
  return zonedWallTimeToDate(+year, +month, +day, +hours, +minutes, tz)
}

function gameStatus(raw: RawGame): { status: GameStatus; minute: string | null } {
  if (raw.finished === 'TRUE' || raw.time_elapsed === 'finished') {
    return { status: 'finished', minute: null }
  }
  if (raw.time_elapsed === 'notstarted') {
    return { status: 'upcoming', minute: null }
  }
  return { status: 'live', minute: raw.time_elapsed }
}

export function normalizeGame(raw: RawGame): Game {
  const { status, minute } = gameStatus(raw)
  const unresolved = (id: string) => id === '0' || id === ''
  return {
    id: raw.id,
    homeTeamId: raw.home_team_id,
    awayTeamId: raw.away_team_id,
    homeScore: Number(raw.home_score) || 0,
    awayScore: Number(raw.away_score) || 0,
    homeScorers: parseScorers(raw.home_scorers),
    awayScorers: parseScorers(raw.away_scorers),
    group: raw.group,
    matchday: Number(raw.matchday) || 0,
    kickoff: parseLocalDate(raw.local_date, raw.stadium_id),
    stadiumId: raw.stadium_id,
    status,
    minute,
    type: raw.type,
    homeTeamName: !unresolved(raw.home_team_id) ? (raw.home_team_name_en ?? null) : null,
    awayTeamName: !unresolved(raw.away_team_id) ? (raw.away_team_name_en ?? null) : null,
    homeLabel: raw.home_team_label ?? null,
    awayLabel: raw.away_team_label ?? null,
  }
}

function normalizeStanding(raw: RawGroupTeam) {
  const won = Number(raw.w) || 0
  const drawn = Number(raw.d) || 0
  const lost = Number(raw.l) || 0
  return {
    teamId: raw.team_id,
    // the live API sometimes leaves mp at 0 while w/d/l are updated
    played: Math.max(Number(raw.mp) || 0, won + drawn + lost),
    won,
    drawn,
    lost,
    goalsFor: Number(raw.gf) || 0,
    goalsAgainst: Number(raw.ga) || 0,
    goalDiff: Number(raw.gd) || 0,
    points: Number(raw.pts) || 0,
  }
}

export function normalizeGroup(raw: RawGroup): Group {
  const standings = raw.teams.map(normalizeStanding).sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDiff - a.goalDiff ||
      b.goalsFor - a.goalsFor ||
      a.teamId.localeCompare(b.teamId, undefined, { numeric: true }),
  )
  return { name: raw.name, standings }
}
