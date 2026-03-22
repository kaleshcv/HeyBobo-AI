import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Home, Users, BookOpen, Grid3x3, BarChart3, Award } from 'lucide-react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function AdminLayout() {
  const [sidebarOpen] = useState(true)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
    { id: 'teachers', label: 'Teachers', icon: Users, href: '/admin/teachers' },
    { id: 'courses', label: 'Courses', icon: BookOpen, href: '/admin/courses' },
    { id: 'categories', label: 'Categories', icon: Grid3x3, href: '/admin/categories' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { id: 'certificates', label: 'Certificates', icon: Award, href: '/admin/certificates' },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
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
