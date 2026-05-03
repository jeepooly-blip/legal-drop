'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ROLES = [
  { value: 'client', emoji: '&#x1F464;', label: 'Client', sub: 'I need legal help' },
  { value: 'lawyer', emoji: '&#x2696;&#xFE0F;', label: 'Lawyer', sub: 'I provide services' },
] as const

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [serverErr, setServerErr] = useState<string | null>(null)
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'client' },
  })
  const role = watch('role')
  const onSubmit = async (data: RegisterInput) => {
    setServerErr(null)
    const { error } = await supabase.auth.signUp({
      email: data.email, password: data.password,
      options: { data: { full_name: data.full_name, role: data.role } },
    })
    if (error) { setServerErr(error.message); return }
    router.push(data.role === 'lawyer' ? '/onboarding' : '/dashboard')
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <span className="text-3xl font-black">&#x2696;&#xFE0F; LegalDrop</span>
          <p className="text-slate-500 text-sm mt-1">Create your account</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Get started</CardTitle><CardDescription>Join as a client or verified lawyer</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => setValue('role', r.value)}
                      className={'rounded-xl border-2 p-4 text-center transition-all ' + (role === r.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 hover:border-slate-400')}>
                      <span className="block text-2xl mb-1" dangerouslySetInnerHTML={{ __html: r.emoji }} />
                      <span className="block text-sm font-semibold">{r.label}</span>
                      <span className={'block text-xs ' + (role === r.value ? 'text-slate-300' : 'text-slate-500')}>{r.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" placeholder="Your full name" {...register('full_name')} />
                {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Min 8 characters" {...register('password')} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
              {serverErr && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{serverErr}</div>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Account'}</Button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-4">
              Already registered?{' '}
              <Link href="/login" className="font-semibold text-slate-900 hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
