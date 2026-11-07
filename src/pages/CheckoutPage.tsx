import { CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/ui/PageShell.tsx'
import { useAppState } from '../hooks/useAppState.ts'
import { inspectOrder } from '../features/cart/cart.ts'

export function CheckoutPage() {
  const { state } = useAppState()
  if (!inspectOrder(state.order).canContinue) return <><h1>Revisa tu pedido</h1><p>Agrega productos y corrige o elimina los ítems que requieren actualización antes de continuar al pago.</p><Link className="button" to="/pedido">Volver a tu pedido</Link></>
  return <PageShell title="Pagar" description="Revisa tu pedido antes de elegir cómo recibirlo y pagarlo."
    heading="La entrega y el pago estarán disponibles pronto" message="Aquí podrás revisar todos los datos antes de confirmar."
    icon={<CreditCard size={32} />} next={{ to: '/pedido', label: 'Volver a tu pedido' }}
    aside={<aside className="summary-shell" aria-labelledby="checkout-summary-heading"><h2 id="checkout-summary-heading">Resumen del pedido</h2><p>La entrega y el pago requieren la siguiente fase. Tu carrito sigue disponible.</p></aside>} />
}
