/** Raw shapes as returned by https://worldcup26.ir — everything is a string. */

export interface RawTeam {
  _id: string
  id: string
  name_en: string
  name_fa: string
  flag: string
  fifa_code: string
  iso2: string
  groups: string
}

export interface RawGroupTeam {
  team_id: string
  mp: string
  w: string
  l: string
  d: string
  pts: string
  gf: string
  ga: string
  gd: string
}

export interface RawGroup {
  _id: string
  name: string
  teams: RawGroupTeam[]
}

export type GameType = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final'

export interface RawGame {
  _id: string
  id: string
  home_team_id: string
  away_team_id: string
  home_score: string
  away_score: string
  home_scorers: string
  away_scorers: string
  group: string
  matchday: string
  local_date: string // "MM/DD/YYYY HH:mm"
  stadium_id: string
  finished: string // "TRUE" | "FALSE"
  time_elapsed: string // "notstarted" | minutes | "finished"
  type: GameType
  home_team_name_en?: string
  away_team_name_en?: string
  home_team_label?: string // KO placeholder, e.g. "Winner Group A"
  away_team_label?: string
}

export interface RawStadium {
  _id: string
  id: string
  name_en: string
  fifa_name: string
  city_en: string
  country_en: string
  capacity: number
  region: string
}

/** Normalized domain types used by the app. */

export type GameStatus = 'upcoming' | 'live' | 'finished'

export interface Game {
  id: string
  homeTeamId: string
  awayTeamId: string
  homeScore: number
  awayScore: number
  homeScorers: string[]
  awayScorers: string[]
  group: string
  matchday: number
  kickoff: Date
  stadiumId: string
  status: GameStatus
  /** Elapsed minute while live, e.g. "67" — null otherwise. */
  minute: string | null
  type: GameType
  homeTeamName: string | null
  awayTeamName: string | null
  homeLabel: string | null
  awayLabel: string | null
}

export interface GroupStanding {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}

export interface Group {
  name: string
  standings: GroupStanding[]
}
