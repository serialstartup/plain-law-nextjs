"use client"

import { useActionState } from 'react'
import { signup } from '@/actions/auth.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SubmitButton } from './SubmitButton'
import { GoogleButton } from './GoogleButton'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface FormState {
  error?: string
}

export function RegisterForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const result = await signup(formData)
      return result ?? {}
    },
    {}
  )

  return (
    <div className="space-y-4">
      <GoogleButton>Google ile devam et</GoogleButton>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">veya email ile kayıt olun</span>
        </div>
      </div>
      <form action={formAction} className="space-y-4">
        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input id="email" name="email" type="email" required className="pl-9" placeholder="you@example.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input id="password" name="password" type="password" required className="pl-9" placeholder="••••••••" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Kaydol&apos;a tıklayarak <Link href="#" className="underline underline-offset-2">Hizmet Şartları</Link> ve <Link href="#" className="underline underline-offset-2">Gizlilik Politikası</Link>&apos;nı kabul etmiş olursunuz.
        </p>
        <SubmitButton className="w-full">Hesap Oluştur</SubmitButton>
      </form>
    </div>
  )
}
