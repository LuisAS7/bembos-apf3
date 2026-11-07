import { products } from './catalog.ts'
import type { DataSource, OptionGroup, Product, ProductOption, ProductVariant } from '../domain/models.ts'

const mock: DataSource = { kind: 'academic-mock', reference: 'Configuración de demostración APF3; no es una oferta comercial vigente.' }
const apf2: DataSource = { kind: 'apf2', reference: 'APF2, figuras B2/B5: mediana incluida, grande +S/3.00, papas medianas incluidas, grandes/rústicas +S/4.00.' }
const option = (id: string, label: string, additionalPriceCents = 0, source = mock): ProductOption => ({ id, label, additionalPriceCents, source })
const group = (id: string, label: string, selection: 'single' | 'multiple', options: ProductOption[], defaultOptionIds: string[], min: number, max: number, instructions?: string): OptionGroup =>
  ({ id, label, selection, options, defaultOptionIds, min, max, instructions })

function sides(documented = false): OptionGroup {
  const source = documented ? apf2 : mock
  return group('papas', 'Papas', 'single', [option('medianas', 'Papas medianas', 0, source), option('grandes', 'Papas grandes', 400, source), option('rusticas', 'Papas rústicas', 400, source)], ['medianas'], 1, 1)
}
function sauces(): OptionGroup {
  return group('salsas', 'Salsas', 'multiple', [option('mayonesa', 'Mayonesa'), option('ketchup', 'Ketchup'), option('aji', 'Ají')], ['mayonesa', 'ketchup'], 0, 2, 'Puedes elegir hasta dos salsas, sin costo adicional.')
}
function extras(): OptionGroup {
  return group('extras', 'Extras', 'multiple', [option('queso', 'Extra queso', 250), option('tocino', 'Extra tocino', 350)], [], 0, 2, 'Precios adicionales mock por unidad de producto.')
}
function drinks(): OptionGroup {
  return group('bebida', 'Bebida', 'single', [option('cola', 'Bebida de cola'), option('agua', 'Agua'), option('limonada', 'Limonada', 200)], ['cola'], 1, 1)
}
function burger(product: typeof products[number]): Pick<Product, 'variants' | 'optionGroups' | 'variantLabel' | 'defaultVariantId'> {
  const source = product.id === 'cheese' ? apf2 : mock
  const variants: ProductVariant[] = [
    { id: 'mediana', label: `${product.name} mediana`, additionalPriceCents: 0, source },
    { id: 'grande', label: `${product.name} grande`, additionalPriceCents: 300, source },
  ]
  const removals = product.id === 'royal'
    ? [option('sin-huevo', 'Sin huevo'), option('sin-tocino', 'Sin tocino')]
    : product.id === 'bbq-demo'
      ? [option('sin-queso', 'Sin queso'), option('sin-bbq', 'Sin salsa BBQ')]
      : [option('sin-lechuga', 'Sin lechuga'), option('sin-tomate', 'Sin tomate')]
  return { variants, variantLabel: 'Tamaño', defaultVariantId: 'mediana', optionGroups: [sides(product.id === 'cheese'), sauces(), group('ingredientes', 'Ingredientes', 'multiple', removals, [], 0, removals.length, 'Marca únicamente los ingredientes que deseas retirar.'), extras()] }
}
function combo(main: string, alternative: string): Pick<Product, 'variants' | 'optionGroups'> {
  return { variants: [], optionGroups: [
    group('principal', 'Producto principal', 'single', [option('incluido', main), option('alternativo', alternative, 300)], ['incluido'], 1, 1),
    sides(), drinks(), sauces(), extras(),
  ] }
}

const mainProducts: Record<string, [string, string]> = {
  'combo-cheese-demo': ['Cheese', 'Royal'], 'combo-royal-demo': ['Royal', 'BBQ'],
  'combo-clasica-demo': ['Clásica', 'Cheese'], 'combo-bbq-demo': ['BBQ', 'Royal'],
}
const shareExtras = () => group('extras', 'Para acompañar', 'multiple', [option('papas-compartir', 'Papas para compartir', 400)], [], 0, 1, 'El adicional corresponde a una promoción completa; se cobra una sola vez por promoción.')
const promotions: Record<string, Pick<Product, 'variants' | 'optionGroups' | 'variantLabel' | 'defaultVariantId'>> = {
  'duo-cheese-demo': { variants: [], optionGroups: [sauces(), shareExtras()] },
  'duo-royal-demo': { variants: [], optionGroups: [sauces()] },
  'para-compartir-demo': { variants: [], optionGroups: [group('acompanamiento', 'Acompañamiento para compartir', 'single', [option('papas', 'Papas para compartir'), option('aros', 'Aros de cebolla', 200)], ['papas'], 1, 1), sauces()] },
  'familiar-demo': { variantLabel: 'Presentación', defaultVariantId: 'dos', variants: [
    { id: 'dos', label: 'Para dos personas', additionalPriceCents: 0, source: mock },
    { id: 'cuatro', label: 'Para cuatro personas', additionalPriceCents: 2500, source: mock },
  ], optionGroups: [drinks(), shareExtras()] },
}

export const configurableProducts: readonly Product[] = products.map((product) => {
  const definition = product.category === 'hamburguesas' ? burger(product)
    : product.category === 'combos' ? combo(...mainProducts[product.id]) : promotions[product.id]
  return { ...product, ...definition }
})

export function getConfigurableProduct(id: string): Product | undefined {
  return configurableProducts.find((product) => product.id === id)
}
