import type { CatalogProduct, Category } from '../domain/models.ts'

export const categoryLabels: Record<Category, string> = {
  hamburguesas: 'Hamburguesas', combos: 'Combos', promociones: 'Promociones',
}

function mockProduct(id: string, name: string, category: Category, basePriceCents: number, description: string, image: string): CatalogProduct {
  return {
    id, slug: id, name, category, basePriceCents, description,
    image: { src: `/images/products/${image}.svg`, alt: `Ilustración referencial de ${name}.` },
    source: { kind: 'academic-mock', reference: 'Datos creados para APF3; no representan una oferta comercial vigente.' },
  }
}

export const products: readonly CatalogProduct[] = [
  {
    id: 'cheese', slug: 'cheese', name: 'Cheese', category: 'hamburguesas', basePriceCents: 1690,
    description: 'Carne a la parrilla, queso fundido, lechuga y tomate.',
    image: { src: '/images/products/apf2-menu.jpg', alt: 'Hamburguesa Cheese, fotografía de referencia del APF2.', crop: 'apf2-cheese' },
    source: { kind: 'apf2', reference: 'APF2_Grupo6_Bembos.pdf, figura B1: nombre, descripción y precio S/16.90.' },
  },
  {
    id: 'royal', slug: 'royal', name: 'Royal', category: 'hamburguesas', basePriceCents: 2190,
    description: 'Carne, huevo frito, tocino y salsa especial.',
    image: { src: '/images/products/apf2-menu.jpg', alt: 'Hamburguesa Royal, fotografía de referencia del APF2.', crop: 'apf2-royal' },
    source: { kind: 'apf2', reference: 'APF2_Grupo6_Bembos.pdf, figura B1: nombre, descripción y precio S/21.90.' },
  },
  mockProduct('clasica-demo', 'Clásica Demo', 'hamburguesas', 1490, 'Propuesta de carne, lechuga, tomate y mayonesa.', 'clasica-demo'),
  mockProduct('bbq-demo', 'BBQ Demo', 'hamburguesas', 1990, 'Propuesta de carne, queso y salsa BBQ.', 'bbq-demo'),
  mockProduct('combo-cheese-demo', 'Combo Cheese Demo', 'combos', 2490, 'Propuesta de una Cheese, papas y bebida.', 'combo-demo'),
  mockProduct('combo-royal-demo', 'Combo Royal Demo', 'combos', 2990, 'Propuesta de una Royal, papas y bebida.', 'combo-demo'),
  mockProduct('combo-clasica-demo', 'Combo Clásica Demo', 'combos', 2290, 'Propuesta de una Clásica, papas y bebida.', 'combo-demo'),
  mockProduct('combo-bbq-demo', 'Combo BBQ Demo', 'combos', 2790, 'Propuesta de una BBQ, papas y bebida.', 'combo-demo'),
  mockProduct('duo-cheese-demo', 'Dúo Cheese Demo', 'promociones', 2990, 'Propuesta académica de dos hamburguesas Cheese.', 'promocion-demo'),
  mockProduct('duo-royal-demo', 'Dúo Royal Demo', 'promociones', 3990, 'Propuesta académica de dos hamburguesas Royal.', 'promocion-demo'),
  mockProduct('para-compartir-demo', 'Para compartir Demo', 'promociones', 4490, 'Propuesta de dos hamburguesas y papas para compartir.', 'promocion-demo'),
  mockProduct('familiar-demo', 'Familiar Demo', 'promociones', 4990, 'Propuesta de hamburguesas y acompañamientos para compartir.', 'promocion-demo'),
]
