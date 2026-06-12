import { describe, expect, test } from 'vitest'
import { normalizeGame, normalizeGroup, parseScorers } from './normalize'
import type { RawGame, RawGroup } from './types'

describe('parseScorers', () => {
  test('returns empty array for the literal string "null"', () => {
    expect(parseScorers('null')).toEqual([])
  })

  test('parses straight-quoted scorers', () => {
    expect(parseScorers(`{"I.B. Hwang 67'","H.G. Oh 80'"}`)).toEqual([
      "I.B. Hwang 67'",
      "H.G. Oh 80'",
    ])
  })

  test('parses curly-quoted scorers (real API sample)', () => {
    expect(parseScorers(`{“J. Quiñones 9'”,”R. Jiménez 67'”}`)).toEqual([
      "J. Quiñones 9'",
      "R. Jiménez 67'",
    ])
  })

  test('handles empty / undefined input', () => {
    expect(parseScorers('')).toEqual([])
    expect(parseScorers(undefined)).toEqual([])
    expect(parseScorers('{}')).toEqual([])
  })
})

const finishedGroupGame: RawGame = {
  _id: 'x',
  id: '1',
  home_team_id: '1',
  away_team_id: '2',
  home_score: '2',
  away_score: '0',
  home_scorers: `{“J. Quiñones 9'”,”R. Jiménez 67'”}`,
  away_scorers: 'null',
  group: 'A',
  matchday: '1',
  local_date: '06/11/2026 13:00',
  stadium_id: '1',
  finished: 'TRUE',
  time_elapsed: 'finished',
  type: 'group',
  home_team_name_en: 'Mexico',
  away_team_name_en: 'South Africa',
}

describe('normalizeGame', () => {
  test('normalizes a finished group game', () => {
    const g = normalizeGame(finishedGroupGame)
    expect(g.homeScore).toBe(2)
    expect(g.awayScore).toBe(0)
    expect(g.status).toBe('finished')
    expect(g.minute).toBeNull()
    expect(g.homeTeamName).toBe('Mexico')
    expect(g.homeScorers).toHaveLength(2)
    expect(g.matchday).toBe(1)
  })

  test('parses local_date "MM/DD/YYYY HH:mm" into a Date', () => {
    const g = normalizeGame(finishedGroupGame)
    expect(g.kickoff.getFullYear()).toBe(2026)
    expect(g.kickoff.getMonth()).toBe(5) // June
    expect(g.kickoff.getDate()).toBe(11)
    expect(g.kickoff.getHours()).toBe(13)
  })

  test('detects an upcoming game', () => {
    const g = normalizeGame({
      ...finishedGroupGame,
      finished: 'FALSE',
      time_elapsed: 'notstarted',
      home_score: '0',
      away_score: '0',
    })
    expect(g.status).toBe('upcoming')
    expect(g.minute).toBeNull()
  })

  test('detects a live game with elapsed minute', () => {
    const g = normalizeGame({
      ...finishedGroupGame,
      finished: 'FALSE',
      time_elapsed: '67',
      home_score: '1',
      away_score: '0',
    })
    expect(g.status).toBe('live')
    expect(g.minute).toBe('67')
  })

  test('keeps KO placeholder labels when teams unresolved (team_id "0")', () => {
    const g = normalizeGame({
      ...finishedGroupGame,
      home_team_id: '0',
      away_team_id: '0',
      type: 'r32',
      group: 'R32',
      finished: 'FALSE',
      time_elapsed: 'notstarted',
      home_team_name_en: undefined,
      away_team_name_en: undefined,
      home_team_label: 'Winner Group E',
      away_team_label: '3rd Group A/B/C/D/F',
    })
    expect(g.homeTeamName).toBeNull()
    expect(g.homeLabel).toBe('Winner Group E')
    expect(g.awayLabel).toBe('3rd Group A/B/C/D/F')
  })
})

describe('normalizeGroup', () => {
  const rawGroup: RawGroup = {
    _id: 'g',
    name: 'A',
    teams: [
      { team_id: '2', mp: '1', w: '0', l: '1', d: '0', pts: '0', gf: '0', ga: '2', gd: '-2' },
      { team_id: '1', mp: '1', w: '1', l: '0', d: '0', pts: '3', gf: '2', ga: '0', gd: '2' },
      { team_id: '3', mp: '1', w: '1', l: '0', d: '0', pts: '3', gf: '1', ga: '0', gd: '1' },
      { team_id: '4', mp: '1', w: '0', l: '1', d: '0', pts: '0', gf: '0', ga: '1', gd: '-1' },
    ],
  }

  test('derives played from w+d+l when API leaves mp at 0 (live API bug)', () => {
    const group = normalizeGroup({
      ...rawGroup,
      teams: [
        { team_id: '1', mp: '0', w: '1', l: '0', d: '0', pts: '3', gf: '2', ga: '0', gd: '2' },
      ],
    })
    expect(group.standings[0].played).toBe(1)
  })

  test('converts string stats to numbers', () => {
    const group = normalizeGroup(rawGroup)
    const first = group.standings[0]
    expect(typeof first.points).toBe('number')
    expect(typeof first.goalDiff).toBe('number')
  })

  test('sorts standings by points, then goal difference, then goals for', () => {
    const group = normalizeGroup(rawGroup)
    // team 1: 3pts gd+2 · team 3: 3pts gd+1 · team 4: 0pts gd-1 · team 2: 0pts gd-2
    expect(group.standings.map((s) => s.teamId)).toEqual(['1', '3', '4', '2'])
  })
})
