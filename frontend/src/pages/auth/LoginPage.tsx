import { useState } from 'react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  ThemeProvider,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import TranslateIcon from '@mui/icons-material/Translate'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema } from '@/lib/validators'
import { useUIStore } from '@/store/uiStore'
import { t } from '@/lib/translations'
import { lightTheme } from '@/theme'
import { AnimatedPage, FloatingParticles } from '@/components/animations'

export default function LoginPage() {
  const { login, isAuthenticated, loginLoading } = useAuth()
  const dk = false // light theme forced via ThemeProvider
  const { language, toggleLanguage } = useUIStore()
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
    <ThemeProvider theme={lightTheme}>
    <AnimatedPage>
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
          <Box
            component="img"
            src="/bobo-mascot.png"
            alt="Bobo"
            sx={{ width: 160, height: 160, objectFit: 'contain', mb: 2, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))' }}
          />
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
            {t(language, 'smartLearningPlatform')}
          </Typography>
          <Typography sx={{ color: dk ? '#B8C8D8' : '#E0F5EA', lineHeight: 1.7, fontSize: 15 }}>
            {t(language, 'loginTagline')}
          </Typography>

          {/* Feature dots */}
          <Box sx={{ display: 'flex', gap: 3, mt: 5, justifyContent: 'center' }}>
            {[t(language, 'featureAITutor'), t(language, 'fitness'), t(language, 'featureLifestyle')].map((label) => (
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
        background: '#F8F6F1 !important', px: 3, position: 'relative', overflow: 'hidden',
      }}>
        <FloatingParticles />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 440 }}>
          <motion.div
            initial={{ scale: 0.8, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{ width: 80, height: 80, objectFit: 'contain', mb: 2 }}
            />
          </motion.div>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ width: '100%' }}
        >
        <Paper
          elevation={0}
          sx={{
            width: '100%', p: 5, borderRadius: '16px !important',
            background: '#fff !important',
            color: '#0D1B2A',
            border: '1px solid rgba(0,132,61,0.1) !important',
            boxShadow: '0 8px 40px rgba(0,0,0,0.06) !important',
            '&:hover': {
              boxShadow: '0 8px 40px rgba(0,0,0,0.06) !important',
            },
          }}
        >
          {/* Mobile-only brand */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
            <Box
              component="img"
              src="/bobo-mascot.png"
              alt="Bobo"
              sx={{ width: 44, height: 44, objectFit: 'contain' }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: dk ? '#F5F0E8' : '#0D1B2A' }}>HeyBobo</Typography>
          </Box>

          {/* Language toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
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

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#00843D !important', mb: 0.5 }}>
            {t(language, 'welcomeBackTitle')}
          </Typography>
          <Typography variant="body2" sx={{ color: dk ? '#B8C8D8' : '#4A5568', mb: 3 }}>
            {t(language, 'loginSubtitle')}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <TextField
                label={t(language, 'emailOrUsername')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                error={!!errors.identifier}
                helperText={errors.identifier}
                fullWidth
                size="small"
                autoComplete="username"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <TextField
                label={t(language, 'password')}
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
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
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover:not(.Mui-disabled)': {
                    background: dk
                      ? 'linear-gradient(135deg, #B08A32 0%, #C9A84C 100%)'
                      : 'linear-gradient(135deg, #006B32 0%, #00843D 100%)',
                    boxShadow: dk ? '0 6px 28px rgba(201,168,76,0.4)' : '0 6px 28px rgba(0,132,61,0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-disabled': { opacity: 0.7 },
                }}
              >
                {loginLoading ? <CircularProgress size={22} sx={{ color: dk ? '#0D1B2A' : '#fff' }} /> : t(language, 'signIn')}
              </Button>
            </motion.div>
          </Box>

          <Typography variant="body2" sx={{ color: dk ? '#B8C8D8' : '#4A5568', textAlign: 'center', mt: 3 }}>
            {t(language, 'dontHaveAccount')}{' '}
            <Link component={RouterLink} to="/auth/register" sx={{
              fontWeight: 600, color: dk ? '#C9A84C' : '#00843D',
              '&:hover': { color: dk ? '#B08A32' : '#006B32' },
            }}>
              {t(language, 'createOne')}
            </Link>
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
              pt: 2,
              borderTop: dk ? '1px solid rgba(201,168,76,0.15)' : '1px solid #E2EBE8',
              color: dk ? '#8FA3B8' : '#6B7280',
              fontSize: 11,
              letterSpacing: '0.04em',
              lineHeight: 1.5,
            }}
          >
            Developed by{' '}
            <Box component="span" sx={{ fontWeight: 700, color: dk ? '#C9A84C' : '#00843D' }}>
              ZESTORA ARTIFICIAL INTELLIGENCE DEVELOPING SERVICES LLC
            </Box>
          </Typography>
        </Paper>
        </motion.div>
        </Box>
      </Box>
    </Box>
    </AnimatedPage>
    </ThemeProvider>
  )
}
