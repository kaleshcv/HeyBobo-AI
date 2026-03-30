import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Bell, Sun, Moon, Languages } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown } from '@/components/ui/Dropdown'
import { useUnreadCount } from '@/hooks/useNotifications'
import { getInitials } from '@/lib/utils'
import { UserRole } from '@/types/index'
import { useUIStore } from '@/store/uiStore'
import { t } from '@/lib/translations'

export const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, hasRole } = useAuth()
  const { data: unreadCount = 0 } = useUnreadCount()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const theme          = useUIStore((s) => s.theme)
  const toggleTheme    = useUIStore((s) => s.toggleTheme)
  const language       = useUIStore((s) => s.language)
  const toggleLanguage = useUIStore((s) => s.toggleLanguage)
  const isRTL          = useUIStore((s) => s.isRTL)
  const isDark         = theme === 'dark'

  const accent       = isDark ? '#C9A84C' : '#00843D'
  const headerBg     = isDark ? '#0D1B2A' : '#FFFFFF'
  const borderColor  = isDark ? 'rgba(201,168,76,0.15)' : '#E2EBE8'
  const textPrimary  = isDark ? '#F5F0E8' : '#1C1C1C'
  const textSecondary= isDark ? '#B8C8D8' : '#4A5568'

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  const dropdownItems = [
    { id: 'my-learning', label: t(language, 'myLearning'),     onClick: () => navigate('/student/my-learning') },
    { id: 'profile',     label: t(language, 'profile'),         onClick: () => navigate('/student/profile') },
    ...(hasRole([UserRole.TEACHER, UserRole.CREATOR])
      ? [{ id: 'teacher', label: t(language, 'teacherDashboard'), onClick: () => navigate('/teacher/dashboard') }]
      : []),
    ...(hasRole(UserRole.ADMIN)
      ? [{ id: 'admin', label: t(language, 'adminDashboard'), onClick: () => navigate('/admin/dashboard') }]
      : []),
    { id: 'divider1', label: '', divider: true },
    { id: 'logout', label: t(language, 'logout'), onClick: handleLogout, danger: true },
  ]

  return (
    <header
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        background: headerBg,
        borderBottom: `1px solid ${borderColor}`,
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: isDark
          ? '0 2px 20px rgba(0,0,0,0.3)'
          : '0 2px 20px rgba(0,132,61,0.06)',
        fontFamily: '"Cairo", "Inter", sans-serif',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${accent} 0%, ${isDark ? '#E5B84E' : '#00A650'} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isDark ? '0 4px 12px rgba(201,168,76,0.3)' : '0 4px 12px rgba(0,132,61,0.2)',
            }}>
              <span style={{
                fontSize: 16,
                fontWeight: 800,
                color: isDark ? '#0D1B2A' : '#FFFFFF',
                fontFamily: '"Cairo", "Inter", sans-serif',
              }}>H</span>
            </div>
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: accent,
              fontFamily: '"Cairo", "Inter", sans-serif',
              letterSpacing: '-0.01em',
            }}>
              {t(language, 'appName')}
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                background: 'transparent',
                color: textSecondary,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: '"Cairo", "Inter", sans-serif',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
              className="hidden sm:flex"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = accent
                ;(e.currentTarget as HTMLButtonElement).style.color = accent
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = borderColor
                ;(e.currentTarget as HTMLButtonElement).style.color = textSecondary
              }}
            >
              <Languages size={14} />
              {language === 'en' ? 'عربي' : 'English'}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36,
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: textSecondary,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = accent
                ;(e.currentTarget as HTMLButtonElement).style.color = accent
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = borderColor
                ;(e.currentTarget as HTMLButtonElement).style.color = textSecondary
              }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button
                  onClick={() => navigate('/student/notifications')}
                  style={{
                    position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36,
                    borderRadius: 8,
                    border: `1px solid ${borderColor}`,
                    background: 'transparent',
                    cursor: 'pointer',
                    color: textSecondary,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: 4, right: 4,
                      width: 8, height: 8,
                      borderRadius: '50%',
                      background: '#ef4444',
                      border: `2px solid ${headerBg}`,
                    }} />
                  )}
                </button>

                {/* User Menu */}
                <Dropdown
                  trigger={
                    <Avatar
                      initials={getInitials(user!.firstName, user!.lastName)}
                      src={user?.profileImage}
                      size="md"
                      className="cursor-pointer"
                    />
                  }
                  items={dropdownItems}
                  align={isRTL ? 'left' : 'right'}
                />
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/auth/login')}
                  className="hidden sm:inline-flex"
                  style={{
                    borderColor: borderColor,
                    color: textPrimary,
                    fontFamily: '"Cairo", "Inter", sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {t(language, 'login')}
                </Button>
                <Button
                  size="md"
                  onClick={() => navigate('/auth/register')}
                  className="hidden sm:inline-flex"
                  style={{
                    background: `linear-gradient(135deg, ${accent} 0%, ${isDark ? '#E5B84E' : '#00A650'} 100%)`,
                    color: isDark ? '#0D1B2A' : '#FFFFFF',
                    border: 'none',
                    fontFamily: '"Cairo", "Inter", sans-serif',
                    fontWeight: 700,
                    boxShadow: isDark ? '0 4px 12px rgba(201,168,76,0.25)' : '0 4px 12px rgba(0,132,61,0.2)',
                  }}
                >
                  {t(language, 'getStarted')}
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', color: textSecondary,
                padding: 6,
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              borderTop: `1px solid ${borderColor}`,
              paddingTop: 16,
              paddingBottom: 16,
            }}
            className="md:hidden space-y-4"
          >
            {/* Mobile: language + theme */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                onClick={toggleLanguage}
                style={{
                  flex: 1, padding: '8px', borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  background: 'transparent',
                  color: textPrimary,
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: '"Cairo", "Inter", sans-serif',
                }}
              >
                {language === 'en' ? 'عربي' : 'English'}
              </button>
              <button
                onClick={toggleTheme}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  background: 'transparent',
                  color: textPrimary,
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
            {!isAuthenticated && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => { navigate('/auth/login'); setMobileMenuOpen(false) }}
                  style={{ fontFamily: '"Cairo", "Inter", sans-serif', fontWeight: 600 }}
                >
                  {t(language, 'login')}
                </Button>
                <Button
                  fullWidth
                  onClick={() => { navigate('/auth/register'); setMobileMenuOpen(false) }}
                  style={{
                    background: `linear-gradient(135deg, ${accent} 0%, ${isDark ? '#E5B84E' : '#00A650'} 100%)`,
                    color: isDark ? '#0D1B2A' : '#FFFFFF',
                    border: 'none',
                    fontFamily: '"Cairo", "Inter", sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {t(language, 'getStarted')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
