'use client'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { type CaseInput } from '@/lib/validations/case'
import { checkPii } from '../utils/pii'

const PRESETS = [
  { label: '5 – 20 JOD',   min: 5,   max: 20   },
  { label: '20 – 100 JOD', min: 20,  max: 100  },
  { label: '100 – 300 JOD',min: 100, max: 300  },
  { label: '300+ JOD',     min: 300, max: 1000 },
]
const MAX_CHARS = 2000

export function StepBudgetDescription() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<CaseInput>()
  const description = watch('description') || ''
  const budgetMin   = watch('budget_min')
  const budgetMax   = watch('budget_max')
  const [piiWarn, setPiiWarn] = useState(false)

  useEffect(() => {
    setPiiWarn(description.length > 20 ? checkPii(description).found : false)
  }, [description])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Budget & Case Details</h2>
        <p className="text-slate-500 text-sm mt-1">Set your budget range and describe your issue</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Budget Range (JOD)</label>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(p => (
            <button key={p.label} type="button"
              onClick={() => { setValue('budget_min', p.min, { shouldValidate: true }); setValue('budget_max', p.max, { shouldValidate: true }) }}
              className={'rounded-lg border-2 py-2 px-3 text-sm font-medium transition-all ' + (budgetMin === p.min && budgetMax === p.max ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 hover:border-slate-400 text-slate-700')}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-slate-500">Min (JOD)</label>
            <input type="number" {...register('budget_min', { valueAsNumber: true })} min={5}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <span className="text-slate-400 pt-5">-</span>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-slate-500">Max (JOD)</label>
            <input type="number" {...register('budget_max', { valueAsNumber: true })} min={5}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
        </div>
        {(errors.budget_min || errors.budget_max) && (
          <p className="text-xs text-red-500">{errors.budget_min?.message || errors.budget_max?.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Describe your legal issue
          <span className="ml-1 text-xs font-normal text-slate-400">(do not include personal info)</span>
        </label>
        <textarea {...register('description')} rows={6} maxLength={MAX_CHARS}
          placeholder="Describe your issue without names, phone numbers, or emails. Example: My landlord has not returned my security deposit of 500 JOD despite 3 months passing since I vacated..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" />
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">{description.length}/{MAX_CHARS}</p>
          {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
        </div>
        {piiWarn && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2">
            <span className="text-lg">&#x1F6E1;&#xFE0F;</span>
            <div>
              <p className="text-xs font-semibold text-amber-800">Magic Shield Alert</p>
              <p className="text-xs text-amber-700 mt-0.5">Personal details detected. Remove names, phone numbers, and emails to protect your identity.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
