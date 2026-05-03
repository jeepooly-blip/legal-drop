import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <span className="text-4xl">&#x1F6E1;&#xFE0F;</span>
        <h1 className="text-2xl font-bold mt-4">Admin Dashboard</h1>
        <p className="text-slate-400 mt-2">GMV, Moderation Queue, and Lawyer Verifications — Phase 7</p>
      </div>
    </div>
  )
}
