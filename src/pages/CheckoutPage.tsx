import { CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/ui/PageShell.tsx'

export function CheckoutPage() {
  return <PageShell title="Pagar" description="Revisa tu pedido antes de elegir cómo recibirlo y pagarlo."
    heading="La entrega y el pago estarán disponibles pronto" message="Aquí podrás revisar todos los datos antes de confirmar."
    icon={<CreditCard size={32} />} next={{ to: '/pedido', label: 'Volver a tu pedido' }}
    aside={<aside className="summary-shell" aria-labelledby="checkout-summary-heading"><h2 id="checkout-summary-heading">Resumen del pedido</h2><p>Aquí se mostrarán los productos y el total.</p><Link className="text-link" to="/confirmacion/demo">Ver pantalla de confirmación</Link></aside>} />
}
