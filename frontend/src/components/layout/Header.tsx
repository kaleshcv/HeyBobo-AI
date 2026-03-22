import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown } from '@/components/ui/Dropdown'
import { useUnreadCount } from '@/hooks/useNotifications'
import { getInitials } from '@/lib/utils'
import { UserRole } from '@/types/index'

export const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, hasRole } = useAuth()
  const { data: unreadCount = 0 } = useUnreadCount()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  const dropdownItems = [
    { id: 'my-learning', label: 'My Learning', onClick: () => navigate('/student/my-learning') },
    { id: 'profile', label: 'Profile', onClick: () => navigate('/student/profile') },
    ...(hasRole([UserRole.TEACHER, UserRole.CREATOR])
      ? [{ id: 'teacher', label: 'Teacher Dashboard', onClick: () => navigate('/teacher/dashboard') }]
      : []),
    ...(hasRole(UserRole.ADMIN)
      ? [{ id: 'admin', label: 'Admin Dashboard', onClick: () => navigate('/admin/dashboard') }]
      : []),
    { id: 'divider1', label: '', divider: true },
    { id: 'logout', label: 'Logout', onClick: handleLogout, danger: true },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg" />
            <span className="text-xl font-bold text-gray-900 hidden sm:inline">Heybobo</span>
          </Link>



          {/* Right side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button
                  onClick={() => navigate('/student/notifications')}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full" />
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
                  align="right"
                />
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/auth/login')}
                  className="hidden sm:inline-flex"
                >
                  Login
                </Button>
                <Button
                  size="md"
                  onClick={() => navigate('/auth/register')}
                  className="hidden sm:inline-flex"
                >
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            {!isAuthenticated && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    navigate('/auth/login')
                    setMobileMenuOpen(false)
                  }}
                >
                  Login
                </Button>
                <Button
                  fullWidth
                  onClick={() => {
                    navigate('/auth/register')
                    setMobileMenuOpen(false)
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
