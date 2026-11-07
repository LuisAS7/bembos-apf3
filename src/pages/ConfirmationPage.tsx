import { Link, useParams } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { ProductImage } from '../components/ui/ProductImage.tsx'
import { QRCodeSVG } from 'qrcode.react'
import { useAppState } from '../hooks/useAppState.ts'
import { hasCompleteSummary } from '../features/confirmation/confirmation.ts'
import { formatPrice } from '../features/catalog/filterProducts.ts'
import { displayName } from '../data/presentation.ts'
import '../features/catalog/Catalog.css'
import '../features/checkout/Checkout.css'
import '../features/confirmation/Confirmation.css'

export function ConfirmationPage() {
  const { state } = useAppState()
  const { pedidoId } = useParams()
  const receipt = state.lastConfirmation
  if (!receipt) return <><h1>No hay un comprobante disponible</h1><p>Completa un pedido válido y confirma su pago antes de consultar la confirmación. Solo se conserva el último comprobante en esta sesión.</p><Link className="text-link" to="/pedido">Revisar tu pedido</Link></>
  if (pedidoId !== receipt.orderId) return <><h1>El identificador no corresponde al comprobante disponible</h1><p>Solo conservamos el último comprobante de esta sesión.</p><Link className="text-link" to={`/confirmacion/${encodeURIComponent(receipt.orderId)}`}>Ver último comprobante</Link><Link className="text-link" to="/menu">Volver al menú</Link></>
  if (!hasCompleteSummary(receipt)) return <><h1>Comprobante anterior sin resumen completo</h1><p>El comprobante disponible usa una versión reducida anterior. No reconstruimos sus opciones con datos actuales.</p><p>Número de pedido: {receipt.orderId}</p><Link className="text-link" to="/menu">Volver al menú</Link></>
  const paymentLabels = { cash: 'Pagar al recibir', card: 'Tarjeta', yape: 'Yape' }
  return <>
    <div className="page-heading"><p className="eyebrow">¡Todo listo!</p><h1>Pedido confirmado</h1>
      <p className="page-description">Gracias. Aquí tienes tu comprobante.</p></div>
    <div className="confirmation-layout">
      <section className="summary-shell receipt-main" aria-labelledby="receipt-heading">
        <h2 id="receipt-heading">Tu comprobante</h2>
        <p>Número de pedido: <strong className="receipt-id">{receipt.orderId}</strong></p>
        <div className="receipt-qr"><QRCodeSVG value={receipt.orderId} size={200} marginSize={4} role="img" title="QR del número de pedido. Solo contiene el identificador mostrado como texto." /></div>
        <p className="control-help">El QR contiene tu número de pedido.</p>
        <dl className="receipt-details">
          <div><dt>Fecha de confirmación</dt><dd>{new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima' }).format(new Date(receipt.confirmedAt))}</dd></div>
          <div><dt>Local</dt><dd>{displayName(receipt.summary.locationName)}</dd></div>
          <div><dt>Entrega</dt><dd>{receipt.deliveryMethod === 'pickup' ? 'Recojo en local' : 'Delivery'}</dd></div>
          {receipt.summary.pickupSlotLabel && <div><dt>Horario elegido</dt><dd>{receipt.summary.pickupSlotLabel}</dd></div>}
          <div><dt>Preparación estimada</dt><dd>{receipt.summary.estimatedMinutes} minutos</dd></div>
          <div><dt>Tipo de pago</dt><dd>{paymentLabels[receipt.paymentMethod]}</dd></div>
        </dl>
        <dl className="checkout-totals"><div><dt>Subtotal</dt><dd>{formatPrice(receipt.summary.subtotalCents)}</dd></div>
          <div><dt>Entrega</dt><dd>{formatPrice(receipt.summary.deliveryFeeCents)}</dd></div>
          <div><dt>Total</dt><dd>{formatPrice(receipt.totalCents)}</dd></div></dl>
        <Link className="button" to="/menu">Volver al menú</Link>
        <p className="control-help">Por privacidad, el comprobante no conserva contacto, dirección ni datos de pago. Solo se guarda el último en esta sesión.</p>
      </section>
      <details className="receipt-products"><summary>Ver detalle del pedido</summary><section aria-labelledby="confirmed-products-heading">
        <h2 id="confirmed-products-heading">Productos confirmados</h2>
        <ol className="receipt-item-list">{receipt.items.map((item) => <li key={item.snapshot.itemId}>
          <div className="receipt-photo">{item.snapshot.image ? <ProductImage image={{ ...item.snapshot.image, alt: '' }} />
            : <div className="receipt-photo-missing" role="img" aria-label="Fotografía no disponible"><UtensilsCrossed size={28} aria-hidden="true" /></div>}</div>
          <div className="receipt-item-body">
          <h3>{displayName(item.snapshot.name)}</h3>
          <p>Cantidad: <strong>{item.quantity}</strong></p>
          <p className="control-help">Por unidad: {formatPrice(item.snapshot.unitPriceCents)}</p>
          <dl className="checkout-options">
            {item.snapshot.variantLabel && <div><dt>Variante</dt><dd>{displayName(item.snapshot.variantLabel)}</dd></div>}
            {item.snapshot.selections.map((group, groupIndex) => <div key={groupIndex}><dt>{group.label}</dt><dd>{group.options.join(', ') || 'Sin opciones seleccionadas'}</dd></div>)}
          </dl>
          <p className="receipt-line-total">Importe: <strong>{formatPrice(item.lineTotalCents)}</strong></p></div>
        </li>)}</ol>
      </section></details>

    </div>
  </>
}
