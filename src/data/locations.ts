// Product-level availability is mock data. Options/ingredients belong to phase 3.
export const locations = [
  { id: 'san-miguel', name: 'Bembos San Miguel', mock: false,
    availableProductIds: ['cheese', 'royal', 'clasica-demo', 'combo-cheese-demo', 'combo-royal-demo', 'combo-clasica-demo', 'duo-cheese-demo', 'para-compartir-demo', 'familiar-demo'] },
  { id: 'demo-centro', name: 'Bembos Local Demo Centro', mock: true,
    availableProductIds: ['cheese', 'royal', 'clasica-demo', 'bbq-demo', 'combo-cheese-demo', 'combo-bbq-demo', 'combo-clasica-demo', 'duo-cheese-demo', 'duo-royal-demo', 'para-compartir-demo'] },
  { id: 'demo-norte', name: 'Bembos Local Demo Norte', mock: true,
    availableProductIds: ['cheese', 'clasica-demo', 'bbq-demo', 'combo-cheese-demo', 'combo-bbq-demo', 'duo-royal-demo', 'familiar-demo'] },
] as const

export function getLocation(id: string) {
  return locations.find((location) => location.id === id)
}

export function isProductAvailable(productId: string, locationId: string): boolean {
  const ids: readonly string[] = getLocation(locationId)?.availableProductIds ?? []
  return ids.includes(productId)
}
