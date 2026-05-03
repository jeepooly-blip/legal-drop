import { z } from 'zod'
export const CASE_CATEGORIES = ['landlord','consumer','contract','employment','family','other'] as const
export const JURISDICTIONS   = [
  'Amman','Zarqa','Irbid','Aqaba','Madaba','Jerash',
  'Ajloun','Mafraq','Karak','Tafilah','Maan','Balqa',
] as const

export const caseSchema = z.object({
  category:    z.enum(CASE_CATEGORIES, { required_error: 'Select a category' }),
  jurisdiction: z.string().min(1, 'Select a jurisdiction'),
  budget_min:  z.number().min(5, 'Min budget is 5 JOD'),
  budget_max:  z.number().min(5),
  description: z.string().min(50, 'Describe in at least 50 characters').max(2000, 'Max 2000 characters'),
  consent:     z.boolean().refine(v => v === true, { message: 'You must agree to continue' }),
}).refine(d => d.budget_max >= d.budget_min, {
  message: 'Max budget must be >= min', path: ['budget_max'],
})
export type CaseInput = z.infer<typeof caseSchema>
