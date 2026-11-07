// Availability and fulfillment details are academic mocks, including San Miguel's address/fees/times.
export const locations = [
  { id: 'san-miguel', name: 'Bembos San Miguel', mock: false,
    mockAddress: 'Av. Académica 100, San Miguel (dirección ficticia)', deliveryMethods: ['delivery', 'pickup'], deliveryFeeCents: 500, estimatedMinutes: 25,
    availableProductIds: ['cheese', 'royal', 'clasica-demo', 'combo-cheese-demo', 'combo-royal-demo', 'combo-clasica-demo', 'duo-cheese-demo', 'para-compartir-demo', 'familiar-demo'] },
  { id: 'demo-centro', name: 'Bembos Local Demo Centro', mock: true,
    mockAddress: 'Jr. Demostración 200, Centro (dirección ficticia)', deliveryMethods: ['delivery', 'pickup'], deliveryFeeCents: 600, estimatedMinutes: 20,
    availableProductIds: ['cheese', 'royal', 'clasica-demo', 'bbq-demo', 'combo-cheese-demo', 'combo-bbq-demo', 'combo-clasica-demo', 'duo-cheese-demo', 'duo-royal-demo', 'para-compartir-demo'] },
  { id: 'demo-norte', name: 'Bembos Local Demo Norte', mock: true,
    mockAddress: 'Av. Ejemplo 300, Norte (dirección ficticia)', deliveryMethods: ['delivery', 'pickup'], deliveryFeeCents: 700, estimatedMinutes: 30,
    availableProductIds: ['cheese', 'clasica-demo', 'bbq-demo', 'combo-cheese-demo', 'combo-bbq-demo', 'duo-royal-demo', 'familiar-demo'] },
] as const

export function getLocation(id: string) {
  return locations.find((location) => location.id === id)
}

export function isProductAvailable(productId: string, locationId: string): boolean {
  const ids: readonly string[] = getLocation(locationId)?.availableProductIds ?? []
  return ids.includes(productId)
}
