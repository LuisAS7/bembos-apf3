import { useEffect, useRef } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { pageRoutes } from '../../app/routeConfig.ts'

export function RouteEffects() {
  const { pathname } = useLocation()
  // The root redirect is an alias of the initial menu, not a user navigation.
  const pagePath = pathname === '/' ? '/menu' : pathname
  const previousPath = useRef(pagePath)
  useEffect(() => {
    document.title = pageRoutes.find((route) => matchPath(route.path, pagePath))?.title ?? 'Bembos | Página no encontrada'
    // Preserve the initial Tab stop (skip link); focus main on SPA navigation.
    if (previousPath.current !== pagePath) {
      document.getElementById('contenido-principal')?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    previousPath.current = pagePath
  }, [pagePath])
  return null
}
