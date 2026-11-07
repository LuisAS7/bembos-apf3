import { useEffect, useRef } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { pageRoutes } from '../../app/routeConfig.ts'
import { products } from '../../data/catalog.ts'
import { useAppState } from '../../hooks/useAppState.ts'
import { hasCompleteSummary } from '../../features/confirmation/confirmation.ts'

export function RouteEffects() {
  const { pathname } = useLocation()
  const { state } = useAppState()
  // The root redirect is an alias of the initial menu, not a user navigation.
  const pagePath = pathname === '/' ? '/menu' : pathname
  const previousPath = useRef(pagePath)
  useEffect(() => {
    const productMatch = matchPath('/productos/:productId/personalizar', pagePath)
    const product = products.find((entry) => entry.id === productMatch?.params.productId)
    const confirmationMatch = matchPath('/confirmacion/:pedidoId', pagePath)
    document.title = confirmationMatch ? (hasCompleteSummary(state.lastConfirmation) && state.lastConfirmation.orderId === confirmationMatch.params.pedidoId
      ? 'Bembos | Pedido confirmado' : 'Bembos | Comprobante no disponible') : productMatch ? (product ? `Bembos | Personaliza ${product.name}` : 'Bembos | Producto no encontrado')
      : pageRoutes.find((route) => matchPath(route.path, pagePath))?.title ?? 'Bembos | Página no encontrada'
    // Preserve the initial Tab stop (skip link); focus main on SPA navigation.
    if (previousPath.current !== pagePath) {
      document.getElementById('contenido-principal')?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    previousPath.current = pagePath
  }, [pagePath, state.lastConfirmation])
  return null
}
