'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UploadForm({
  action,
}: {
  action: (formData: FormData) => void
}) {
  const [dragActive, setDragActive] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    // Auto submit after file selection
    queueMicrotask(() => {
      formRef.current?.requestSubmit()
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && inputRef.current) {
      inputRef.current.files = e.dataTransfer.files
      onFilesSelected(e.dataTransfer.files)
    }
  }

  return (
    <form ref={formRef} action={action} className="w-full" onSubmit={() => setDragActive(false)}>
      <div
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true) }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false) }}
        onDrop={handleDrop}
        className={cn(
          'rounded-xl border border-dashed p-10 md:p-14 text-center transition-colors',
          dragActive ? 'bg-accent/30 border-accent' : 'bg-background'
        )}
      >
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="size-7" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-medium">Drag & drop your file here</p>
          <p className="text-sm text-muted-foreground">or click to browse from your computer</p>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs rounded-full border bg-muted/40 px-2 py-0.5">PDF</span>
          <span className="text-xs rounded-full border bg-muted/40 px-2 py-0.5">DOCX</span>
          <span className="text-xs rounded-full border bg-muted/40 px-2 py-0.5">Max 50MB</span>
        </div>

        <div className="mt-6">
          <input
            ref={inputRef}
            className="sr-only"
            id="file"
            type="file"
            name="file"
            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            onChange={(e) => onFilesSelected(e.target.files)}
          />
          <Button type="button" onClick={() => inputRef.current?.click()} className="gap-2">
            <UploadCloud className="size-4" /> Browse Files
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Your documents are processed securely and encrypted end-to-end.
        </p>
      </div>
      <PendingOverlay />
    </form>
  )
}

function PendingOverlay() {
  // useFormStatus works only inside form
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useFormStatus } = require('react-dom') as typeof import('react-dom')
  const { pending } = useFormStatus()
  if (!pending) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-center shadow-lg">
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[indeterminate_1.2s_ease_infinite] rounded-full bg-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Uploading and preparing your file…</p>
        <style jsx global>{`
          @keyframes indeterminate {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(50%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  )
}
