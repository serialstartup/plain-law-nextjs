"use client"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Failed to load analysis</h2>
        <p className="text-sm text-muted-foreground mb-6">{error.message || 'Please try again.'}</p>
        <button onClick={reset} className="h-9 px-4 rounded-md border bg-background text-sm">Retry</button>
      </div>
    </div>
  )
}

