export function SkeletonList({ rows = 6 }: { rows?: number }) {
  return (
    <div className="mt-4 space-y-2" aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-lg border border-pitch-700/40 bg-pitch-800/50"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  )
}

export function ErrorNote({ message, onRetry, retryLabel }: { message: string; onRetry: () => void; retryLabel: string }) {
  return (
    <div className="mt-8 rounded-lg border border-hot/40 bg-hot/5 p-4 text-center">
      <p className="text-sm text-ink-dim">{message}</p>
      <button
        onClick={onRetry}
        className="mt-3 rounded-md bg-volt px-4 py-1.5 text-sm font-bold text-pitch-950"
      >
        {retryLabel}
      </button>
    </div>
  )
}
