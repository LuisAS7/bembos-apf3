import { ClipboardList, Menu } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAppState } from '../../hooks/useAppState.ts'

export function BottomNavigation() {
  const { state } = useAppState()
  return <nav className="base-navigation" aria-label="Navegación principal">
    <NavLink to="/menu" className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
      <Menu size={22} aria-hidden="true" /><span>Menú</span>
    </NavLink>
    <NavLink to="/pedido" className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
      <ClipboardList size={22} aria-hidden="true" /><span>Pedido ({state.order.items.length})</span>
    </NavLink>
  </nav>
}
