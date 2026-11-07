import { ShoppingCart, Menu } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAppState } from '../../hooks/useAppState.ts'

export function BottomNavigation() {
  const { state } = useAppState()
  return <nav className="base-navigation" aria-label="Navegación principal">
    <NavLink to="/menu" className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
      <Menu size={22} aria-hidden="true" /><span>Menú</span>
    </NavLink>
    <NavLink to="/pedido" aria-label={`Carrito, ${state.order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades`} className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
      <ShoppingCart size={22} aria-hidden="true" /><span className="cart-badge" aria-hidden="true">{state.order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
    </NavLink>
  </nav>
}
