import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Home, BookOpen, BarChart3, Users } from 'lucide-react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useTheme } from '@mui/material'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function TeacherLayout() {
  const dk = useTheme().palette.mode === 'dark'
  const [sidebarOpen] = useState(true)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/teacher/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, href: '/teacher/courses' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/teacher/courses/analytics' },
    { id: 'students', label: 'Students', icon: Users, href: '/teacher/students' },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ background: dk ? '#0D1B2A' : '#F8F6F1' }}>
        <Header />
        <div className="flex">
          <Sidebar items={navItems} isOpen={sidebarOpen} />
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
