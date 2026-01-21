export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
      <div className="h-8 w-64 bg-muted rounded-md" />
      <div className="rounded-xl border">
        <div className="border-b p-6">
          <div className="h-5 w-48 bg-muted rounded-md" />
        </div>
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}

