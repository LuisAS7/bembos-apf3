import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/ui/PageShell.tsx'

export function CartPage() {
  return <PageShell title="Tu pedido" description="Un espacio para revisar tus productos y sus opciones."
    heading="Aquí verás tus productos" message="Podrás revisar y actualizar tu selección antes de continuar."
    icon={<ShoppingBag size={32} />} next={{ to: '/menu', label: 'Volver al menú' }}
    aside={<aside className="summary-shell" aria-labelledby="summary-heading"><h2 id="summary-heading">Resumen del pedido</h2><p>El resumen estará disponible cuando agregues productos.</p><Link className="text-link" to="/pagar">Ver pantalla de pago</Link></aside>} />
}
