import { getLocation, isProductAvailable } from './locations.ts'
import type { AvailabilityStatus, Product } from '../domain/models.ts'

interface LocalRestrictions {
  variants: Record<string, Record<string, string>>
  options: Record<string, Record<string, string>>
}

// Explicit restrictions apply only to known options/groups of each product.
export const localRestrictions: Record<string, LocalRestrictions> = {
  'san-miguel': { variants: {}, options: {
    papas: { rusticas: 'Papas rústicas agotadas en Bembos San Miguel. Puedes elegir otras papas o consultar otro local.' },
    bebida: { limonada: 'Limonada agotada en este local.' },
  } },
  'demo-centro': { variants: { cheese: { grande: 'Cheese grande agotada en este local.' } }, options: {
    papas: { grandes: 'Papas grandes agotadas en este local.' },
  } },
  'demo-norte': { variants: { cheese: { grande: 'Cheese grande agotada en este local.' }, 'familiar-demo': { cuatro: 'La presentación para cuatro personas está agotada en este local.' } }, options: {
    extras: { tocino: 'Extra tocino agotado en este local.' },
    bebida: { agua: 'Agua agotada en este local.' },
  } },
}

export function productAvailability(product: Pick<Product, 'id'>, locationId: string): AvailabilityStatus {
  const location = getLocation(locationId)
  if (!location) return { available: false, reason: 'El local seleccionado no existe.' }
  return isProductAvailable(product.id, locationId) ? { available: true }
    : { available: false, reason: `Producto agotado en ${location.name}. Puedes elegir otro producto o consultar otro local.` }
}

export function variantAvailability(product: Product, variantId: string, locationId: string): AvailabilityStatus {
  if (!product.variants.some((variant) => variant.id === variantId)) return { available: false, reason: 'Esta variante no existe para el producto.' }
  const status = productAvailability(product, locationId)
  if (!status.available) return status
  const reason = localRestrictions[locationId]?.variants[product.id]?.[variantId]
  return reason ? { available: false, reason } : { available: true }
}

export function optionAvailability(product: Product, groupId: string, optionId: string, locationId: string): AvailabilityStatus {
  const group = product.optionGroups.find((entry) => entry.id === groupId)
  if (!group?.options.some((option) => option.id === optionId)) return { available: false, reason: 'Esta opción no pertenece al producto o grupo.' }
  const status = productAvailability(product, locationId)
  if (!status.available) return status
  const reason = localRestrictions[locationId]?.options[groupId]?.[optionId]
  return reason ? { available: false, reason } : { available: true }
}
