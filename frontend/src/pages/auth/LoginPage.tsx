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
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    login(email, password)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel — Dubai Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          background: 'linear-gradient(135deg, #0a1628 0%, #152e4f 40%, #0D1B2A 100%)',
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
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(45,74,110,0.5) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: 3,
            background: 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            mb: 3, boxShadow: '0 8px 32px rgba(201,168,76,0.3)',
          }}>
            <AutoAwesomeIcon sx={{ color: '#0D1B2A', fontSize: 36 }} />
          </Box>
          <Typography variant="h3" sx={{
            fontWeight: 800, color: '#F5F0E8', mb: 2, letterSpacing: '-0.02em',
          }}>
            HeyBobo
          </Typography>
          <Typography variant="h6" sx={{
            background: 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontWeight: 600, mb: 3,
          }}>
            Smart Learning Platform
          </Typography>
          <Typography sx={{ color: '#B8C8D8', lineHeight: 1.7, fontSize: 15 }}>
            Empowering learners with AI-driven education, health tracking, and lifestyle management — all in one premium platform.
          </Typography>

          {/* Feature dots */}
          <Box sx={{ display: 'flex', gap: 3, mt: 5, justifyContent: 'center' }}>
            {['AI Tutor', 'Fitness', 'Lifestyle'].map((label) => (
              <Box key={label} sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#C9A84C', mx: 'auto', mb: 1,
                  boxShadow: '0 0 12px rgba(201,168,76,0.4)',
                }} />
                <Typography sx={{ color: '#B8C8D8', fontSize: 12, fontWeight: 500 }}>
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
        bgcolor: '#F8F6F1', px: 3,
      }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%', maxWidth: 440, p: 5, borderRadius: 4,
            border: '1px solid rgba(201,168,76,0.15)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          }}
        >
          {/* Mobile-only brand */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              background: 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AutoAwesomeIcon sx={{ color: '#0D1B2A', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1B2A' }}>HeyBobo</Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B2A', mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: '#4A5568', mb: 3 }}>
            Sign in to continue your learning journey
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              size="small"
              autoComplete="email"
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
              sx={{
                mt: 1, py: 1.4, fontWeight: 700, borderRadius: 2.5,
                background: 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)',
                color: '#0D1B2A', fontSize: 15,
                boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #B08A32 0%, #C9A84C 100%)',
                  boxShadow: '0 6px 28px rgba(201,168,76,0.4)',
                },
              }}
            >
              Sign In
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: '#4A5568', textAlign: 'center', mt: 3 }}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/auth/register" sx={{
              fontWeight: 600, color: '#C9A84C',
              '&:hover': { color: '#B08A32' },
            }}>
              Create one
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}
