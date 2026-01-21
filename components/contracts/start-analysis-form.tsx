"use client"

import { Button } from '@/components/ui/button'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending} className="gap-2">
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Starting Analysis…
        </>
      ) : (
        <>Start Analysis</>
      )}
    </Button>
  )
}

export function StartAnalysisForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action}>
      <SubmitButton />
    </form>
  )
}

