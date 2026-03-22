import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X, Home, BookOpen, Zap, Award, User, Bell } from 'lucide-react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/student/dashboard' },
    { id: 'learning', label: 'My Learning', icon: BookOpen, href: '/student/my-learning' },
    { id: 'ai-tutor', label: 'AI Tutor', icon: Zap, href: '/student/ai-tutor' },
    { id: 'certificates', label: 'Certificates', icon: Award, href: '/student/certificates' },
    { id: 'profile', label: 'Profile', icon: User, href: '/student/profile' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/student/notifications' },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          {/* Sidebar */}
          <Sidebar
            items={navItems}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content */}
          <main className="flex-1 relative">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden sticky top-16 bg-white border-b border-gray-200 p-4 z-30">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex items-center gap-2 text-gray-900 hover:text-primary-600"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                {sidebarOpen && 'Close Menu'}
              </button>
            </div>

            <div className="p-4 md:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
