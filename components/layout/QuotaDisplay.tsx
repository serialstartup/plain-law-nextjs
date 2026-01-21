import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'

export async function QuotaDisplay() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('quota_limit, quota_used')
    .eq('id', user.id)
    .single()

  // Don't crash if profile not found, just don't render
  if (error || !profile) {
    console.error('Failed to load quota:', error)
    return null
  }

  const percentage = (profile.quota_used / profile.quota_limit) * 100

  return (
    <Card className="p-4">
      <div className="flex justify-between mb-2 text-sm">
        <span className="font-medium">Monthly Analyses</span>
        <span className="font-semibold">{profile.quota_used} / {profile.quota_limit}</span>
      </div>
      <Progress value={percentage} />
    </Card>
  )
}