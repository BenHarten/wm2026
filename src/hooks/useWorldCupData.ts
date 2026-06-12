import { useQuery } from '@tanstack/react-query'
import { fetchGames, fetchGroups, fetchStadiums, fetchTeams } from '../api/client'
import type { Game } from '../api/types'

const MINUTE = 60_000

/**
 * Poll while something is (or might be) happening: a game is live, or a game
 * kicked off within the last 3 h and isn't marked finished yet.
 */
function liveRefetchInterval(games: Game[] | undefined): number | false {
  if (!games || document.hidden) return false
  const now = Date.now()
  const active = games.some(
    (g) =>
      g.status === 'live' ||
      (g.status === 'upcoming' && now >= +g.kickoff && now - +g.kickoff < 3 * 60 * MINUTE),
  )
  return active ? 30_000 : 5 * MINUTE
}

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
    staleTime: 25_000,
    refetchInterval: (query) => liveRefetchInterval(query.state.data),
    refetchOnWindowFocus: true,
  })
}

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    staleTime: 60_000,
    refetchInterval: 5 * MINUTE,
  })
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    staleTime: 24 * 60 * MINUTE, // static data
  })
}

export function useStadiums() {
  return useQuery({
    queryKey: ['stadiums'],
    queryFn: fetchStadiums,
    staleTime: 24 * 60 * MINUTE, // static data
  })
}
