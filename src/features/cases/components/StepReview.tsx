'use client'
import { useFormContext } from 'react-hook-form'
import { type CaseInput } from '@/lib/validations/case'
import { CaseStatusBadge } from './CaseStatusBadge'

const CAT_LABELS: Record<string, string> = {
  landlord: 'Landlord / Tenant', consumer: 'Consumer Rights',
  contract: 'Contract Dispute',  employment: 'Employment',
  family: 'Family Law',          other: 'Other',
}

export function StepReview() {
  const { watch, register, formState: { errors } } = useFormContext<CaseInput>()
  const v = watch()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Review & Submit</h2>
        <p className="text-slate-500 text-sm mt-1">Confirm your case details before submitting</p>
      </div>
      <div className="rounded-xl bg-slate-50 border border-slate-200 divide-y divide-slate-200">
        <div className="p-4 flex justify-between items-start">
          <span className="text-sm text-slate-500 font-medium">Category</span>
          <span className="text-sm font-semibold text-slate-900">{CAT_LABELS[v.category] || '-'}</span>
        </div>
        <div className="p-4 flex justify-between items-start">
          <span className="text-sm text-slate-500 font-medium">Jurisdiction</span>
          <span className="text-sm font-semibold text-slate-900">{v.jurisdiction || '-'}</span>
        </div>
        <div className="p-4 flex justify-between items-start">
          <span className="text-sm text-slate-500 font-medium">Budget</span>
          <span className="text-sm font-semibold text-slate-900">{v.budget_min} - {v.budget_max} JOD</span>
        </div>
        <div className="p-4 flex justify-between items-start gap-4">
          <span className="text-sm text-slate-500 font-medium shrink-0">Status after submit</span>
          <CaseStatusBadge status="pending_review" />
        </div>
        <div className="p-4">
          <span className="text-sm text-slate-500 font-medium block mb-2">Your Description</span>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{v.description || '-'}</p>
        </div>
      </div>
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
        <span className="text-xl">&#x1F6E1;&#xFE0F;</span>
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Your identity is protected</p>
          <p className="mt-0.5 text-blue-700">Our AI anonymization engine will review your case before it goes live. Lawyers will never see your personal information.</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <input id="consent" type="checkbox" {...register('consent')}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-900" />
        <label htmlFor="consent" className="text-sm text-slate-600">
          I confirm this description contains no personal details and I agree to LegalDrop's Terms of Service and Privacy Policy.
        </label>
      </div>
      {errors.consent && <p className="text-xs text-red-500 -mt-4">{errors.consent.message}</p>}
    </div>
  )
}
