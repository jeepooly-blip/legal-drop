'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const supabase =  await createClient()
  const [err, setErr] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })
  const onSubmit = async (data: LoginInput) => {
    setErr(null)
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
    if (error) { setErr(error.message); return }
    router.refresh()
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <span className="text-3xl font-black">&#x2696;&#xFE0F; LegalDrop</span>
          <p className="text-slate-500 text-sm mt-1">Anonymous. Fixed-price. Async.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Sign in</CardTitle><CardDescription>Enter your credentials to continue</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {err && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{err}</div>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-4">
              No account?{' '}
              <Link href="/register" className="font-semibold text-slate-900 hover:underline">Register free</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
