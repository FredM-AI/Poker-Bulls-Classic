import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { role, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!role) {
    return <Navigate to={`/login?redirectedFrom=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <>{children}</>
}
