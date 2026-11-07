import { Link, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAppState } from '../hooks/useAppState.ts'
import { hasCompleteSummary } from '../features/confirmation/confirmation.ts'
import { formatPrice } from '../features/catalog/filterProducts.ts'
import { LiveAnnouncement } from '../components/accessibility/LiveAnnouncement.tsx'
import '../features/catalog/Catalog.css'
import '../features/checkout/Checkout.css'
import '../features/confirmation/Confirmation.css'

export function ConfirmationPage() {
  const { state } = useAppState()
  const { pedidoId } = useParams()
  const receipt = state.lastConfirmation
  if (!receipt) return <><h1>No hay un comprobante disponible</h1><p>Completa un pedido válido y confirma su pago simulado antes de consultar la confirmación. Solo se conserva el último comprobante en esta sesión.</p><Link className="text-link" to="/pedido">Revisar tu pedido</Link></>
  if (pedidoId !== receipt.orderId) return <><h1>El identificador no corresponde al comprobante disponible</h1><p>Solo conservamos el último comprobante de esta sesión.</p><Link className="text-link" to={`/confirmacion/${encodeURIComponent(receipt.orderId)}`}>Ver último comprobante</Link><Link className="text-link" to="/menu">Volver al menú</Link></>
  if (!hasCompleteSummary(receipt)) return <><h1>Comprobante anterior sin resumen completo</h1><p>El comprobante disponible usa una versión reducida anterior. No reconstruimos sus opciones con datos actuales.</p><p>ID ficticio: {receipt.orderId}</p><Link className="text-link" to="/menu">Volver al menú</Link></>
  const paymentLabels = { cash: 'Efectivo al recibir (simulado)', card: 'Tarjeta simulada', yape: 'Yape simulado' }
  return <>
    <div className="page-heading"><p className="eyebrow">Comprobante de demostración</p><h1>Pedido confirmado</h1>
      <p className="page-description">Simulación académica. No se realizan pedidos ni pagos reales.</p></div>
    <LiveAnnouncement message="Pedido confirmado en la simulación académica. El último comprobante está disponible en esta sesión." />
    <div className="confirmation-layout">
      <section className="receipt-products" aria-labelledby="confirmed-products-heading">
        <h2 id="confirmed-products-heading">Productos confirmados</h2>
        <ol className="checkout-products">{receipt.items.map((item, index) => <li key={item.snapshot.itemId}>
          <h3>{index + 1}. {item.snapshot.name}</h3>
          <p className="control-help">{item.snapshot.source === 'apf2' ? 'Producto y precio base APF2; adicionales según el configurador.' : 'Producto mock académico.'}</p>
          <p>Cantidad: {item.quantity} · Por unidad: {formatPrice(item.snapshot.unitPriceCents)} · Importe: <strong>{formatPrice(item.lineTotalCents)}</strong></p>
          <dl className="checkout-options">
            {item.snapshot.variantLabel && <div><dt>Variante</dt><dd>{item.snapshot.variantLabel}</dd></div>}
            {item.snapshot.selections.map((group, groupIndex) => <div key={groupIndex}><dt>{group.label}</dt><dd>{group.options.join(', ') || 'Sin opciones seleccionadas'}</dd></div>)}
          </dl>
        </li>)}</ol>
      </section>
      <aside className="summary-shell" aria-labelledby="receipt-heading">
        <h2 id="receipt-heading">Tu comprobante reducido</h2>
        <p>ID ficticio: <strong className="receipt-id">{receipt.orderId}</strong></p>
        <QRCodeSVG value={receipt.orderId} size={200} marginSize={4} role="img" title="QR del ID ficticio del pedido. Solo contiene el identificador mostrado como texto." />
        <p className="control-help">El QR contiene únicamente el ID ficticio. No inicia pagos ni seguimiento.</p>
        <dl className="receipt-details">
          <div><dt>Fecha de confirmación</dt><dd>{new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima' }).format(new Date(receipt.confirmedAt))}</dd></div>
          <div><dt>Local</dt><dd>{receipt.summary.locationName}</dd></div>
          <div><dt>Entrega</dt><dd>{receipt.deliveryMethod === 'pickup' ? 'Recojo en local' : 'Delivery'}</dd></div>
          {receipt.summary.pickupSlotLabel && <div><dt>Horario mock elegido</dt><dd>{receipt.summary.pickupSlotLabel}</dd></div>}
          <div><dt>Preparación estimada mock</dt><dd>{receipt.summary.estimatedMinutes} minutos</dd></div>
          <div><dt>Tipo de pago</dt><dd>{paymentLabels[receipt.paymentMethod]}</dd></div>
        </dl>
        <dl className="checkout-totals"><div><dt>Subtotal</dt><dd>{formatPrice(receipt.summary.subtotalCents)}</dd></div>
          <div><dt>Entrega</dt><dd>{formatPrice(receipt.summary.deliveryFeeCents)}</dd></div>
          <div><dt>Total</dt><dd>{formatPrice(receipt.totalCents)}</dd></div></dl>
        <p className="control-help">Por privacidad, el comprobante no conserva contacto, dirección ni datos de pago. Solo se guarda el último en esta sesión.</p>
      </aside>
    </div>
    <Link className="button" to="/menu">Volver al menú y crear otro pedido</Link>
  </>
}
