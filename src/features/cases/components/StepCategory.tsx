'use client'
import { useFormContext } from 'react-hook-form'
import { type CaseInput, CASE_CATEGORIES, JURISDICTIONS } from '@/lib/validations/case'
import { cn } from '@/lib/utils'

const CAT_META: Record<string, { label: string; emoji: string }> = {
  landlord:   { label: 'Landlord / Tenant', emoji: '&#x1F3E0;' },
  consumer:   { label: 'Consumer Rights',   emoji: '&#x1F6D2;' },
  contract:   { label: 'Contract Dispute',  emoji: '&#x1F4C4;' },
  employment: { label: 'Employment',        emoji: '&#x1F4BC;' },
  family:     { label: 'Family Law',        emoji: '&#x1F46A;' },
  other:      { label: 'Other',             emoji: '&#x2696;&#xFE0F;' },
}

export function StepCategory() {
  const { watch, setValue, formState: { errors } } = useFormContext<CaseInput>()
  const selected = watch('category')
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">What type of legal matter is this?</h2>
        <p className="text-slate-500 text-sm mt-1">Select the category that best fits your issue</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CASE_CATEGORIES.map(cat => {
            const meta = CAT_META[cat]
            return (
              <button key={cat} type="button"
                onClick={() => setValue('category', cat, { shouldValidate: true })}
                className={cn('rounded-xl border-2 p-3 text-center transition-all',
                  selected === cat ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 hover:border-slate-400 text-slate-700')}>
                <span className="block text-2xl mb-1" dangerouslySetInnerHTML={{ __html: meta.emoji }} />
                <span className="text-xs font-semibold">{meta.label}</span>
              </button>
            )
          })}
        </div>
        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="jurisdiction" className="text-sm font-medium text-slate-700">Jurisdiction (Governorate)</label>
        <select id="jurisdiction" defaultValue=""
          onChange={e => setValue('jurisdiction', e.target.value, { shouldValidate: true })}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
          <option value="" disabled>Select governorate...</option>
          {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
        </select>
        {errors.jurisdiction && <p className="text-xs text-red-500">{errors.jurisdiction.message}</p>}
      </div>
    </div>
  )
}
