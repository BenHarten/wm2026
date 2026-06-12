import { useMemo } from 'react'
import { useStadiums, useTeams } from './useWorldCupData'
import type { RawStadium, RawTeam } from '../api/types'

/** id → team / stadium lookup maps for joining games with their entities. */
export function useLookups() {
  const { data: teams } = useTeams()
  const { data: stadiums } = useStadiums()

  const teamById = useMemo(() => {
    const map = new Map<string, RawTeam>()
    teams?.forEach((t) => map.set(t.id, t))
    return map
  }, [teams])

  const stadiumById = useMemo(() => {
    const map = new Map<string, RawStadium>()
    stadiums?.forEach((s) => map.set(s.id, s))
    return map
  }, [stadiums])

  return { teamById, stadiumById }
}
