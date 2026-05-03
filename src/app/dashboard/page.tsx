import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CaseCard } from '@/features/cases/components/CaseCard'
import Link from 'next/link'
import type { Case } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('full_name,role').eq('id', user.id).single()
  if (profile?.role === 'lawyer') redirect('/whiteboard')
  const { data: cases } = await supabase.from('cases').select('*').eq('client_id', user.id).order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-black">&#x2696;&#xFE0F; LegalDrop</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{profile?.full_name}</span>
            <Badge variant="secondary">Client</Badge>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Cases</h1>
            <p className="text-slate-500 text-sm mt-1">{cases?.length ? cases.length + ' case' + (cases.length > 1 ? 's' : '') : 'No cases yet'}</p>
          </div>
          <Button asChild><Link href="/cases/new">+ Post a Case</Link></Button>
        </div>
        {cases && cases.length > 0 ? (
          <div className="grid gap-4">
            {cases.map(c => <CaseCard key={c.id} case_={c as Case} />)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <span className="text-5xl">&#x1F4CB;</span>
            <p className="text-slate-700 font-semibold mt-4">No cases yet</p>
            <p className="text-slate-400 text-sm mt-1">Post your first legal matter to receive fixed-price bids from verified lawyers.</p>
            <Button className="mt-6" asChild><Link href="/cases/new">Post a Case</Link></Button>
          </div>
        )}
      </main>
    </div>
  )
}
