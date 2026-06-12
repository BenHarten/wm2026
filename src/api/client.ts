import { normalizeGame, normalizeGroup } from './normalize'
import type { Game, Group, RawGame, RawGroup, RawStadium, RawTeam } from './types'

const BASE_URL = 'https://worldcup26.ir'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export async function fetchTeams(): Promise<RawTeam[]> {
  const data = await get<{ teams: RawTeam[] }>('/get/teams')
  return data.teams
}

export async function fetchGroups(): Promise<Group[]> {
  const data = await get<{ groups: RawGroup[] }>('/get/groups')
  return data.groups.map(normalizeGroup).sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchGames(): Promise<Game[]> {
  const data = await get<{ games: RawGame[] }>('/get/games')
  return data.games.map(normalizeGame).sort((a, b) => +a.kickoff - +b.kickoff)
}

export async function fetchStadiums(): Promise<RawStadium[]> {
  const data = await get<{ stadiums: RawStadium[] }>('/get/stadiums')
  return data.stadiums
}
