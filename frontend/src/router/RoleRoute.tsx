import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/index'

interface RoleRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole | UserRole[]
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated && location.pathname !== '/auth/login') {
    return <Navigate to="/auth/login" replace />
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/student/dashboard" replace />
  }

  return <>{children}</>
}
