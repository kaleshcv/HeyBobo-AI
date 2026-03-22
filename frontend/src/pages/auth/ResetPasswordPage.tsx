import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators'

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const { resetPassword } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = (data: ResetPasswordInput) => {
    if (token) {
      resetPassword(token, data.password)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h1>
        <p className="text-gray-600 mb-8">Enter a new password for your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
          <Button fullWidth>Reset Password</Button>
        </form>

        <p className="text-sm text-gray-600 text-center">
          <a href="/auth/login" className="text-primary-600 hover:text-primary-700">
            Back to login
          </a>
        </p>
      </Card>
    </div>
  )
}
