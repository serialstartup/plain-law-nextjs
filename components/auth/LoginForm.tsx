"use client"

import { useActionState } from 'react'
import { login } from '@/actions/auth.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SubmitButton } from './SubmitButton'
import { Mail, Lock, AlertCircle } from 'lucide-react'

interface FormState {
  error?: string
}

export function LoginForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const result = await login(formData)
      return result ?? {}
    },
    {}
  )

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2 text-left">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="pl-9"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div className="space-y-2 text-left">
        <Label htmlFor="password">Şifre</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="pl-9"
            placeholder="••••••••"
          />
        </div>
      </div>
      <SubmitButton className="w-full">Giriş Yap</SubmitButton>
    </form>
  )
}
