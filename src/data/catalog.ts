import type { CatalogProduct, Category } from '../domain/models.ts'

export const categoryLabels: Record<Category, string> = {
  hamburguesas: 'Hamburguesas', combos: 'Combos', promociones: 'Promociones', menus: 'Menús Bembos', complementos: 'Complementos', pollo: 'Pollo', loncheritas: 'Loncherita por la Educación',
}

function mockProduct(id: string, name: string, category: Category, basePriceCents: number, description: string, image: string): CatalogProduct {
  return {
    id, slug: id, name, category, basePriceCents, description,
    image: { src: `/images/official/${image}.jpg`, alt: `Fotografía referencial de ${name}.` },
    source: { kind: 'academic-mock', reference: 'Datos creados para APF3; no representan una oferta comercial vigente.' },
  }
}

const originalProducts: readonly CatalogProduct[] = [
  {
    id: 'cheese', slug: 'cheese', name: 'Cheese', category: 'hamburguesas', basePriceCents: 1690,
    description: 'Carne a la parrilla, queso fundido, lechuga y tomate.',
    image: { src: '/images/official/cheese.jpg', alt: 'Hamburguesa Cheese con carne, queso, lechuga y tomate.' },
    source: { kind: 'apf2', reference: 'APF2_Grupo6_Bembos.pdf, figura B1: nombre, descripción y precio S/16.90.' },
  },
  {
    id: 'royal', slug: 'royal', name: 'Royal', category: 'hamburguesas', basePriceCents: 2190,
    description: 'Carne, huevo frito, tocino y salsa especial.',
    image: { src: '/images/official/royal.jpg', alt: 'Fotografía referencial de la hamburguesa Royal.' },
    source: { kind: 'apf2', reference: 'APF2_Grupo6_Bembos.pdf, figura B1: nombre, descripción y precio S/21.90.' },
  },
  mockProduct('clasica-demo', 'Clásica', 'hamburguesas', 1490, 'Carne a la parrilla, lechuga, tomate y mayonesa.', 'clasica'),
  { ...mockProduct('bbq-demo', 'BBQ', 'hamburguesas', 1990, 'Carne a la parrilla, queso y salsa BBQ.', 'bbq'), image: { src: '/images/official/bbq.jpg', alt: 'Hamburguesa con queso y tocino opcional, fotografía referencial de BBQ.' } },
  mockProduct('combo-cheese-demo', 'Combo Cheese', 'combos', 2490, 'Una Cheese con papas y bebida a elección.', 'combo-cheese'),
  mockProduct('combo-royal-demo', 'Combo Royal', 'combos', 2990, 'Una Royal con papas y bebida a elección.', 'combo-royal'),
  mockProduct('combo-clasica-demo', 'Combo Clásica', 'combos', 2290, 'Una Clásica con papas y bebida a elección.', 'combo-clasica'),
  { ...mockProduct('combo-bbq-demo', 'Combo BBQ', 'combos', 2790, 'Una BBQ con papas y bebida a elección.', 'combo-bbq'), image: { src: '/images/official/combo-bbq.jpg', alt: 'Hamburguesa con queso, tocino opcional, papas y bebida, fotografía referencial de Combo BBQ.' } },
  { ...mockProduct('duo-cheese-demo', 'Dúo Cheese', 'promociones', 2990, 'Dos hamburguesas Cheese con tus salsas favoritas.', 'cheese'), image: { src: '/images/official/cheese.jpg', alt: 'Dos hamburguesas Cheese, composición fotográfica referencial.', duo: true } },
  { ...mockProduct('duo-royal-demo', 'Dúo Royal', 'promociones', 3990, 'Dos hamburguesas Royal con tus salsas favoritas.', 'royal'), image: { src: '/images/official/royal.jpg', alt: 'Dos hamburguesas Royal, composición fotográfica referencial.', duo: true } },
  mockProduct('para-compartir-demo', 'Para compartir', 'promociones', 4490, 'Dos hamburguesas con acompañamiento para compartir.', 'compartir'),
  mockProduct('familiar-demo', 'Familiar', 'promociones', 4990, 'Hamburguesas para dos o cuatro personas, con bebida a elección.', 'familiar'),
]

// Official names/compositions; operational prices and availability remain prototype data.
export const additionalProducts: readonly CatalogProduct[] = [
  mockProduct('menu-taypa-demo', 'Menú Taypá', 'menus', 2190, 'Hamburguesa a la parrilla, chorizo, papas, huevo, arroz y ensalada con vinagreta.', 'menu-taypa'),
  mockProduct('menu-pobre-demo', 'Menú A Lo Pobre', 'menus', 2090, 'Hamburguesa a la parrilla, papas, huevo, plátano frito, arroz y ensalada con vinagreta.', 'menu-pobre'),
  mockProduct('papas-demo', 'Papas Fritas', 'complementos', 690, 'Porción de papas fritas crujientes.', 'papas'),
  mockProduct('nuggets-demo', 'Nuggets', 'complementos', 1290, 'Porción de nuggets de pollo.', 'nuggets'),
  mockProduct('chicken-grill-demo', 'Chicken Grill', 'pollo', 1890, 'Pechuga de pollo marinada a la parrilla, lechuga, tomate y mayonesa.', 'chicken-grill'),
  mockProduct('bembroster-demo', 'Bembroster Clásica', 'pollo', 1590, 'Sándwich de pollo crocante con mayonesa, lechuga y tomate.', 'bembroster'),
  mockProduct('loncherita-burger-demo', 'Loncherita por la educación - Faber Hamburguesa', 'loncheritas', 2090, 'Hamburguesa regular, papa regular, Frugos y caja de plumones Faber x6.', 'loncherita-burger'),
  mockProduct('loncherita-nuggets-demo', 'Loncherita por la educación - Faber Nuggets', 'loncheritas', 2090, 'Nuggets x4, papa regular, Frugos y caja de plumones Faber x6.', 'loncherita-nuggets'),
].map((product) => ({ ...product, source: { kind: 'academic-mock', reference: `Nombre/composición: https://www.bembos.com.pe/menu/${({ menus: 'bembos-menus', complementos: 'complementos', pollo: 'pollo', loncheritas: 'loncheritas' } as Record<string, string>)[product.category]}. Precio, disponibilidad y opciones: mock académico; sin oferta, entrega ni donación real.` } }))

export const products: readonly CatalogProduct[] = [...originalProducts, ...additionalProducts]
