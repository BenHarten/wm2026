import { useGames } from '../hooks/useWorldCupData'
import { useLocale } from '../hooks/useLocale'

export function Header() {
  const { locale, setLocale, tr } = useLocale()
  const { data: games, dataUpdatedAt } = useGames()
  const liveCount = games?.filter((g) => g.status === 'live').length ?? 0

  return (
    <header className="sticky top-0 z-40 border-b border-pitch-700/60 bg-pitch-950/90 backdrop-blur-md">
      {/* pitch centre-circle motif */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.13]"
      >
        <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full border border-ink" />
        <div className="absolute top-0 left-1/2 h-px w-full -translate-x-1/2 bg-ink" />
      </div>

      <div className="relative flex items-center justify-between px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h1 className="font-display text-xl leading-none tracking-wide text-ink uppercase">
            {tr('appTitle')}
          </h1>
          <span className="font-display text-xl leading-none text-volt">2026</span>
        </div>

        <div className="flex items-center gap-3">
          {liveCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-hot/40 bg-hot/10 px-2.5 py-1 text-[11px] font-bold tracking-widest text-hot">
              <span className="h-1.5 w-1.5 rounded-full bg-hot animate-pulse-dot" />
              {liveCount} {tr('live')}
            </span>
          )}
          <div
            className="flex overflow-hidden rounded-md border border-pitch-600 text-[11px] font-semibold"
            role="group"
            aria-label="Language"
          >
            {(['en', 'de'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                aria-pressed={locale === l}
                className={
                  locale === l
                    ? 'bg-volt px-2 py-1 text-pitch-950 uppercase'
                    : 'px-2 py-1 text-ink-dim uppercase hover:text-ink'
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {dataUpdatedAt > 0 && (
        <p className="relative px-4 pb-1.5 text-[10px] text-ink-dim/70">
          {tr('updated')}{' '}
          {new Date(dataUpdatedAt).toLocaleTimeString(locale === 'de' ? 'de-DE' : 'en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </p>
      )}
    </header>
  )
}
