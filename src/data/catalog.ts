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
  mockProduct('combo-cheese-demo', 'Combo Cheese', 'combos', 2490, '1 Cheese, 1 porción de papas y 1 bebida a elección. Puedes cambiar la hamburguesa por Royal.', 'combo-cheese'),
  mockProduct('combo-royal-demo', 'Combo Royal', 'combos', 2990, '1 Royal, 1 porción de papas y 1 bebida a elección. Puedes cambiar la hamburguesa por BBQ.', 'combo-royal'),
  mockProduct('combo-clasica-demo', 'Combo Clásica', 'combos', 2290, '1 Clásica, 1 porción de papas y 1 bebida a elección. Puedes cambiar la hamburguesa por Cheese.', 'combo-clasica'),
  { ...mockProduct('combo-bbq-demo', 'Combo BBQ', 'combos', 2790, '1 BBQ, 1 porción de papas y 1 bebida a elección. Puedes cambiar la hamburguesa por Royal.', 'combo-bbq'), image: { src: '/images/official/combo-bbq.jpg', alt: 'Hamburguesa con queso, tocino opcional, papas y bebida, fotografía referencial de Combo BBQ.' } },
  { ...mockProduct('duo-cheese-demo', 'Dúo Cheese', 'promociones', 2990, '2 hamburguesas Cheese con salsas opcionales. Puedes añadir papas para compartir.', 'cheese'), image: { src: '/images/official/cheese.jpg', alt: 'Dos hamburguesas Cheese, composición fotográfica referencial.', duo: true } },
  { ...mockProduct('duo-royal-demo', 'Dúo Royal', 'promociones', 3990, '2 hamburguesas Royal con salsas opcionales.', 'royal'), image: { src: '/images/official/royal.jpg', alt: 'Dos hamburguesas Royal, composición fotográfica referencial.', duo: true } },
  mockProduct('para-compartir-demo', 'Para compartir', 'promociones', 4490, '2 hamburguesas y 1 acompañamiento para compartir: papas o aros de cebolla. Salsas opcionales.', 'compartir'),
  mockProduct('familiar-demo', 'Familiar', 'promociones', 4990, 'Hamburguesas en presentación para 2 o 4 personas y 1 bebida a elección. Papas para compartir como adicional.', 'familiar'),
]

// Official names/compositions; operational prices and availability remain prototype data.
export const additionalProducts: readonly CatalogProduct[] = [
  mockProduct('menu-taypa-demo', 'Menú Taypá', 'menus', 2190, '1 hamburguesa a la parrilla, chorizo, papas fritas, huevo frito, arroz y ensalada con vinagreta.', 'menu-taypa'),
  mockProduct('menu-pobre-demo', 'Menú A Lo Pobre', 'menus', 2090, '1 hamburguesa a la parrilla, papas fritas, huevo frito, plátano frito, arroz y ensalada con vinagreta.', 'menu-pobre'),
  mockProduct('papas-demo', 'Papas Fritas', 'complementos', 690, 'Porción de papas fritas crujientes.', 'papas'),
  mockProduct('nuggets-demo', 'Nuggets', 'complementos', 1290, 'Porción de nuggets de pollo.', 'nuggets'),
  mockProduct('chicken-grill-demo', 'Chicken Grill', 'pollo', 1890, 'Pechuga de pollo marinada a la parrilla, lechuga, tomate y mayonesa.', 'chicken-grill'),
  mockProduct('bembroster-demo', 'Bembroster Clásica', 'pollo', 1590, 'Sándwich de pollo crocante con mayonesa, lechuga y tomate.', 'bembroster'),
  mockProduct('loncherita-burger-demo', 'Loncherita por la educación - Faber Hamburguesa', 'loncheritas', 2090, '1 hamburguesa regular, 1 porción de papas regulares, 1 Frugos y 1 caja de plumones Faber x6.', 'loncherita-burger'),
  mockProduct('loncherita-nuggets-demo', 'Loncherita por la educación - Faber Nuggets', 'loncheritas', 2090, '4 nuggets, 1 porción de papas regulares, 1 Frugos y 1 caja de plumones Faber x6.', 'loncherita-nuggets'),
].map((product) => ({ ...product, source: { kind: 'academic-mock', reference: `Nombre/composición: https://www.bembos.com.pe/menu/${({ menus: 'bembos-menus', complementos: 'complementos', pollo: 'pollo', loncheritas: 'loncheritas' } as Record<string, string>)[product.category]}. Precio, disponibilidad y opciones: mock académico; sin oferta, entrega ni donación real.` } }))

export const products: readonly CatalogProduct[] = [...originalProducts, ...additionalProducts]
