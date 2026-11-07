// Shared contracts; data and validation live in data/ and the corresponding features.
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
  source?: DataSource
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
  image: { src: string; alt: string; crop?: 'apf2-cheese' | 'apf2-royal' }
  basePriceCents: Cents
  variants: ProductVariant[]
  variantLabel?: string
  defaultVariantId?: string | null
  // Ordered groups vary per product. Variants are priced separately.
  optionGroups: OptionGroup[]
  source: DataSource
}

// Phase 2 displays products without loading a configurator.
export type CatalogProduct = Omit<Product, 'variants' | 'optionGroups' | 'variantLabel' | 'defaultVariantId'>

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

// In-memory only: never part of the persisted order or confirmation receipt.
export interface CheckoutDraft {
  deliveryMethod: DeliveryMethod
  fullName: string
  phone: string
  address: string
  reference: string
  pickupSlot: string
}

export interface DisplayPreferences {
  textSize: 'default' | 'large' | 'extra-large'
  reduceMotion: boolean
  underlineLinks: boolean
}

// Safe session receipt: no contact, address, card data or Yape operation/code.
export interface ConfirmedItemSnapshot {
  itemId: string
  name: string
  variantLabel: string | null
  selections: Array<{ label: string; options: string[] }>
  unitPriceCents: Cents
  source: DataSource['kind']
}
export interface ConfirmationSummary {
  locationName: string
  subtotalCents: Cents
  deliveryFeeCents: Cents
  estimatedMinutes: number
  pickupSlotLabel: string | null
}
export interface ConfirmationReceipt {
  orderId: string
  confirmedAt: string
  locationId: string
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  totalCents: Cents
  // Optional only for compatibility with the pre-phase-7 reduced contract.
  paymentAttemptId?: string
  summary?: ConfirmationSummary
  items: Array<{ productId: string; quantity: number; lineTotalCents: Cents; snapshot?: ConfirmedItemSnapshot }>
}
export type CompleteConfirmationReceipt = Omit<ConfirmationReceipt, 'paymentAttemptId' | 'summary' | 'items'> & {
  paymentAttemptId: string
  summary: ConfirmationSummary
  items: Array<ConfirmationReceipt['items'][number] & { snapshot: ConfirmedItemSnapshot }>
}
