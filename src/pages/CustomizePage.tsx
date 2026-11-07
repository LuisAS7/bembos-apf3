import { Link, useMatch, useParams } from 'react-router-dom'
import { getConfigurableProduct } from '../data/customizations.ts'
import { ProductConfigurator } from '../features/customization/ProductConfigurator.tsx'

export function CustomizePage() {
  const editing = useMatch('/pedido/:itemId/editar')
  const { productId } = useParams()
  if (editing) return <><h1>Editar producto</h1><p>La edición estará disponible al habilitar el carrito. No se ha modificado ningún producto.</p><Link className="text-link" to="/pedido">Volver a tu pedido</Link></>
  const product = getConfigurableProduct(productId ?? '')
  if (!product) return <><h1>Producto no encontrado</h1><p>Este producto no existe en el catálogo académico. Elige otro desde el menú.</p><Link className="button" to="/menu">Volver al menú</Link></>
  return <ProductConfigurator key={product.id} product={product} />
}
