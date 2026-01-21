import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: any = null
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user!.id)
      .single()
    if (!error) profile = data
  } catch {}

  const quotaLimit = profile?.quota_limit ?? 0
  const quotaUsed = profile?.quota_used ?? 0
  const quotaLeft = Math.max(0, quotaLimit - quotaUsed)
  const isPremium = Boolean(profile?.is_premium)
  const plan = (profile?.plan as string | undefined) ?? (isPremium ? 'pro' : 'free')

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Profile and application preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your subscription and usage details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium capitalize">{plan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Premium</span>
                <span className="font-medium">{isPremium ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Monthly quota</span>
                <span className="font-medium">{quotaUsed} / {quotaLimit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">{quotaLeft}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Language and other options</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="language" className="text-sm text-muted-foreground">Language</label>
                <select id="language" name="language" className="border bg-background rounded-md h-9 px-3 text-sm">
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Notifications</label>
                <div className="flex items-center gap-2 text-sm">
                  <input id="email-notify" type="checkbox" className="size-4" />
                  <label htmlFor="email-notify">Email notifications</label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Ayarlar ileride özelleştirilecek; şu an için örnek alanlar.</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

