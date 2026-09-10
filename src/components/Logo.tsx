import { Link } from 'react-router-dom'

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-3 text-primary hover:text-primary/90 transition-colors">
      <img src="/poker-bulls-club-logo.png" alt="Poker Bulls Club Logo" className="h-14 w-auto" />
    </Link>
  )
}

export default Logo
