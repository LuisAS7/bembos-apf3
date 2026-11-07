import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AccessibleButton } from '../components/ui/AccessibleButton.tsx'
import { Minus, Plus, Pencil, Trash2 } from 'lucide-react'
import { useAppState } from '../hooks/useAppState.ts'
import { inspectOrder, itemLabel } from '../features/cart/cart.ts'
import { formatPrice } from '../features/catalog/filterProducts.ts'
import { ProductImage } from '../components/ui/ProductImage.tsx'
import { MAX_QUANTITY } from '../features/customization/configuration.ts'
import '../features/catalog/Catalog.css'
import '../features/cart/Cart.css'

export function CartPage() {
  const { state, dispatch } = useAppState()
  const pendingFocus = useRef<string | null>(null)
  const summary = inspectOrder(state.order)
  useLayoutEffect(() => {
    if (!pendingFocus.current) return
    document.getElementById(pendingFocus.current)?.focus({ preventScroll: true })
    pendingFocus.current = null
  }, [state.order.items])

  function remove(itemId: string) {
    const index = state.order.items.findIndex((item) => item.itemId === itemId)
    const neighbour = state.order.items[index + 1] ?? state.order.items[index - 1]
    pendingFocus.current = neighbour ? `cart-item-${neighbour.itemId}` : 'cart-empty-heading'
    dispatch({ type: 'cart/remove', itemId })
  }

  function changeQuantity(itemId: string, quantity: number) {
    // A button becomes disabled at a limit; retain an explicit focus destination.
    if (quantity === 1 || quantity === MAX_QUANTITY) pendingFocus.current = `cart-quantity-${itemId}`
    dispatch({ type: 'cart/quantity', itemId, quantity })
  }

  return <>
    <div className="page-heading"><p className="eyebrow">Revisa tu selección</p><h1>Tu pedido</h1>
      <p className="page-description">Edita cada producto o ajusta sus cantidades antes de continuar.</p></div>
    <Link className="text-link cart-add-link" to="/menu">Seguir agregando productos</Link>
    <div className="cart-layout">
      <section aria-label="Productos del pedido">
        {!summary.items.length ? <div className="cart-empty"><h2 id="cart-empty-heading" tabIndex={-1}>Tu pedido está vacío</h2><p>Elige un producto y personalízalo para agregarlo.</p><Link className="button" to="/menu">Ver menú</Link></div>
          : <ol className="cart-items">{summary.items.map(({ item, product, issues, unitPriceCents, totalCents }, index) => <li key={item.itemId} className="cart-item">
            {product && <ProductImage image={product.image} />}
            <h2 id={`cart-item-${item.itemId}`} tabIndex={-1}>{index + 1}. {itemLabel(item)}</h2>
            <dl className="cart-configuration">
              {item.configuration.variantId && <div><dt>{product?.variantLabel ?? 'Variante'}</dt><dd>{product?.variants.find((entry) => entry.id === item.configuration.variantId)?.label ?? `Variante anterior: ${item.configuration.variantId}`}</dd></div>}
              {Object.entries(item.configuration.selections).filter(([, ids]) => ids.length > 0).map(([groupId, ids]) => {
                const group = product?.optionGroups.find((entry) => entry.id === groupId)
                return <div key={groupId}><dt>{group?.label ?? `Grupo anterior: ${groupId}`}</dt><dd>{ids.length ? ids.map((id) => group?.options.find((entry) => entry.id === id)?.label ?? `Opción anterior: ${id}`).join(', ') : 'Sin opciones seleccionadas'}</dd></div>
              })}
            </dl>
            {issues.length > 0 && <div className="cart-restrictions" id={`issues-${item.itemId}`}><h3>Requiere actualización</h3><ul>{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul><p>Edita el producto, elige otro local o elimínalo para continuar.</p></div>}
            <div className="cart-item-footer"><div className="cart-item-count"><div className="cart-quantity" role="group" aria-label={`Cantidad de ${itemLabel(item)}, ítem ${index + 1}`}>
              <AccessibleButton className="button--secondary" aria-label={`Disminuir cantidad de ${itemLabel(item)}, ítem ${index + 1}`}
                disabled={item.quantity <= 1 || issues.length > 0} onClick={() => changeQuantity(item.itemId, item.quantity - 1)}><Minus size={20} aria-hidden="true" /></AccessibleButton>
              <p id={`cart-quantity-${item.itemId}`} tabIndex={-1} role="status" aria-atomic="true">Cantidad: <strong>{item.quantity}</strong></p>
              <AccessibleButton className="button--secondary" aria-label={`Aumentar cantidad de ${itemLabel(item)}, ítem ${index + 1}`}
                disabled={item.quantity >= MAX_QUANTITY || issues.length > 0} onClick={() => changeQuantity(item.itemId, item.quantity + 1)}><Plus size={20} aria-hidden="true" /></AccessibleButton>
            </div>
            <p className="control-help">De 1 a {MAX_QUANTITY} unidades.{issues.length > 0 && ' Corrige las restricciones mediante Editar antes de ajustar la cantidad.'}</p></div>
            <p className="cart-item-price">{unitPriceCents === null ? 'Importe pendiente de actualización.' : <>Por unidad: {formatPrice(unitPriceCents)} · Importe: <strong>{formatPrice(totalCents!)}</strong>{issues.length > 0 && ' (informativo; no disponible para continuar)'}</>}</p>
            <div className="cart-actions">
              {product && <Link className="button button--secondary" to={`/pedido/${encodeURIComponent(item.itemId)}/editar`} aria-label={`Editar ${itemLabel(item)}, ítem ${index + 1}`} title="Editar producto"><Pencil size={20} aria-hidden="true" /></Link>}
              <AccessibleButton className="button--secondary" aria-label={`Eliminar ${itemLabel(item)}, ítem ${index + 1}`} onClick={() => remove(item.itemId)} title="Eliminar producto"><Trash2 size={20} aria-hidden="true" /></AccessibleButton>
            </div></div>
          </li>)}</ol>}

      </section>
      <aside className="summary-shell" aria-labelledby="summary-heading">
        <h2 id="summary-heading">Resumen del pedido</h2>
        <p>{summary.items.length} {summary.items.length === 1 ? 'ítem' : 'ítems'} · {state.order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades</p>
        <p className="cart-subtotal">Subtotal{!summary.canContinue && ' informativo'}<strong>{summary.totalCents === null ? 'Requiere actualización' : formatPrice(summary.totalCents)}</strong></p>
        <p>No incluye el costo de entrega.</p>
        {summary.canContinue ? <Link className="button" to="/pagar" aria-describedby="checkout-help">Continuar al pago</Link>
          : <AccessibleButton disabled aria-describedby="checkout-help">Continuar al pago</AccessibleButton>}
        <p id="checkout-help">{!summary.items.length ? 'Agrega al menos un producto.' : !summary.canContinue ? 'Actualiza o elimina todos los ítems incompatibles para continuar.' : 'Elige cómo recibir tu pedido y revisa el total antes del pago.'}</p>
      </aside>
    </div>

  </>
}
