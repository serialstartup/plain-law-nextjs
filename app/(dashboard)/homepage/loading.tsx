export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="text-center space-y-2">
        <div className="h-8 w-72 mx-auto bg-muted rounded-md" />
        <div className="h-4 w-96 mx-auto bg-muted/70 rounded-md" />
      </div>
      <div className="rounded-xl border p-10">
        <div className="h-40 bg-muted/50 rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-40 bg-muted rounded-md" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-20 bg-muted/60 rounded-md" />
          <div className="h-20 bg-muted/60 rounded-md" />
        </div>
      </div>
    </div>
  )
}

