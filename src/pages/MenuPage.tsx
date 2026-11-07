import { Utensils } from 'lucide-react'
import { PageShell } from '../components/ui/PageShell.tsx'

export function MenuPage() {
  return <PageShell title="Menú" description="Elige lo que más te gusta y prepara tu pedido a tu manera."
    heading="El menú estará disponible pronto" message="Aquí encontrarás hamburguesas, combos y promociones."
    icon={<Utensils size={32} />} next={{ to: '/productos/demo/personalizar', label: 'Ver personalización' }} />
}
