"use client"

import { Button } from '@/components/ui/button'
import { useTransition } from 'react'
import { signInWithGoogle } from '@/actions/auth.actions'

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="size-4">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C33.617 6.053 29.04 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.297 16.108 18.787 13 24 13c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C33.617 6.053 29.04 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.164 0 9.787-1.977 13.293-5.197l-6.146-5.205C29.059 35.091 26.641 36 24 36c-5.202 0-9.677-3.317-11.33-7.952l-6.54 5.035C9.45 39.556 16.13 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.15 5.598l.003-.002 6.146 5.205C39.152 36.264 42 30.72 42 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  )
}

export function GoogleButton({ children = 'Google ile devam et' }: { children?: React.ReactNode }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={pending}
      onClick={() => startTransition(() => { void signInWithGoogle() })}
    >
      <GoogleIcon />
      {children}
    </Button>
  )
}

