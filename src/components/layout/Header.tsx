import { Link } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation.tsx'
import { LocalSelector } from '../../features/locations/LocalSelector.tsx'
import { AccessibilityMenu } from '../../features/accessibility/AccessibilityMenu.tsx'

export function Header() {
  return <header className="site-header">
    <div className="container header-inner">
      <Link className="brand" to="/menu"><img src="/images/official/logo.svg" alt="Bembos, inicio" width={138} height={48} /></Link>
      <LocalSelector />
      <AccessibilityMenu />
      <BottomNavigation />
    </div>
  </header>
}
