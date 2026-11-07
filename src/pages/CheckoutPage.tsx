import { useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AccessibleButton } from '../components/ui/AccessibleButton.tsx'
import { FormField } from '../components/ui/FormField.tsx'
import { useAppState } from '../hooks/useAppState.ts'
import { inspectOrder } from '../features/cart/cart.ts'
import { checkoutTotals, pickupSlots, validateCheckout } from '../features/checkout/checkout.ts'
import { OrderSummary } from '../features/checkout/OrderSummary.tsx'
import { getLocation } from '../data/locations.ts'
import type { CheckoutDraft, OrderDraft } from '../domain/models.ts'
import { PaymentPanel } from '../features/payments/PaymentPanel.tsx'
import '../features/catalog/Catalog.css'
import '../features/checkout/Checkout.css'

export function CheckoutPage() {
  const { state } = useAppState()
  if (!inspectOrder(state.order).canContinue) return <><div className="page-heading"><h1>Revisa tu pedido</h1>
    <p className="page-description">{state.order.items.length ? 'Hay ítems que requieren actualización. Corrígelos o elimínalos antes de continuar.' : 'Tu pedido está vacío. Agrega un producto desde el menú.'}</p></div>
    {state.order.items.length > 0 && <OrderSummary order={state.order} method={state.checkout.deliveryMethod} />}
    <Link className="text-link" to="/pedido">Volver a tu pedido</Link><Link className="text-link" to="/menu">Ver menú</Link></>
  return <CheckoutForm />
}

function CheckoutForm() {
  const { state, dispatch } = useAppState()
  const draft = state.checkout
  const [attempt, setAttempt] = useState(0)
  const [reviewed, setReviewed] = useState<{ draft: CheckoutDraft; order: OrderDraft } | null>(null)
  const pendingFocus = useRef<keyof CheckoutDraft | 'payment' | null>(null)
  const location = getLocation(state.order.locationId)!
  const totals = checkoutTotals(state.order, draft.deliveryMethod)
  const issues = attempt ? validateCheckout(draft, state.order.locationId) : []
  const error = (field: keyof CheckoutDraft) => issues.find((issue) => issue.field === field)?.message
  const validReview = reviewed?.draft === draft && reviewed.order === state.order

  useLayoutEffect(() => {
    if (!pendingFocus.current) return
    const field = document.getElementById(pendingFocus.current === 'payment' ? 'payment-heading' : `checkout-${pendingFocus.current}`)
    const control = field?.querySelector<HTMLElement>('input:not([disabled])') ?? field
    control?.focus()
    pendingFocus.current = null
  }, [attempt])

  function update<K extends keyof CheckoutDraft>(field: K, value: CheckoutDraft[K]) {
    dispatch({ type: 'checkout/replace', value: { ...draft, [field]: value } })
  }

  function continueCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validateCheckout(draft, state.order.locationId)
    setAttempt((previous) => previous + 1)
    if (errors.length) { pendingFocus.current = errors[0].field; setReviewed(null); return }
    if (!checkoutTotals(state.order, draft.deliveryMethod).canContinue) return
    pendingFocus.current = 'payment'
    setReviewed({ draft, order: state.order })
  }

  return <>
    <div className="page-heading"><p className="eyebrow">Entrega del pedido</p><h1>¿Cómo recibirás tu pedido?</h1>
      <p className="page-description">Completa los datos de entrega y revisa el total antes de continuar.</p></div>
    <p className="catalog-notice">Direcciones de locales, tarifas, tiempos y horarios: <strong>mocks académicos</strong>. Usa datos ficticios para probar. Tus datos de entrega se mantienen solo mientras esta página siga abierta y se conservan al editar el pedido.</p>
    <div className="checkout-layout">
      <form className="checkout-form" onSubmit={continueCheckout} noValidate>
        <h2>Datos de entrega</h2>
        <fieldset id="checkout-deliveryMethod" className="delivery-methods" tabIndex={-1} aria-describedby={`delivery-help${error('deliveryMethod') ? ' delivery-error' : ''}`}>
          <legend>Forma de entrega (obligatoria)</legend>
          <p id="delivery-help" className="control-help">Elige Delivery o Recojo en local. No cambia de pantalla al seleccionar.</p>
          <div className="delivery-options">{(['delivery', 'pickup'] as const).map((method) => <label key={method} className={`delivery-choice${draft.deliveryMethod === method ? ' delivery-choice--selected' : ''}`}>
            <input type="radio" name="deliveryMethod" value={method} checked={draft.deliveryMethod === method} required aria-required="true"
              aria-invalid={Boolean(error('deliveryMethod'))} aria-describedby={`delivery-help${error('deliveryMethod') ? ' delivery-error' : ''}`}
              onChange={() => update('deliveryMethod', method)} />
            <span>{method === 'delivery' ? 'Delivery' : 'Recojo en local'}{draft.deliveryMethod === method && ' · Seleccionado'}</span>
          </label>)}</div>
          {error('deliveryMethod') && <p id="delivery-error" className="field-error">{error('deliveryMethod')}</p>}
        </fieldset>
        <FormField id="checkout-fullName" label="Nombre completo" help="Nombre de quien recibirá el pedido. Hasta 100 caracteres; admite tildes y distintos formatos de nombre."
          value={draft.fullName} onChange={(value) => update('fullName', value)} error={error('fullName')} autoComplete="name" maxLength={100} />
        <FormField id="checkout-phone" label="Teléfono" help="De 7 a 15 dígitos. Puedes incluir + al inicio, espacios, guiones o paréntesis."
          type="tel" value={draft.phone} onChange={(value) => update('phone', value)} error={error('phone')} autoComplete="tel" maxLength={40} />
        {draft.deliveryMethod === 'delivery' ? <>
          <FormField id="checkout-address" label="Dirección" help="Entre 5 y 180 caracteres. Incluye calle, número y distrito."
            value={draft.address} onChange={(value) => update('address', value)} error={error('address')} autoComplete="street-address" maxLength={180} multiline />
          <FormField id="checkout-reference" label="Referencia" help="Hasta 200 caracteres. Por ejemplo, una indicación para encontrar la entrada."
            value={draft.reference} onChange={(value) => update('reference', value)} error={error('reference')} autoComplete="off" maxLength={200} required={false} />
        </> : <section className="pickup-details" aria-labelledby="pickup-heading">
          <h2 id="pickup-heading">Recojo en {location.name}</h2><p>{location.mockAddress}</p>
          <p>Preparación estimada: {location.estimatedMinutes} minutos. No se reserva un horario real.</p>
          <div className="form-field"><label htmlFor="checkout-pickupSlot">Horario de recojo (obligatorio)</label>
            <p id="checkout-pickupSlot-help" className="control-help">Horarios relativos de demostración, contados desde la revisión de la entrega. Sin costo de entrega.</p>
            <select id="checkout-pickupSlot" name="pickupSlot" value={draft.pickupSlot} required aria-required="true"
              aria-invalid={Boolean(error('pickupSlot'))} aria-describedby={`checkout-pickupSlot-help${error('pickupSlot') ? ' checkout-pickupSlot-error' : ''}`}
              onChange={(event) => update('pickupSlot', event.target.value)}>
              {pickupSlots(location.id).map((slot) => <option key={slot.id} value={slot.id}>{slot.label}</option>)}
            </select>
            {error('pickupSlot') && <p id="checkout-pickupSlot-error" className="field-error">{error('pickupSlot')}</p>}
          </div>
        </section>}
        <p role="alert">{issues.length > 0 ? `Revisa los ${issues.length} campos indicados. Conservamos tus datos.` : ''}</p>
        <AccessibleButton type="submit" disabled={!totals.canContinue} aria-describedby="continue-help">Continuar</AccessibleButton>
        <p id="continue-help" className="control-help">Revisaremos la entrega antes de habilitar el pago simulado. No se realizan pagos reales.</p>
        <p role="status" aria-atomic="true">{state.payment.status === 'invalidated' ? 'La simulación anterior quedó invalidada. Revisa nuevamente la entrega y el pago.' : validReview ? 'Datos de entrega válidos. Revisa el pago simulado a continuación.' : ''}</p>
      </form>
      <OrderSummary order={state.order} method={draft.deliveryMethod} />
    </div>
    {validReview && <PaymentPanel key={state.paymentRevision} />}
  </>
}
