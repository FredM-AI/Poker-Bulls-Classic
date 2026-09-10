import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Logo from './Logo'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, LogOut, Home, CalendarDays, Users, BarChart3, LogIn, Trophy, ListTree, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'

const Header = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { role, logout } = useAuth()
  const isAuthenticated = !!role
  const isAdmin = role === 'admin'

  const championshipItems = [
    { href: '/seasons', label: 'Seasons', icon: BarChart3 },
    { href: '/events', label: 'Events', icon: CalendarDays },
  ]

  const playerItem = { href: '/players', label: 'Players', icon: Users }

  const showNav = pathname !== '/login'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Logo />

        {showNav && (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" asChild>
                <Link to="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <ListTree className="mr-2 h-4 w-4" />
                    Championships
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {championshipItems.map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                      <Link to={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" asChild>
                <Link to="/hall-of-fame">
                  <Trophy className="mr-2 h-4 w-4" />
                  HOF
                </Link>
              </Button>

              <Button variant="ghost" asChild>
                <Link to={playerItem.href}>
                  <playerItem.icon className="mr-2 h-4 w-4" />
                  {playerItem.label}
                </Link>
              </Button>

              {isAdmin && (
                <Button variant="ghost" asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              )}

              <div className="flex items-center gap-2 ml-2">
                <ThemeToggle />
                {role === 'guest' && <span className="text-xs text-muted-foreground px-2">Invité</span>}
                {isAuthenticated ? (
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> {role === 'guest' ? 'Quitter' : 'Logout'}
                  </Button>
                ) : (
                  <Button variant="ghost" asChild>
                    <Link to="/login">
                      <LogIn className="mr-2 h-4 w-4" /> Login
                    </Link>
                  </Button>
                )}
              </div>
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[260px] p-4">
                  <nav className="flex flex-col gap-2 mt-6">
                    <Button variant="ghost" className="justify-start text-base py-3 h-auto" asChild>
                      <Link to="/dashboard">
                        <Home className="mr-3 h-5 w-5" />
                        Dashboard
                      </Link>
                    </Button>
                    <p className="text-sm font-medium text-muted-foreground px-4 pt-2">Championships</p>
                    {championshipItems.map((item) => (
                      <Button key={item.label} variant="ghost" className="justify-start text-base py-3 h-auto" asChild>
                        <Link to={item.href}>
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </Link>
                      </Button>
                    ))}
                    <Button variant="ghost" className="justify-start text-base py-3 h-auto" asChild>
                      <Link to="/hall-of-fame">
                        <Trophy className="mr-3 h-5 w-5" />
                        HOF
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-base py-3 h-auto" asChild>
                      <Link to={playerItem.href}>
                        <playerItem.icon className="mr-3 h-5 w-5" />
                        {playerItem.label}
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" className="justify-start text-base py-3 h-auto" asChild>
                        <Link to="/settings">
                          <Settings className="mr-3 h-5 w-5" />
                          Settings
                        </Link>
                      </Button>
                    )}

                    <div className="mt-4 border-t pt-4">
                      {isAuthenticated ? (
                        <Button variant="outline" className="w-full justify-start text-base py-3 h-auto" onClick={handleLogout}>
                          <LogOut className="mr-3 h-5 w-5" /> {role === 'guest' ? 'Quitter le mode invité' : 'Logout'}
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full justify-start text-base py-3 h-auto" asChild>
                          <Link to="/login">
                            <LogIn className="mr-3 h-5 w-5" /> Login
                          </Link>
                        </Button>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
