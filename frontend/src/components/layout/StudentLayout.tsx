import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X, Home, BookOpen, Zap, Award, User, Bell } from 'lucide-react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useUIStore } from '@/store/uiStore'
import { t } from '@/lib/translations'

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const theme    = useUIStore((s) => s.theme)
  const language = useUIStore((s) => s.language)
  const isRTL    = useUIStore((s) => s.isRTL)
  const isDark   = theme === 'dark'

  const navItems = [
    { id: 'dashboard',     label: t(language, 'dashboard'),     icon: Home,     href: '/student/dashboard' },
    { id: 'learning',      label: t(language, 'myLearning'),    icon: BookOpen, href: '/student/my-learning' },
    { id: 'ai-tutor',      label: t(language, 'aiTutor'),       icon: Zap,      href: '/student/ai-tutor' },
    { id: 'certificates',  label: language === 'ar' ? 'الشهادات' : 'Certificates', icon: Award, href: '/student/certificates' },
    { id: 'profile',       label: t(language, 'profile'),       icon: User,     href: '/student/profile' },
    { id: 'notifications', label: t(language, 'notifications'), icon: Bell,     href: '/student/notifications' },
  ]

  const toggleBtnBg     = isDark ? 'rgba(201,168,76,0.1)' : 'rgba(0,132,61,0.08)'
  const toggleBtnBorder = isDark ? 'rgba(201,168,76,0.2)' : 'rgba(0,132,61,0.2)'

  return (
    <ErrorBoundary>
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          minHeight: '100vh',
          background: isDark ? '#0D1B2A' : '#F8F9FA',
          fontFamily: '"Cairo", "Inter", sans-serif',
        }}
      >
        <Header />
        <div style={{ display: 'flex' }}>
          <Sidebar
            items={navItems}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content */}
          <main style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            {/* Mobile Menu Toggle */}
            <div
              className="md:hidden sticky top-16 z-30"
              style={{
                background: isDark ? '#1A2B3C' : '#FFFFFF',
                borderBottom: `1px solid ${isDark ? 'rgba(201,168,76,0.12)' : '#E2EBE8'}`,
                padding: '12px 16px',
              }}
            >
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: isDark ? '#C9A84C' : '#00843D',
                  background: toggleBtnBg,
                  border: `1px solid ${toggleBtnBorder}`,
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: '"Cairo", "Inter", sans-serif',
                }}
              >
                {sidebarOpen
                  ? <><X size={18} /> {language === 'ar' ? 'إغلاق' : 'Close'}</>
                  : <><Menu size={18} /> {language === 'ar' ? 'القائمة' : 'Menu'}</>
                }
              </button>
            </div>

            <div style={{ padding: '24px 32px' }}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
