import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation.tsx'
import { getLocation } from '../../data/locations.ts'
import { useAppState } from '../../hooks/useAppState.ts'

export function Header() {
  const { state } = useAppState()
  const locationName = getLocation(state.order.locationId)?.name ?? 'Local por seleccionar'
  return <header className="site-header">
    <div className="container header-inner">
      <Link className="brand" to="/menu"><span>Bembos</span></Link>
      <p className="header-location"><MapPin size={20} aria-hidden="true" /><span>{locationName}</span></p>
      <BottomNavigation />
    </div>
  </header>
}
