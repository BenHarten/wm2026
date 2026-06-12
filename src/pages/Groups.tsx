import { useGroups } from '../hooks/useWorldCupData'
import { useLookups } from '../hooks/useLookups'
import { useLocale } from '../hooks/useLocale'
import { ErrorNote, SkeletonList } from '../components/Skeleton'
import { TeamFlag } from '../components/TeamFlag'

export function Groups() {
  const { data: groups, isPending, isError, refetch } = useGroups()
  const { teamById } = useLookups()
  const { tr, teamName } = useLocale()

  if (isPending) return <SkeletonList rows={6} />
  if (isError) return <ErrorNote message={tr('error')} onRetry={() => refetch()} retryLabel={tr('retry')} />

  return (
    <div className="grid gap-4 pt-4 sm:grid-cols-2">
      <p className="text-[11px] text-ink-dim sm:col-span-2">{tr('legend')}</p>
      {groups?.map((group) => (
        <section
          key={group.name}
          className="rise-in overflow-hidden rounded-lg border border-pitch-700/60 bg-pitch-800/60"
        >
          <h2 className="border-b border-pitch-700/60 px-3 py-2 font-display text-sm tracking-widest text-volt uppercase">
            {tr('group')} {group.name}
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] tracking-wider text-ink-dim uppercase">
                <th className="py-1.5 pl-3 text-left font-medium" colSpan={2}>
                  {tr('team')}
                </th>
                <th className="w-8 font-medium">{tr('statPlayed')}</th>
                <th className="w-8 font-medium">{tr('statDiff')}</th>
                <th className="w-10 pr-3 font-medium">{tr('statPoints')}</th>
              </tr>
            </thead>
            <tbody>
              {group.standings.map((s, idx) => {
                const team = teamById.get(s.teamId)
                return (
                  <tr
                    key={s.teamId}
                    className={`border-t border-pitch-700/40 ${
                      idx < 2 ? 'border-l-2 border-l-volt' : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <td className="w-6 py-2 pl-3 text-xs text-ink-dim">{idx + 1}</td>
                    <td>
                      <span className="flex items-center gap-2 font-medium">
                        <TeamFlag src={team?.flag} alt="" className="h-3.5 w-5" />
                        <span className="truncate">{teamName(team)}</span>
                      </span>
                    </td>
                    <td className="text-center text-ink-dim">{s.played}</td>
                    <td className="text-center text-ink-dim">
                      {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                    </td>
                    <td className="pr-3 text-center font-display text-base text-ink">{s.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}
