import { Link } from 'react-router-dom'
import type { DeliveryMethod, OrderDraft } from '../../domain/models.ts'
import { getLocation } from '../../data/locations.ts'
import { itemLabel } from '../cart/cart.ts'
import { formatPrice } from '../catalog/filterProducts.ts'
import { checkoutTotals } from './checkout.ts'

export function OrderSummary({ order, method }: { order: OrderDraft; method: DeliveryMethod }) {
  const summary = checkoutTotals(order, method)
  return <aside className="summary-shell checkout-summary" aria-labelledby="checkout-summary-heading">
    <h2 id="checkout-summary-heading">Resumen del pedido</h2>
    <p><strong>{getLocation(order.locationId)?.name ?? 'Local no reconocido'}</strong></p>
    <p>Entrega: {method === 'pickup' ? 'Recojo en local' : 'Delivery'}</p>
    <ol className="checkout-products">{summary.items.map(({ item, product, issues, totalCents }, index) => <li key={item.itemId}>
      <h3>{index + 1}. {itemLabel(item)}</h3>
      <p>Cantidad: {item.quantity} · Importe: {totalCents === null ? 'Requiere actualización' : formatPrice(totalCents)}</p>
      <dl className="checkout-options">
        {item.configuration.variantId && <div><dt>{product?.variantLabel ?? 'Variante'}</dt><dd>{product?.variants.find((entry) => entry.id === item.configuration.variantId)?.label ?? item.configuration.variantId}</dd></div>}
        {Object.entries(item.configuration.selections).map(([groupId, ids]) => {
          const group = product?.optionGroups.find((entry) => entry.id === groupId)
          return <div key={groupId}><dt>{group?.label ?? groupId}</dt><dd>{ids.length ? ids.map((id) => group?.options.find((entry) => entry.id === id)?.label ?? id).join(', ') : 'Sin opciones seleccionadas'}</dd></div>
        })}
      </dl>
      {issues.length > 0 && <div className="field-error"><strong>Requiere actualización</strong><ul>{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}
    </li>)}</ol>
    <dl className="checkout-totals">
      <div><dt>Subtotal</dt><dd>{summary.subtotalCents === null ? 'Requiere actualización' : formatPrice(summary.subtotalCents)}</dd></div>
      <div><dt>Costo de entrega</dt><dd>{summary.deliveryFeeCents === null ? 'No disponible' : formatPrice(summary.deliveryFeeCents)}</dd></div>
      <div><dt>Total{!summary.canContinue ? ' informativo' : ''}</dt><dd>{summary.totalCents === null ? 'Requiere actualización' : formatPrice(summary.totalCents)}</dd></div>
    </dl>
    <Link className="button button--secondary" to="/pedido">Editar pedido</Link>
  </aside>
}
