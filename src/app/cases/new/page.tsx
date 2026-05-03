import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CaseFormWizard } from '@/features/cases/components/CaseFormWizard'
import Link from 'next/link'

export default async function NewCasePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'lawyer') redirect('/whiteboard')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">&#x2190; Dashboard</Link>
          <span className="text-lg font-black">&#x2696;&#xFE0F; LegalDrop</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Post a Legal Matter</h1>
          <p className="text-slate-500 text-sm mt-2">Your identity is protected. Lawyers only see anonymized details.</p>
        </div>
        <CaseFormWizard />
      </main>
    </div>
  )
}
