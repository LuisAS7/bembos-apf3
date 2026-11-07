import type { ProductOption } from '../domain/models.ts'

export function optionPhoto(groupId: string, option: Pick<ProductOption, 'id' | 'label'>) {
  const photos: Record<string, string> = {
    'bebida.cola': 'cola', 'bebida.agua': 'agua', 'salsas.aji': 'aji', 'salsas.mayonesa': 'mayonesa', 'salsas.ketchup': 'ketchup',
    'papas.medianas': 'papas-medianas', 'papas.grandes': 'papas-grandes', 'acompanamiento.papas': 'papas', 'extras.papas-compartir': 'papas',
    'extras.queso': 'extra-queso', 'extras.tocino': 'extra-tocino',
  }
  const sizes: Record<string, string> = {
    'Cheese mediana': 'cheese-mediana', 'Cheese grande': 'cheese-grande', 'Royal mediana': 'royal-mediana', 'Royal grande': 'royal-grande',
    'Clásica mediana': 'clasica-mediana', 'Clásica grande': 'clasica-grande',
  }
  const main: Record<string, string> = { Cheese: 'cheese', Royal: 'royal', 'Clásica': 'clasica' }
  const photo = photos[`${groupId}.${option.id}`] ?? (groupId === 'principal' ? main[option.label] : groupId === 'variant' ? sizes[option.label] : undefined)
  if (photo) return { src: `/images/official/${photo}.jpg` }
  if (groupId === 'bebida' && option.id === 'limonada') return {
    src: '/images/reference/limonada.jpg', author: 'Lemur12', license: 'Atribución', page: 'https://commons.wikimedia.org/wiki/File:Glass_of_lemonade.jpg',
  }
  if (groupId === 'acompanamiento' && option.id === 'aros') return {
    src: '/images/reference/aros.jpg', author: 'Jon Sullivan', license: 'Dominio público', page: 'https://commons.wikimedia.org/wiki/File:Onion_rings_fried.jpg',
  }
  return undefined
}
