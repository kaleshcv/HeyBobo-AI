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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import PersonIcon from '@mui/icons-material/Person'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!firstName.trim()) e.firstName = 'First name is required'
    if (!lastName.trim()) e.lastName = 'Last name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Must be at least 6 characters'
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    registerUser(email, password, firstName, lastName, role)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel — Dubai Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '45%',
          background: 'linear-gradient(135deg, #0a1628 0%, #152e4f 40%, #0D1B2A 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
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

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: 3,
            background: 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            mb: 3, boxShadow: '0 8px 32px rgba(201,168,76,0.3)',
          }}>
            <AutoAwesomeIcon sx={{ color: '#0D1B2A', fontSize: 36 }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#F5F0E8', mb: 2 }}>
            HeyBobo
          </Typography>
          <Typography variant="h6" sx={{
            background: 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontWeight: 600, mb: 3,
          }}>
            Join the Future of Learning
          </Typography>
          <Typography sx={{ color: '#B8C8D8', lineHeight: 1.7, fontSize: 15 }}>
            Create your account and unlock AI-powered education, fitness tracking, dietary planning, and lifestyle management.
          </Typography>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 4, mt: 5, justifyContent: 'center' }}>
            {[
              { value: '10K+', label: 'Learners' },
              { value: '500+', label: 'Courses' },
              { value: '4.9', label: 'Rating' },
            ].map((stat) => (
              <Box key={stat.label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#C9A84C', fontSize: 22, fontWeight: 700 }}>{stat.value}</Typography>
                <Typography sx={{ color: '#B8C8D8', fontSize: 12 }}>{stat.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Panel — Register Form */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: '#F8F6F1', px: 3, py: 4,
      }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%', maxWidth: 480, p: 5, borderRadius: 4,
            border: '1px solid rgba(201,168,76,0.15)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B2A', mb: 0.5 }}>
            Create your account
          </Typography>
          <Typography variant="body2" sx={{ color: '#4A5568', mb: 3 }}>
            Join HeyBobo and start learning today
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Role selector */}
            <Box>
              <Typography variant="caption" sx={{ mb: 0.75, display: 'block', fontWeight: 600, color: '#4A5568' }}>
                I am a...
              </Typography>
              <ToggleButtonGroup
                value={role}
                exclusive
                onChange={(_, v) => v && setRole(v)}
                fullWidth
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none', fontWeight: 600, borderRadius: 2.5,
                    py: 1, gap: 0.75,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(201,168,76,0.12)',
                      borderColor: '#C9A84C',
                      color: '#0D1B2A',
                      '&:hover': { bgcolor: 'rgba(201,168,76,0.2)' },
                    },
                  },
                }}
              >
                <ToggleButton value="student"><PersonIcon sx={{ fontSize: 18 }} /> Student</ToggleButton>
                <ToggleButton value="teacher"><MenuBookIcon sx={{ fontSize: 18 }} /> Teacher</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                error={!!errors.firstName} helperText={errors.firstName} fullWidth size="small" autoComplete="given-name" />
              <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)}
                error={!!errors.lastName} helperText={errors.lastName} fullWidth size="small" autoComplete="family-name" />
            </Box>

            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email} helperText={errors.email} fullWidth size="small" autoComplete="email" />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password} helperText={errors.password}
              fullWidth size="small" autoComplete="new-password"
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

            <TextField
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword} helperText={errors.confirmPassword}
              fullWidth size="small" autoComplete="new-password"
            />

            <Button
              type="submit" variant="contained" fullWidth
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
              Create Account
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: '#4A5568', textAlign: 'center', mt: 3 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/auth/login" sx={{
              fontWeight: 600, color: '#C9A84C', '&:hover': { color: '#B08A32' },
            }}>
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}
