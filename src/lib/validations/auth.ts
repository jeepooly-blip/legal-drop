import { z } from 'zod'
export const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
})
export const registerSchema = z.object({
  role:            z.enum(['client','lawyer']),
  full_name:       z.string().min(2, 'Min 2 characters'),
  email:           z.string().email('Invalid email'),
  password:        z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword'],
})
export type LoginInput    = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
