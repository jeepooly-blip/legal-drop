import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { case_id } = await req.json()
    if (!case_id) return NextResponse.json({ error: 'case_id required' }, { status: 400 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: caseData, error } = await supabase
      .from('cases').select('original_description,client_id').eq('id', case_id).single()
    if (error || !caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    if (caseData.client_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error: fnErr } = await supabase.functions.invoke('anonymize-case', {
      body: { case_id, description: caseData.original_description },
    })
    if (fnErr) {
      console.error('Edge function error:', fnErr)
      return NextResponse.json({ status: 'queued' })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
