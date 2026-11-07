import { SlidersHorizontal } from 'lucide-react'
import { useMatch } from 'react-router-dom'
import { PageShell } from '../components/ui/PageShell.tsx'

export function CustomizePage() {
  const editing = useMatch('/pedido/:itemId/editar')
  return <PageShell title={editing ? 'Editar producto' : 'Personaliza tu pedido'}
    description={editing ? 'Revisa las opciones de tu producto antes de guardar los cambios.' : 'Elige las opciones de tu producto antes de agregarlo al pedido.'}
    heading="Las opciones estarán disponibles pronto" message="Aquí podrás revisar tamaños, complementos e ingredientes."
    icon={<SlidersHorizontal size={32} />} next={{ to: '/pedido', label: 'Ver tu pedido' }}
    aside={<aside className="summary-shell" aria-labelledby="selection-heading"><h2 id="selection-heading">Tu selección</h2><p>El producto y su configuración aparecerán aquí.</p></aside>} />
}
