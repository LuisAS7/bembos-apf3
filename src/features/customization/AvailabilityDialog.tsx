import { AccessibleModal } from '../../components/ui/AccessibleModal.tsx'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { locations } from '../../data/locations.ts'
import { optionAvailability, productAvailability, variantAvailability } from '../../data/availability.ts'
import type { Product } from '../../domain/models.ts'

export type AvailabilityTarget = { kind: 'product'; label: string } | { kind: 'variant'; id: string; label: string } | { kind: 'option'; groupId: string; id: string; label: string }

export function AvailabilityDialog({ product, target, onClose }: { product: Product; target: AvailabilityTarget | null; onClose: () => void }) {
  return <AccessibleModal open={target !== null} title={`Disponibilidad${target ? `: ${target.label}` : ''}`} onClose={onClose}>
    <p>Para cambiar de local, cierra este aviso y usa el botón del local en el encabezado.</p>
    {target && <ul className="availability-list">{locations.map((location) => {
      const status = target.kind === 'product' ? productAvailability(product, location.id)
        : target.kind === 'variant' ? variantAvailability(product, target.id, location.id)
          : optionAvailability(product, target.groupId, target.id, location.id)
      return <li key={location.id}><strong>{location.name}</strong><p>{status.available ? 'Disponible' : status.reason}</p></li>
    })}</ul>}
    <div className="modal-actions"><AccessibleButton onClick={onClose}>Cerrar</AccessibleButton></div>
  </AccessibleModal>
}
