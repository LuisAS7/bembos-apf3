// Contracts only. Product data and business rules belong to later phases.
export type Cents = number
export type Category = 'hamburguesas' | 'combos' | 'promociones'
export type DeliveryMethod = 'delivery' | 'pickup'
export type PaymentMethod = 'cash' | 'card' | 'yape'

export interface DataSource {
  kind: 'apf2' | 'academic-mock'
  reference: string
}

export interface ProductVariant {
  id: string
  label: string
  additionalPriceCents: Cents
}

export interface ProductOption extends ProductVariant {
  source: DataSource
}

export interface OptionGroup {
  id: string
  label: string
  instructions?: string
  selection: 'single' | 'multiple'
  min: number
  max: number
  options: ProductOption[]
  defaultOptionIds: string[]
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  category: Category
  image: { src: string; alt: string }
  basePriceCents: Cents
  variants: ProductVariant[]
  // Ordered groups vary per product. Variants are priced separately.
  optionGroups: OptionGroup[]
  source: DataSource
}

export interface Location {
  id: string
  name: string
  mockAddress: string
  deliveryMethods: DeliveryMethod[]
  deliveryFeeCents: Cents
  estimatedMinutes: number
}

export interface AvailabilityStatus {
  available: boolean
  reason?: string
}

export interface ProductAvailability extends AvailabilityStatus {
  locationId: string
  productId: string
  variants: Record<string, AvailabilityStatus>
  groups: Record<string, AvailabilityStatus>
  options: Record<string, Record<string, AvailabilityStatus>>
}

export interface ProductConfiguration {
  variantId: string | null
  // Removals, sauces and extras use their own group IDs.
  selections: Record<string, string[]>
}

export interface CartItem {
  itemId: string
  productId: string
  configuration: ProductConfiguration
  quantity: number
  unitPriceCents: Cents
}

export interface OrderDraft {
  catalogVersion: number
  locationId: string
  items: CartItem[]
}

export interface DisplayPreferences {
  textSize: 'default' | 'large' | 'extra-large'
  reduceMotion: boolean
  underlineLinks: boolean
}

// Safe session receipt: no contact, address, card data or Yape operation/code.
export interface ConfirmationReceipt {
  orderId: string
  confirmedAt: string
  locationId: string
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  totalCents: Cents
  items: Array<{ productId: string; quantity: number; lineTotalCents: Cents }>
}
