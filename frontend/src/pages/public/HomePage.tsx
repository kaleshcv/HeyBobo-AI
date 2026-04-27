import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff, Sun, Moon, Languages } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { t } from '@/lib/translations'

const REMEMBER_KEY = 'edu_remember'

function getSaved() {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as { email: string }
  } catch { return null }
}

export default function HomePage() {
  const { login, isAuthenticated } = useAuth()
  const saved = getSaved()
  const [email, setEmail]           = useState(saved?.email ?? '')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(!!saved)
  const [errors, setErrors]         = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading]   = useState(false)

  const theme          = useUIStore((s) => s.theme)
  const toggleTheme    = useUIStore((s) => s.toggleTheme)
  const language       = useUIStore((s) => s.language)
  const toggleLanguage = useUIStore((s) => s.toggleLanguage)
  const isRTL          = useUIStore((s) => s.isRTL)
  const isDark         = theme === 'dark'

  if (isAuthenticated) return <Navigate to="/app" replace />

  const validate = () => {
    const e: typeof errors = {}
    if (!email.trim()) e.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = language === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email address'
    if (!password) e.password = language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email }))
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }
    try {
      await login(email, password)
    } finally {
      setIsLoading(false)
    }
  }

  // Colors
  const accent       = isDark ? '#C9A84C' : '#00843D'
  const accentLight  = isDark ? '#E5B84E' : '#00A650'
  const bgMain       = isDark ? '#0D1B2A' : '#F0FAF5'
  const borderColor  = isDark ? 'rgba(201,168,76,0.2)' : '#D1E8DA'
  const textPrimary  = isDark ? '#F5F0E8' : '#1C1C1C'
  const textSecondary= isDark ? '#B8C8D8' : '#4A5568'
  const inputBg      = isDark ? 'rgba(255,255,255,0.05)' : '#F8F9FA'

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: bgMain,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Cairo", "Inter", sans-serif',
      }}
    >
      {/* ─── Background decorative circles ─── */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 60%)'
          : 'radial-gradient(circle, rgba(0,132,61,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: 400, height: 400, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(45,74,110,0.5) 0%, transparent 60%)'
          : 'radial-gradient(circle, rgba(0,166,80,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '30%',
        width: 300, height: 300, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 60%)'
          : 'radial-gradient(circle, rgba(0,132,61,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* ─── Top bar (theme + language toggles) ─── */}
      <div style={{
        position: 'absolute', top: 20,
        [isRTL ? 'left' : 'right']: 24,
        display: 'flex', alignItems: 'center', gap: 8,
        zIndex: 10,
      }}>
        <button
          onClick={toggleLanguage}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px',
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
            background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
            color: textPrimary,
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: '"Cairo", "Inter", sans-serif',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
        >
          <Languages size={15} color={accent} />
          {language === 'en' ? 'عربي' : 'English'}
        </button>

        <button
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40,
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
            background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isDark
            ? <Sun size={17} color={accent} />
            : <Moon size={17} color={accent} />
          }
        </button>
      </div>

      {/* ─── Left panel (hero / branding) ─── */}
      <div style={{
        flex: '1 1 55%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        background: isDark
          ? 'linear-gradient(135deg, #0a1628 0%, #152e4f 40%, #0D1B2A 100%)'
          : 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 40%, #F0FAF5 100%)',
        position: 'relative',
      }}>
        {/* Logo mark */}
        <div style={{
          width: 72, height: 72,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${accent} 0%, ${accentLight} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          boxShadow: isDark
            ? '0 8px 32px rgba(201,168,76,0.3)'
            : '0 8px 32px rgba(0,132,61,0.25)',
        }}>
          <span style={{
            fontSize: 32, fontWeight: 800,
            color: isDark ? '#0D1B2A' : '#FFFFFF',
            fontFamily: '"Cairo", "Inter", sans-serif',
          }}>H</span>
        </div>

        {/* App name */}
        <h1 style={{
          fontSize: 42,
          fontWeight: 800,
          margin: '0 0 12px 0',
          background: `linear-gradient(135deg, ${accent} 0%, ${accentLight} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: '"Cairo", "Inter", sans-serif',
          textAlign: 'center',
          letterSpacing: '-0.01em',
        }}>
          {t(language, 'appName')}
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 16,
          color: textSecondary,
          textAlign: 'center',
          maxWidth: 340,
          margin: '0 0 48px 0',
          lineHeight: 1.6,
          fontFamily: '"Cairo", "Inter", sans-serif',
        }}>
          {t(language, 'tagline')}
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 400 }}>
          {[
            { icon: '🎓', label: t(language, 'education') },
            { icon: '❤️', label: t(language, 'health') },
            { icon: '💪', label: t(language, 'fitness') },
            { icon: '🥗', label: t(language, 'dietary') },
            { icon: '🛍️', label: t(language, 'shopping') },
            { icon: '✨', label: t(language, 'grooming') },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              borderRadius: 24,
              background: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(0,132,61,0.08)',
              border: `1px solid ${isDark ? 'rgba(201,168,76,0.2)' : 'rgba(0,132,61,0.15)'}`,
              fontSize: 12,
              fontWeight: 600,
              color: accent,
              fontFamily: '"Cairo", "Inter", sans-serif',
            }}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Dubai skyline accent */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent 0%, ${accent} 30%, ${accentLight} 60%, transparent 100%)`,
          opacity: 0.6,
        }} />
      </div>

      {/* ─── Right panel (login form) ─── */}
      <div style={{
        flex: '0 0 420px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        background: isDark ? '#0D1B2A' : '#FFFFFF',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 360,
          animation: 'fadeIn 0.5s ease',
        }}>
          {/* Form header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: 26,
              fontWeight: 800,
              color: textPrimary,
              margin: '0 0 6px 0',
              fontFamily: '"Cairo", "Inter", sans-serif',
              letterSpacing: '-0.02em',
            }}>
              {t(language, 'welcomeBack')}
            </h2>
            <p style={{
              fontSize: 14,
              color: textSecondary,
              margin: 0,
              fontFamily: '"Cairo", "Inter", sans-serif',
            }}>
              {t(language, 'signInSubtitle')}
            </p>

            {/* Gold/Emerald accent line */}
            <div style={{
              marginTop: 14,
              height: 3,
              width: 48,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${accent}, ${accentLight})`,
              [isRTL ? 'marginRight' : 'marginLeft']: isRTL ? 'auto' : 0,
            }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: textPrimary,
                marginBottom: 6,
                fontFamily: '"Cairo", "Inter", sans-serif',
              }}>
                {t(language, 'email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                dir={isRTL ? 'rtl' : 'ltr'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1px solid ${errors.email ? '#ef4444' : borderColor}`,
                  background: inputBg,
                  color: textPrimary,
                  fontSize: 14,
                  fontFamily: '"Cairo", "Inter", sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                placeholder={language === 'ar' ? 'example@email.com' : 'you@example.com'}
                onFocus={(e) => {
                  e.target.style.borderColor = accent
                  e.target.style.boxShadow   = `0 0 0 3px ${isDark ? 'rgba(201,168,76,0.1)' : 'rgba(0,132,61,0.1)'}`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email ? '#ef4444' : borderColor
                  e.target.style.boxShadow   = 'none'
                }}
              />
              {errors.email && (
                <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontFamily: '"Cairo", "Inter", sans-serif' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: textPrimary,
                marginBottom: 6,
                fontFamily: '"Cairo", "Inter", sans-serif',
              }}>
                {t(language, 'password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  dir={isRTL ? 'rtl' : 'ltr'}
                  style={{
                    width: '100%',
                    padding: isRTL ? '12px 14px 12px 44px' : '12px 44px 12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${errors.password ? '#ef4444' : borderColor}`,
                    background: inputBg,
                    color: textPrimary,
                    fontSize: 14,
                    fontFamily: '"Cairo", "Inter", sans-serif',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    e.target.style.borderColor = accent
                    e.target.style.boxShadow   = `0 0 0 3px ${isDark ? 'rgba(201,168,76,0.1)' : 'rgba(0,132,61,0.1)'}`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? '#ef4444' : borderColor
                    e.target.style.boxShadow   = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    [isRTL ? 'left' : 'right']: 14,
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: textSecondary,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontFamily: '"Cairo", "Inter", sans-serif' }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: textSecondary,
                fontFamily: '"Cairo", "Inter", sans-serif',
                userSelect: 'none',
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: 16, height: 16,
                    accentColor: accent,
                    cursor: 'pointer',
                  }}
                />
                {t(language, 'rememberMe')}
              </label>
              <a
                href="/auth/forgot-password"
                style={{
                  fontSize: 13,
                  color: accent,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontFamily: '"Cairo", "Inter", sans-serif',
                }}
              >
                {t(language, 'forgotPassword')}
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 10,
                border: 'none',
                background: isLoading
                  ? (isDark ? 'rgba(201,168,76,0.4)' : 'rgba(0,132,61,0.4)')
                  : `linear-gradient(135deg, ${accent} 0%, ${accentLight} 100%)`,
                color: isDark ? '#0D1B2A' : '#FFFFFF',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: '"Cairo", "Inter", sans-serif',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : (isDark ? '0 4px 20px rgba(201,168,76,0.3)' : '0 4px 20px rgba(0,132,61,0.25)'),
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
              }}
            >
              {isLoading
                ? (language === 'ar' ? '...' : '...')
                : t(language, 'signIn')
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(201,168,76,0.15)' : '#E2EBE8' }} />
            <span style={{ fontSize: 12, color: textSecondary, fontFamily: '"Cairo", "Inter", sans-serif' }}>
              {language === 'ar' ? 'أو' : 'OR'}
            </span>
            <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(201,168,76,0.15)' : '#E2EBE8' }} />
          </div>

          {/* Register CTA */}
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontSize: 14,
              color: textSecondary,
              fontFamily: '"Cairo", "Inter", sans-serif',
            }}>
              {language === 'ar' ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
            </span>
            <a
              href="/auth/register"
              style={{
                fontSize: 14,
                color: accent,
                fontWeight: 700,
                textDecoration: 'none',
                fontFamily: '"Cairo", "Inter", sans-serif',
              }}
            >
              {t(language, 'getStarted')}
            </a>
          </div>

          {/* Bottom accent */}
          <div style={{
            marginTop: 32,
            textAlign: 'center',
            fontSize: 11,
            color: isDark ? 'rgba(201,168,76,0.35)' : 'rgba(0,132,61,0.3)',
            fontFamily: '"Cairo", "Inter", sans-serif',
            letterSpacing: '0.08em',
          }}>
            {language === 'ar' ? '🇦🇪 دبي، الإمارات العربية المتحدة' : '🇦🇪 Dubai, United Arab Emirates'}
          </div>

          {/* Developer attribution */}
          <div style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: isDark ? '1px solid rgba(201,168,76,0.15)' : '1px solid #E2EBE8',
            textAlign: 'center',
            fontSize: 11,
            color: textSecondary,
            fontFamily: '"Cairo", "Inter", sans-serif',
            letterSpacing: '0.04em',
            lineHeight: 1.5,
          }}>
            {language === 'ar' ? 'تم تطويره بواسطة ' : 'Developed by '}
            <span style={{ fontWeight: 700, color: accent }}>
              ZESTORA ARTIFICIAL INTELLIGENCE DEVELOPING SERVICES LLC
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
