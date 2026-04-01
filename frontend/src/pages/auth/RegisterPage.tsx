import { useState, useEffect } from 'react'
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
  CircularProgress,
  Chip,
  useTheme,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import PersonIcon from '@mui/icons-material/Person'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import TranslateIcon from '@mui/icons-material/Translate'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema } from '@/lib/validators'
import { authApi } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'
import { useUIStore } from '@/store/uiStore'
import { t } from '@/lib/translations'

export default function RegisterPage() {
  const dk = useTheme().palette.mode === 'dark'
  const { register: registerUser, isAuthenticated, registerLoading } = useAuth()
  const { language, toggleLanguage } = useUIStore()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

  const debouncedUsername = useDebounce(username, 500)

  // Check username availability
  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(debouncedUsername)) {
      setUsernameStatus('idle')
      return
    }
    let cancelled = false
    setUsernameStatus('checking')
    authApi.checkUsername(debouncedUsername)
      .then((res) => {
        if (!cancelled) {
          // TransformInterceptor wraps: { success, data: { available }, message }
          const inner = (res.data as any)?.data ?? res.data
          setUsernameStatus(inner?.available ? 'available' : 'taken')
        }
      })
      .catch(() => {
        if (!cancelled) setUsernameStatus('idle')
      })
    return () => { cancelled = true }
  }, [debouncedUsername])

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const validate = () => {
    const result = registerSchema.safeParse({
      firstName, lastName, username, email, password, confirmPassword, role,
    })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((e) => {
        const field = e.path[0] as string
        if (!fieldErrors[field]) fieldErrors[field] = e.message
      })
      setErrors(fieldErrors)
      return false
    }
    if (usernameStatus === 'taken') {
      setErrors({ username: 'Username is already taken' })
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    await registerUser({ email, password, firstName, lastName, username, role })
  }

  // Password strength
  const pwChecks = [
    { label: t(language, 'pwCheck8chars'), pass: password.length >= 8 },
    { label: t(language, 'pwCheckLower'), pass: /[a-z]/.test(password) },
    { label: t(language, 'pwCheckUpper'), pass: /[A-Z]/.test(password) },
    { label: t(language, 'pwCheckNumber'), pass: /\d/.test(password) },
    { label: t(language, 'pwCheckSpecial'), pass: /[@$!%*?&]/.test(password) },
  ]

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel — Dubai Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '45%',
          background: dk ? 'linear-gradient(135deg, #0a1628 0%, #152e4f 40%, #0D1B2A 100%)' : 'linear-gradient(135deg, #00843D 0%, #00A650 40%, #006B30 100%)',
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
          background: dk ? 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 60%)' : 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: 400, height: 400,
          background: dk ? 'radial-gradient(circle, rgba(45,74,110,0.5) 0%, transparent 60%)' : 'radial-gradient(circle, rgba(0,80,30,0.3) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: 3,
            background: dk ? 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)' : 'linear-gradient(135deg, #fff 0%, #E8F5E9 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            mb: 3, boxShadow: dk ? '0 8px 32px rgba(201,168,76,0.3)' : '0 8px 32px rgba(0,132,61,0.3)',
          }}>
            <AutoAwesomeIcon sx={{ color: dk ? '#0D1B2A' : '#00843D', fontSize: 36 }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#F5F0E8', mb: 2, textShadow: dk ? 'none' : '0 2px 8px rgba(0,0,0,0.15)' }}>
            HeyBobo
          </Typography>
          <Typography variant="h6" sx={{
            background: dk ? 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)' : 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontWeight: 600, mb: 3,
          }}>
            {t(language, 'joinFutureOfLearning')}
          </Typography>
          <Typography sx={{ color: dk ? '#B8C8D8' : '#E0F5EA', lineHeight: 1.7, fontSize: 15 }}>
            {t(language, 'registerTagline')}
          </Typography>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 4, mt: 5, justifyContent: 'center' }}>
            {[
              { value: '10K+', label: t(language, 'statLearners') },
              { value: '500+', label: t(language, 'statCoursesLabel') },
              { value: '4.9', label: t(language, 'statRating') },
            ].map((stat) => (
              <Box key={stat.label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: dk ? '#C9A84C' : '#fff', fontSize: 22, fontWeight: 700 }}>{stat.value}</Typography>
                <Typography sx={{ color: dk ? '#B8C8D8' : '#E0F5EA', fontSize: 12 }}>{stat.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Panel — Register Form */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: dk ? '#0D1B2A' : '#F8F6F1', px: 3, py: 4,
      }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%', maxWidth: 480, p: 5, borderRadius: 4,
            border: dk ? '1px solid rgba(201,168,76,0.15)' : '1px solid rgba(0,132,61,0.15)',
            boxShadow: dk ? '0 8px 40px rgba(0,0,0,0.3)' : '0 8px 40px rgba(0,0,0,0.06)',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: dk ? '#F5F0E8' : '#0D1B2A', mb: 0.5 }}>
            {t(language, 'createYourAccount')}
          </Typography>
          <Typography variant="body2" sx={{ color: dk ? '#B8C8D8' : '#4A5568', mb: 3 }}>
            {t(language, 'joinHeyBobo')}
          </Typography>

          {/* Language toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0 }}>
            <Button
              size="small"
              startIcon={<TranslateIcon sx={{ fontSize: 16 }} />}
              onClick={toggleLanguage}
              sx={{
                textTransform: 'none', fontWeight: 600, fontSize: 12,
                color: dk ? '#C9A84C' : '#00843D',
                '&:hover': { bgcolor: dk ? 'rgba(201,168,76,0.08)' : 'rgba(0,132,61,0.08)' },
              }}
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Role selector */}
            <Box>
              <Typography variant="caption" sx={{ mb: 0.75, display: 'block', fontWeight: 600, color: dk ? '#B8C8D8' : '#4A5568' }}>
                {t(language, 'iAmLabel')}
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
                      bgcolor: dk ? 'rgba(201,168,76,0.12)' : 'rgba(0,132,61,0.12)',
                      borderColor: dk ? '#C9A84C' : '#00843D',
                      color: dk ? '#F5F0E8' : '#0D1B2A',
                      '&:hover': { bgcolor: dk ? 'rgba(201,168,76,0.2)' : 'rgba(0,132,61,0.2)' },
                    },
                  },
                }}
              >
                <ToggleButton value="student"><PersonIcon sx={{ fontSize: 18 }} /> {t(language, 'studentRole')}</ToggleButton>
                <ToggleButton value="teacher"><MenuBookIcon sx={{ fontSize: 18 }} /> {t(language, 'teacherRole')}</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField label={t(language, 'firstNameLabel')} value={firstName} onChange={(e) => setFirstName(e.target.value)}
                error={!!errors.firstName} helperText={errors.firstName} fullWidth size="small" autoComplete="given-name" />
              <TextField label={t(language, 'lastNameLabel')} value={lastName} onChange={(e) => setLastName(e.target.value)}
                error={!!errors.lastName} helperText={errors.lastName} fullWidth size="small" autoComplete="family-name" />
            </Box>

            {/* Username with availability check */}
            <TextField
              label={t(language, 'usernameLabel')}
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              error={!!errors.username || usernameStatus === 'taken'}
              helperText={
                errors.username ||
                (usernameStatus === 'taken' ? t(language, 'usernameTaken') : undefined)
              }
              fullWidth size="small" autoComplete="username"
              placeholder="e.g. john_doe"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {usernameStatus === 'checking' && <CircularProgress size={18} sx={{ color: dk ? '#C9A84C' : '#00843D' }} />}
                    {usernameStatus === 'available' && <CheckCircleIcon sx={{ fontSize: 18, color: '#00843D' }} />}
                    {usernameStatus === 'taken' && <CancelIcon sx={{ fontSize: 18, color: '#d32f2f' }} />}
                  </InputAdornment>
                ),
              }}
            />

            <TextField label={t(language, 'email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email} helperText={errors.email} fullWidth size="small" autoComplete="email" />

            <TextField
              label={t(language, 'password')}
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

            {/* Password strength */}
            {password.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {pwChecks.map((c) => (
                  <Chip
                    key={c.label}
                    label={c.label}
                    size="small"
                    icon={c.pass ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                    sx={{
                      fontSize: 11, height: 22,
                      bgcolor: c.pass ? 'rgba(0,132,61,0.1)' : dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                      color: c.pass ? '#00843D' : dk ? '#888' : '#999',
                      '& .MuiChip-icon': { color: '#00843D' },
                    }}
                  />
                ))}
              </Box>
            )}

            <TextField
              label={t(language, 'confirmPasswordLabel')}
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword} helperText={errors.confirmPassword}
              fullWidth size="small" autoComplete="new-password"
            />

            <Button
              type="submit" variant="contained" fullWidth
              disabled={registerLoading}
              sx={{
                mt: 1, py: 1.4, fontWeight: 700, borderRadius: 2.5,
                background: dk ? 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)' : 'linear-gradient(135deg, #00843D 0%, #00A650 100%)',
                color: dk ? '#0D1B2A' : '#fff', fontSize: 15,
                boxShadow: dk ? '0 4px 20px rgba(201,168,76,0.3)' : '0 4px 20px rgba(0,132,61,0.3)',
                '&:hover': {
                  background: dk ? 'linear-gradient(135deg, #B08A32 0%, #C9A84C 100%)' : 'linear-gradient(135deg, #006B30 0%, #00843D 100%)',
                  boxShadow: dk ? '0 6px 28px rgba(201,168,76,0.4)' : '0 6px 28px rgba(0,132,61,0.4)',
                },
                '&.Mui-disabled': { opacity: 0.7 },
              }}
            >
              {registerLoading ? <CircularProgress size={22} sx={{ color: dk ? '#0D1B2A' : '#fff' }} /> : t(language, 'createAccountBtn')}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: dk ? '#B8C8D8' : '#4A5568', textAlign: 'center', mt: 3 }}>
            {t(language, 'alreadyHaveAccount')}{' '}
            <Link component={RouterLink} to="/auth/login" sx={{
              fontWeight: 600, color: dk ? '#C9A84C' : '#00843D', '&:hover': { color: dk ? '#B08A32' : '#006B30' },
            }}>
              {t(language, 'signInLink')}
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}
