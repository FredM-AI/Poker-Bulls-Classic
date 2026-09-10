import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login, continueAsGuest, role } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (role === 'admin' || role === 'floor_manager') {
      navigate(searchParams.get('redirectedFrom') || '/dashboard', { replace: true })
    } else if (role === 'guest') {
      // Guests never have access to the routes real accounts redirect back to
      // (settings, live management, etc.), so just send them to the dashboard.
      navigate('/dashboard', { replace: true })
    }
  }, [role, navigate, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const result = await login(email, password)
    setIsSubmitting(false)
    if (result.error) {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Connexion</CardTitle>
          <CardDescription>Connecte-toi pour gérer les tournois.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Se connecter'}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={continueAsGuest}>
            Continuer en tant qu'invité
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
