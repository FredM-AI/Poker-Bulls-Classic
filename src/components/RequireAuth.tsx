import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function RequireAuth({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { role, canManage, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // canManage (admin or floor_manager) rather than "any role", so guest mode
  // never grants access to management routes.
  if (!canManage) {
    return <Navigate to={`/login?redirectedFrom=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
