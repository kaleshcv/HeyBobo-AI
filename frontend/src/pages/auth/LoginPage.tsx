import { useState } from 'react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema } from '@/lib/validators'

export default function LoginPage() {
  const { login, isAuthenticated, loginLoading } = useAuth()
  const dk = useTheme().palette.mode === 'dark'
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({})

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const validate = () => {
    const result = loginSchema.safeParse({ identifier, password })
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof typeof errors
        if (!fieldErrors[field]) fieldErrors[field] = e.message
      })
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    await login(identifier, password)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel — Dubai Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          background: dk
            ? 'linear-gradient(135deg, #0a1628 0%, #152e4f 40%, #0D1B2A 100%)'
            : 'linear-gradient(135deg, #004D23 0%, #006B32 40%, #00843D 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: 500, height: 500,
          background: dk
            ? 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(0,166,80,0.2) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: 400, height: 400,
          background: dk
            ? 'radial-gradient(circle, rgba(45,74,110,0.5) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(0,132,61,0.3) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: 3,
            background: dk
              ? 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)'
              : 'linear-gradient(135deg, #00A650 0%, #00C853 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            mb: 3, boxShadow: dk ? '0 8px 32px rgba(201,168,76,0.3)' : '0 8px 32px rgba(0,132,61,0.3)',
          }}>
            <AutoAwesomeIcon sx={{ color: dk ? '#0D1B2A' : '#fff', fontSize: 36 }} />
          </Box>
          <Typography variant="h3" sx={{
            fontWeight: 800, color: '#F5F0E8', mb: 2, letterSpacing: '-0.02em',
          }}>
            HeyBobo
          </Typography>
          <Typography variant="h6" sx={{
            background: dk
              ? 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)'
              : 'linear-gradient(135deg, #00A650 0%, #00C853 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontWeight: 600, mb: 3,
          }}>
            Smart Learning Platform
          </Typography>
          <Typography sx={{ color: dk ? '#B8C8D8' : '#E0F5EA', lineHeight: 1.7, fontSize: 15 }}>
            Empowering learners with AI-driven education, health tracking, and lifestyle management — all in one premium platform.
          </Typography>

          {/* Feature dots */}
          <Box sx={{ display: 'flex', gap: 3, mt: 5, justifyContent: 'center' }}>
            {['AI Tutor', 'Fitness', 'Lifestyle'].map((label) => (
              <Box key={label} sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: dk ? '#C9A84C' : '#00A650', mx: 'auto', mb: 1,
                  boxShadow: dk ? '0 0 12px rgba(201,168,76,0.4)' : '0 0 12px rgba(0,166,80,0.4)',
                }} />
                <Typography sx={{ color: dk ? '#B8C8D8' : '#E0F5EA', fontSize: 12, fontWeight: 500 }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Panel — Login Form */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: dk ? '#0D1B2A' : '#F8F6F1', px: 3,
      }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%', maxWidth: 440, p: 5, borderRadius: 4,
            border: `1px solid ${dk ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.15)'}`,
            boxShadow: dk ? '0 8px 40px rgba(0,0,0,0.3)' : '0 8px 40px rgba(0,0,0,0.06)',
          }}
        >
          {/* Mobile-only brand */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              background: dk
                ? 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)'
                : 'linear-gradient(135deg, #00843D 0%, #00A650 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AutoAwesomeIcon sx={{ color: dk ? '#0D1B2A' : '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: dk ? '#F5F0E8' : '#0D1B2A' }}>HeyBobo</Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: dk ? '#F5F0E8' : '#0D1B2A', mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: dk ? '#B8C8D8' : '#4A5568', mb: 3 }}>
            Sign in to continue your learning journey
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={!!errors.identifier}
              helperText={errors.identifier}
              fullWidth
              size="small"
              autoComplete="username"
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              fullWidth
              size="small"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loginLoading}
              sx={{
                mt: 1, py: 1.4, fontWeight: 700, borderRadius: 2.5,
                background: dk
                  ? 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)'
                  : 'linear-gradient(135deg, #00843D 0%, #00A650 100%)',
                color: dk ? '#0D1B2A' : '#fff', fontSize: 15,
                boxShadow: dk ? '0 4px 20px rgba(201,168,76,0.3)' : '0 4px 20px rgba(0,132,61,0.3)',
                '&:hover': {
                  background: dk
                    ? 'linear-gradient(135deg, #B08A32 0%, #C9A84C 100%)'
                    : 'linear-gradient(135deg, #006B32 0%, #00843D 100%)',
                  boxShadow: dk ? '0 6px 28px rgba(201,168,76,0.4)' : '0 6px 28px rgba(0,132,61,0.4)',
                },
                '&.Mui-disabled': { opacity: 0.7 },
              }}
            >
              {loginLoading ? <CircularProgress size={22} sx={{ color: dk ? '#0D1B2A' : '#fff' }} /> : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: dk ? '#B8C8D8' : '#4A5568', textAlign: 'center', mt: 3 }}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/auth/register" sx={{
              fontWeight: 600, color: dk ? '#C9A84C' : '#00843D',
              '&:hover': { color: dk ? '#B08A32' : '#006B32' },
            }}>
              Create one
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}
