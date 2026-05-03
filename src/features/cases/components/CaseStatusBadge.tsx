import type { CaseStatus } from '@/types'
const CFG: Record<CaseStatus, { label: string; cls: string }> = {
  draft:          { label: 'Draft',      cls: 'bg-slate-100 text-slate-600' },
  pending_review: { label: 'In Review',  cls: 'bg-amber-100 text-amber-700' },
  open:           { label: 'Live',       cls: 'bg-green-100 text-green-700' },
  assigned:       { label: 'Hired',      cls: 'bg-blue-100 text-blue-700'   },
  closed:         { label: 'Closed',     cls: 'bg-slate-100 text-slate-500' },
  disputed:       { label: 'Disputed',   cls: 'bg-red-100 text-red-700'     },
}
export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const c = CFG[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' }
  return <span className={'inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ' + c.cls}>{c.label}</span>
}
