import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout.tsx'
import { CartPage } from '../pages/CartPage.tsx'
import { CheckoutPage } from '../pages/CheckoutPage.tsx'
import { ConfirmationPage } from '../pages/ConfirmationPage.tsx'
import { CustomizePage } from '../pages/CustomizePage.tsx'
import { MenuPage } from '../pages/MenuPage.tsx'

export function AppRoutes() {
  return <Routes><Route element={<AppLayout />}>
    <Route index element={<Navigate to="/menu" replace />} />
    <Route path="/menu" element={<MenuPage />} />
    <Route path="/productos/:productId/personalizar" element={<CustomizePage />} />
    <Route path="/pedido" element={<CartPage />} />
    <Route path="/pedido/:itemId/editar" element={<CustomizePage />} />
    <Route path="/pagar" element={<CheckoutPage />} />
    <Route path="/confirmacion/:pedidoId" element={<ConfirmationPage />} />
    <Route path="*" element={<><h1>Página no encontrada</h1><p>Revisa la dirección o vuelve al menú.</p><Link className="button" to="/menu">Volver al menú</Link></>} />
  </Route></Routes>
}
