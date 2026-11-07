import { Outlet } from 'react-router-dom'
import { RouteEffects } from '../accessibility/RouteEffects.tsx'
import { useAppState } from '../../hooks/useAppState.ts'
import { Header } from './Header.tsx'

export function AppLayout() {
  const { state } = useAppState()
  return <div className="app-layout">
    <a className="skip-link" href="#contenido-principal">Saltar al contenido principal</a>
    <RouteEffects />
    <Header />
    <main id="contenido-principal" className="container main-content" tabIndex={-1}>
      <div role="status" aria-atomic="true">
        {state.storageNotice && <p className="storage-notice">{state.storageNotice}</p>}
      </div>
      <Outlet />
    </main>
    <footer className="site-footer container">
      <p><strong>Prototipo académico APF3</strong><span>Interacción Hombre Máquina · Grupo 6</span></p>
      <p>No se realizan pedidos ni pagos reales.</p>
    </footer>
  </div>
}
