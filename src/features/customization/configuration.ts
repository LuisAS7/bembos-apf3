import type { Product, ProductConfiguration } from '../../domain/models.ts'
import { optionAvailability, productAvailability, variantAvailability } from '../../data/availability.ts'

export const MAX_QUANTITY = 99
export interface ConfigurationIssue {
  field: 'product' | 'variant' | 'group' | 'quantity' | 'configuration'
  groupId?: string
  message: string
  availability?: boolean
}
export interface PriceLine { label: string; cents: number }
export interface ConfigurationResult {
  issues: ConfigurationIssue[]
  unitPriceCents: number | null
  totalCents: number | null
  lines: PriceLine[]
}

export function defaultConfiguration(product: Product): ProductConfiguration {
  return { variantId: product.defaultVariantId ?? product.variants[0]?.id ?? null,
    selections: Object.fromEntries(product.optionGroups.map((group) => [group.id, [...group.defaultOptionIds]])) }
}

const safePrice = (value: number) => Number.isSafeInteger(value) && value >= 0

function evaluate(product: Product, configuration: ProductConfiguration, quantity: number, locationId: string, checkAvailability: boolean): ConfigurationResult {
  const issues: ConfigurationIssue[] = []
  const lines: PriceLine[] = [{ label: 'Precio base', cents: product.basePriceCents }]
  const stock = productAvailability(product, locationId)
  if (checkAvailability && !stock.available) issues.push({ field: 'product', message: stock.reason!, availability: true })
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) issues.push({ field: 'quantity', message: `La cantidad debe ser un número entero entre 1 y ${MAX_QUANTITY}.` })
  if (!safePrice(product.basePriceCents)) issues.push({ field: 'configuration', message: 'El precio base no es válido.' })
  if (!configuration || !configuration.selections || typeof configuration.selections !== 'object' || Array.isArray(configuration.selections)) {
    return { issues: [...issues, { field: 'configuration', message: 'La configuración no tiene un formato válido.' }], unitPriceCents: null, totalCents: null, lines: [] }
  }
  if (product.variants.length) {
    const variant = product.variants.find((entry) => entry.id === configuration.variantId)
    if (!variant) issues.push({ field: 'variant', message: 'Elige una variante válida del producto.' })
    else {
      const availability = variantAvailability(product, variant.id, locationId)
      if (checkAvailability && !availability.available) issues.push({ field: 'variant', message: availability.reason!, availability: true })
      if (!safePrice(variant.additionalPriceCents)) issues.push({ field: 'variant', message: 'El precio de la variante no es válido.' })
      lines.push({ label: variant.label, cents: variant.additionalPriceCents })
    }
  } else if (configuration.variantId !== null) issues.push({ field: 'variant', message: 'Este producto no admite esa variante.' })

  for (const id of Object.keys(configuration.selections)) {
    if (!product.optionGroups.some((group) => group.id === id)) issues.push({ field: 'configuration', message: `El grupo «${id}» no pertenece a este producto.` })
  }
  for (const group of product.optionGroups) {
    const selected = configuration.selections[group.id] === undefined ? [] : configuration.selections[group.id]
    if (!Array.isArray(selected) || selected.some((id) => typeof id !== 'string')) {
      issues.push({ field: 'group', groupId: group.id, message: `La selección de ${group.label} no tiene un formato válido.` }); continue
    }
    if (new Set(selected).size !== selected.length) issues.push({ field: 'group', groupId: group.id, message: `Hay opciones repetidas en ${group.label}. Revisa la selección.` })
    if (selected.length < group.min || selected.length > group.max || (group.selection === 'single' && selected.length > 1)) {
      issues.push({ field: 'group', groupId: group.id, message: `En ${group.label}, elige ${group.min === group.max ? group.min : `entre ${group.min} y ${group.max}`} ${group.max === 1 ? 'opción' : 'opciones'}.` })
    }
    for (const id of new Set(selected)) {
      const option = group.options.find((entry) => entry.id === id)
      if (!option) { issues.push({ field: 'group', groupId: group.id, message: `Una opción de ${group.label} no pertenece a este producto.` }); continue }
      const availability = optionAvailability(product, group.id, id, locationId)
      if (checkAvailability && !availability.available) issues.push({ field: 'group', groupId: group.id, message: availability.reason!, availability: true })
      if (!safePrice(option.additionalPriceCents)) issues.push({ field: 'group', groupId: group.id, message: `El precio de ${option.label} no es válido.` })
      lines.push({ label: option.label, cents: option.additionalPriceCents })
    }
  }
  const unitPriceCents = lines.reduce((sum, line) => sum + line.cents, 0)
  const totalCents = unitPriceCents * quantity
  if (!safePrice(unitPriceCents) || !safePrice(totalCents)) issues.push({ field: 'configuration', message: 'El importe calculado supera el rango válido.' })
  return issues.length ? { issues, unitPriceCents: null, totalCents: null, lines: [] }
    : { issues, unitPriceCents, totalCents, lines }
}

export function evaluateConfiguration(product: Product, configuration: ProductConfiguration, quantity: number, locationId: string): ConfigurationResult {
  return evaluate(product, configuration, quantity, locationId, true)
}

// For displaying retained, unavailable items only. Never authorizes adding or checkout.
export function quoteConfiguration(product: Product, configuration: ProductConfiguration, quantity: number): ConfigurationResult {
  return evaluate(product, configuration, quantity, '', false)
}
