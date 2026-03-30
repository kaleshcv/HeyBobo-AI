import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTheme } from '@mui/material'
import { useAuth } from '@/hooks/useAuth'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators'

export default function ForgotPasswordPage() {
  const dk = useTheme().palette.mode === 'dark'
  const { forgotPassword } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPassword(data.email)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: dk ? '#0D1B2A' : '#F8F6F1' }}>
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-navy-800 mb-2">Reset Password</h1>
        <p className="text-navy-500 mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <Button fullWidth>Send Reset Link</Button>
        </form>

        <p className="text-sm text-navy-500 text-center">
          Remember your password?{' '}
          <a href="/auth/login" className="text-gold-600 hover:text-gold-700">
            Sign in
          </a>
        </p>
      </Card>
    </div>
  )
}
