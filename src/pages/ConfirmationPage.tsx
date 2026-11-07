import { ReceiptText } from 'lucide-react'
import { PageShell } from '../components/ui/PageShell.tsx'

export function ConfirmationPage() {
  return <PageShell title="Confirmación del pedido" description="Aquí podrás consultar el resultado y el resumen de tu pedido."
    heading="Todavía no hay un pedido confirmado" message="La confirmación estará disponible al completar el pedido."
    icon={<ReceiptText size={32} />} next={{ to: '/menu', label: 'Volver al menú' }} />
}
