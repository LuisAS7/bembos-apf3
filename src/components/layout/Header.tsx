import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation.tsx'

export function Header() {
  return <header className="site-header">
    <div className="container header-inner">
      <Link className="brand" to="/menu"><span>Bembos</span></Link>
      <p className="header-location"><MapPin size={20} aria-hidden="true" /><span>Bembos San Miguel</span></p>
      <BottomNavigation />
    </div>
  </header>
}
