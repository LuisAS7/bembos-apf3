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
import type { CheckoutDraft } from '../domain/models.ts'
import { PaymentPanel } from '../features/payments/PaymentPanel.tsx'
import { ConfirmOrderButton } from '../features/confirmation/ConfirmOrderButton.tsx'
import { checkoutBackStep, checkoutStep, checkoutStages } from '../features/checkout/steps.ts'
import { StepIndicator } from '../features/customization/StepIndicator.tsx'
import '../features/customization/Customization.css'
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
  const [requestedStep, setStep] = useState(0)
  const [paymentVisited, setPaymentVisited] = useState(false)
  const step = checkoutStep(requestedStep, state)
  const backStep = checkoutBackStep(step)
  const pendingFocus = useRef<keyof CheckoutDraft | 'stage' | null>(null)
  const previousStep = useRef(step)
  const location = getLocation(state.order.locationId)!
  const totals = checkoutTotals(state.order, draft.deliveryMethod)
  const issues = attempt ? validateCheckout(draft, state.order.locationId) : []
  const error = (field: keyof CheckoutDraft) => issues.find((issue) => issue.field === field)?.message

  useLayoutEffect(() => {
    if (previousStep.current !== step && !pendingFocus.current) pendingFocus.current = 'stage'
    previousStep.current = step
    if (!pendingFocus.current) return
    const field = document.getElementById(pendingFocus.current === 'stage' ? 'checkout-stage-heading' : `checkout-${pendingFocus.current}`)
    const control = field?.querySelector<HTMLElement>('input:not([disabled])') ?? field
    control?.focus()
    pendingFocus.current = null
  }, [attempt, step])

  function update<K extends keyof CheckoutDraft>(field: K, value: CheckoutDraft[K]) {
    dispatch({ type: 'checkout/replace', value: { ...draft, [field]: value } })
  }

  function continueCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validateCheckout(draft, state.order.locationId)
    setAttempt((previous) => previous + 1)
    if (errors.length) { pendingFocus.current = errors[0].field; return }
    if (!checkoutTotals(state.order, draft.deliveryMethod).canContinue) return
    goTo(1)
  }

  function goTo(index: number) {
    if (state.payment.status === 'processing') return
    if (index === 1) setPaymentVisited(true)
    pendingFocus.current = 'stage'
    setStep(index)
    setAttempt((previous) => previous + 1)
  }

  return <>
    <div className="page-heading"><p className="eyebrow">Ya falta poco</p><h1>Completa tu pedido</h1></div>
    <StepIndicator label="Etapas del pedido" stages={checkoutStages.map((label, index) => ({ id: String(index), label, fieldId: 'checkout-stage-heading', kind: 'summary' }))}
      current={step} completed={checkoutStages.map((_, index) => index < step)} onBack={goTo} />
    <div className="checkout-layout">
      <section className="checkout-stage" aria-labelledby="checkout-stage-heading">
      <h2 id="checkout-stage-heading" tabIndex={-1}>{checkoutStages[step]}</h2>
      {requestedStep > step && <p className="field-error">Los datos cambiaron. Revisa la entrega y el pago antes de confirmar.</p>}
      {step === 0 && <form className="checkout-form" onSubmit={continueCheckout} noValidate>
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
          <p>Preparación estimada: {location.estimatedMinutes} minutos.</p>
          <div className="form-field"><label htmlFor="checkout-pickupSlot">Horario de recojo (obligatorio)</label>
            <p id="checkout-pickupSlot-help" className="control-help">Horarios estimados desde la revisión de entrega. El recojo no tiene costo de entrega.</p>
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
        <p id="continue-help" className="control-help">Revisa los datos de entrega antes de continuar.</p>
      </form>}
      {paymentVisited && <div hidden={step !== 1}><PaymentPanel onContinue={() => goTo(2)} /></div>}
      {step === 2 && <div className="checkout-review">
        <section><h3>Entrega</h3><p>{draft.fullName} · {draft.phone}</p>
          <p>{draft.deliveryMethod === 'delivery' ? `Delivery: ${draft.address}` : `Recojo en ${location.name}`}</p>
          {draft.deliveryMethod === 'delivery' && draft.reference && <p>{draft.reference}</p>}
          {draft.deliveryMethod === 'pickup' && <p>{pickupSlots(location.id).find((slot) => slot.id === draft.pickupSlot)?.label}</p>}
          <AccessibleButton className="button--secondary" onClick={() => goTo(0)}>Editar entrega</AccessibleButton>
        </section>
        <section><h3>Método de pago</h3><p>{{ cash: 'Pagar al recibir', card: 'Tarjeta', yape: 'Yape' }[state.payment.method ?? 'cash']} · Pago aprobado</p>
          <AccessibleButton className="button--secondary" onClick={() => { dispatch({ type: 'payment/reset' }); goTo(1) }}>Editar pago</AccessibleButton>
        </section>
        <p>Revisa los productos y el total antes de confirmar.</p>
        {state.payment.attemptId && <ConfirmOrderButton attemptId={state.payment.attemptId} />}
      </div>}
      {backStep !== null && <AccessibleButton className="button--secondary checkout-back" disabled={state.payment.status === 'processing'} onClick={() => goTo(backStep)}>Volver</AccessibleButton>}
      </section>
      <OrderSummary order={state.order} method={draft.deliveryMethod} />
    </div>
  </>
}
