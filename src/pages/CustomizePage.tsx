import { Link, useMatch, useParams } from 'react-router-dom'
import { getConfigurableProduct } from '../data/customizations.ts'
import { ProductConfigurator } from '../features/customization/ProductConfigurator.tsx'
import { useAppState } from '../hooks/useAppState.ts'

export function CustomizePage() {
  const editing = useMatch('/pedido/:itemId/editar')
  const { state } = useAppState()
  const { productId } = useParams()
  if (editing) {
    const item = state.order.items.find((entry) => entry.itemId === editing.params.itemId)
    if (!item) return <><h1>Ítem no encontrado</h1><p>Este ítem ya no está en tu pedido. No se ha agregado ni modificado ningún producto.</p><Link className="text-link" to="/pedido">Volver a tu pedido</Link></>
    const product = getConfigurableProduct(item.productId)
    if (!product) return <><h1>Producto fuera del catálogo</h1><p>Conservamos este ítem, pero ya no puede configurarse. Puedes eliminarlo del pedido y elegir otro producto.</p><Link className="text-link" to="/pedido">Volver a tu pedido</Link></>
    return <ProductConfigurator key={item.itemId} product={product} item={item} />
  }
  const product = getConfigurableProduct(productId ?? '')
  if (!product) return <><h1>Producto no encontrado</h1><p>Este producto no está en el menú. Elige otro para continuar.</p><Link className="button" to="/menu">Volver al menú</Link></>
  return <ProductConfigurator key={product.id} product={product} />
}
