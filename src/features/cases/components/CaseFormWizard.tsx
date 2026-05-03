'use client'
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { caseSchema, type CaseInput } from '@/lib/validations/case'
import { createClient } from '@/lib/supabase/client'
import { checkPii } from '../utils/pii'
import { StepCategory } from './StepCategory'
import { StepBudgetDescription } from './StepBudgetDescription'
import { StepReview } from './StepReview'
import { MagicShieldModal } from './MagicShieldModal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STEPS = ['Category & Location', 'Budget & Details', 'Review & Submit']
type PiiResult = { found: boolean; matches: string[]; redacted: string }

export function CaseFormWizard() {
  const [step, setStep] = useState(0)
  const [piiResult, setPiiResult] = useState<PiiResult | null>(null)
  const [shieldOpen, setShieldOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()

  const methods = useForm<CaseInput>({
    resolver: zodResolver(caseSchema),
    defaultValues: { jurisdiction: '', budget_min: 50, budget_max: 300, description: '', consent: false },
    mode: 'onChange',
  })
  const { handleSubmit, trigger, getValues } = methods

  const goNext = async () => {
    const fields = step === 0
      ? (['category','jurisdiction'] as const)
      : (['budget_min','budget_max','description'] as const)
    const ok = await trigger(fields)
    if (ok) setStep(s => s + 1)
  }
  const goPrev = () => setStep(s => Math.max(0, s - 1))

  const doSubmit = async (data: CaseInput) => {
    setSubmitting(true); setSubmitError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data: inserted, error } = await supabase
        .from('cases')
        .insert({
          client_id: user.id,
          original_description: data.description,
          category: data.category,
          jurisdiction: data.jurisdiction,
          budget_min: data.budget_min,
          budget_max: data.budget_max,
          status: 'pending_review',
          is_anonymous: true,
        })
        .select('id')
        .single()
      if (error) throw error
      await fetch('/api/anonymize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: inserted.id }),
      })
      router.push('/dashboard?submitted=true')
    } catch (e: any) {
      setSubmitError(e.message || 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  const onFormSubmit = handleSubmit(async (data) => {
    const result = checkPii(data.description)
    if (result.found) { setPiiResult(result); setShieldOpen(true); return }
    await doSubmit(data)
  })

  return (
    <FormProvider {...methods}>
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors flex-shrink-0',
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500')}>
                {i < step ? '&#x2713;' : i + 1}
              </div>
              <span className={cn('text-xs font-medium hidden sm:block', i === step ? 'text-slate-900' : 'text-slate-400')}>{label}</span>
              {i < STEPS.length - 1 && <div className={cn('h-0.5 flex-1', i < step ? 'bg-green-500' : 'bg-slate-200')} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          {step === 0 && <StepCategory />}
          {step === 1 && <StepBudgetDescription />}
          {step === 2 && <StepReview />}
          {submitError && <p className="mt-4 text-sm text-red-500 text-center">{submitError}</p>}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={goPrev} disabled={step === 0}>&#x2190; Back</Button>
            {step < STEPS.length - 1
              ? <Button type="button" onClick={goNext}>Continue &#x2192;</Button>
              : <Button type="button" onClick={onFormSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Case &#x1F6E1;&#xFE0F;'}
                </Button>}
          </div>
        </div>
      </div>
      <MagicShieldModal
        open={shieldOpen}
        matches={piiResult?.matches ?? []}
        onEdit={() => { setShieldOpen(false); setStep(1) }}
        onProceed={() => { setShieldOpen(false); doSubmit(getValues()) }}
      />
    </FormProvider>
  )
}
