import { Outlet } from 'react-router-dom'
import { RouteEffects } from '../accessibility/RouteEffects.tsx'
import { useAppState } from '../../hooks/useAppState.ts'
import { Header } from './Header.tsx'
import { Toaster } from '../ui/Toaster.tsx'

export function AppLayout() {
  const { state } = useAppState()
  return <div className="app-layout">
    <a className="skip-link" href="#contenido-principal">Saltar al contenido principal</a>
    <RouteEffects />
    <Header />
    <main id="contenido-principal" className="container main-content" tabIndex={-1}>
      <div>
        {state.storageNotice && <p className="storage-notice">{state.storageNotice}</p>}
      </div>
      {state.recoveryNotice && <p className="storage-notice">{state.recoveryNotice}</p>}
      <Outlet />
    </main>
    <Toaster />
  </div>
}
