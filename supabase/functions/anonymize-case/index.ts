// Supabase Edge Function — Deno runtime
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const SYSTEM_PROMPT = 'You are a privacy protection assistant. Your job is to remove personally identifiable information (PII) from legal case descriptions while preserving all legally relevant facts. Return ONLY valid JSON in this shape: { "found": boolean, "risk": "low"|"high", "suggested_replacement": string }. Replace names with [PERSON], phones with [PHONE], emails with [EMAIL], national IDs with [ID], addresses with [ADDRESS].'

serve(async (req) => {
  try {
    const { case_id, description } = await req.json()
    if (!case_id || !description) {
      return new Response(JSON.stringify({ error: 'case_id and description required' }), { status: 400 })
    }

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + OPENAI_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: 'Analyze and anonymize: ' + description },
        ],
      }),
    })

    const aiData = await aiRes.json()
    const result = JSON.parse(aiData.choices[0].message.content)

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    if (result.risk === 'low') {
      await supabase.from('cases').update({
        anonymized_description: result.suggested_replacement,
        status: 'open',
      }).eq('id', case_id)
    } else {
      await supabase.from('cases').update({
        anonymized_description: result.suggested_replacement,
      }).eq('id', case_id)
      await supabase.from('admin_notifications').insert({
        type: 'pii_review_required',
        payload: { case_id, risk: result.risk, pii_found: result.found },
      })
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
