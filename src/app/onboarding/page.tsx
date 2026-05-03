import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role,full_name').eq('id', user.id).single()
  if (profile?.role !== 'lawyer') redirect('/dashboard')
  const { data: lp } = await supabase.from('lawyer_profiles').select('id').eq('profile_id', user.id).single()
  if (lp) redirect('/whiteboard')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6"><span className="text-3xl font-black">&#x2696;&#xFE0F; LegalDrop</span></div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {profile?.full_name}</CardTitle>
            <CardDescription>Complete your lawyer profile to start receiving cases on the Whiteboard. Your Bar ID will be verified by our admin team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              &#x1F6A7; <strong>Phase 3:</strong> Lawyer onboarding form (Bar number, jurisdictions, specialties, ID upload) is built in the next phase.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
