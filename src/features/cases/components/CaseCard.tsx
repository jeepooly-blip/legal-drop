import type { Case } from '@/types'
import { CaseStatusBadge } from './CaseStatusBadge'
const CAT: Record<string, string> = {
  landlord:'&#x1F3E0; Landlord', consumer:'&#x1F6D2; Consumer', contract:'&#x1F4C4; Contract',
  employment:'&#x1F4BC; Employment', family:'&#x1F46A; Family', other:'&#x2696;&#xFE0F; Other',
}
export function CaseCard({ case_ }: { case_: Case }) {
  const date = new Date(case_.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full" dangerouslySetInnerHTML={{ __html: CAT[case_.category] || case_.category }} />
            <span className="text-xs text-slate-400">{case_.jurisdiction}</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">
            {case_.anonymized_description || case_.original_description}
          </p>
        </div>
        <CaseStatusBadge status={case_.status} />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400">{date}</span>
        <span className="text-xs font-semibold text-slate-700">{case_.budget_min} - {case_.budget_max} JOD</span>
      </div>
    </div>
  )
}
