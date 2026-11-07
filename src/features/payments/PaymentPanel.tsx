import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { PaymentMethod } from '../../domain/models.ts'
import { useAppState } from '../../hooks/useAppState.ts'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { FormField } from '../../components/ui/FormField.tsx'
import { checkoutTotals } from '../checkout/checkout.ts'
import { formatPrice } from '../catalog/filterProducts.ts'
import { cardBrand, emptyPaymentDraft, validatePayment } from './payment.ts'
import type { PaymentDraft, PaymentIssue, YapeChallenge } from './payment.ts'
import { formatExpiry } from './expiry.ts'
import { YapeDemo } from './YapeDemo.tsx'
import './Payments.css'

const methods: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Efectivo' }, { id: 'card', label: 'Tarjeta' }, { id: 'yape', label: 'Yape' },
]

export function PaymentPanel({ onContinue, initialMethod = 'cash' }: { onContinue?: () => void; initialMethod?: PaymentMethod }) {
  const { state, dispatch } = useAppState()
  const [draft, setDraft] = useState(() => emptyPaymentDraft(state.payment.method ?? initialMethod))
  const [challenge, setChallenge] = useState<YapeChallenge | null>(null)
  const [issues, setIssues] = useState<PaymentIssue[]>([])
  const [attempt, setAttempt] = useState(0)
  const pendingFocus = useRef<PaymentIssue['field'] | null>(null)
  const inFlight = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  const processing = state.payment.status === 'processing'
  const approved = state.payment.status === 'approved'
  const total = checkoutTotals(state.order, state.checkout.deliveryMethod).totalCents
  const error = (field: PaymentIssue['field']) => issues.find((issue) => issue.field === field)?.message
  const brand = cardBrand(draft.number)

  useEffect(() => () => {
    window.clearTimeout(timer.current)
    // Leaving this screen cancels pending work; local inputs/challenges are discarded.
    dispatch({ type: 'payment/cancel' })
  }, [dispatch])

  useLayoutEffect(() => {
    if (!pendingFocus.current) return
    const field = document.getElementById(`payment-${pendingFocus.current}`)
    const control = field?.querySelector<HTMLElement>('input:not([disabled])') ?? field
    control?.focus()
    pendingFocus.current = null
  }, [attempt])

  function update<K extends keyof PaymentDraft>(field: K, value: PaymentDraft[K]) {
    setDraft((previous) => ({ ...previous, [field]: value }))
    setIssues([])
  }

  function reset(method = draft.method) {
    setDraft(emptyPaymentDraft(method))
    setChallenge(null)
    setIssues([])
    dispatch({ type: 'payment/reset' })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current || processing || approved) return
    const normalized = { ...draft, expiry: formatExpiry(draft.expiry) }
    setDraft(normalized)
    const errors = validatePayment(state.order, state.checkout, normalized, challenge)
    setIssues(errors)
    setAttempt((previous) => previous + 1)
    if (errors.length) { pendingFocus.current = errors[0].field; return }
    inFlight.current = true
    const attemptId = crypto.randomUUID()
    const revision = state.paymentRevision
    dispatch({ type: 'payment/start', attemptId, revision, method: draft.method, totalCents: total! })
    // Validated sensitive values are no longer needed, including on simulated rejection.
    setDraft(emptyPaymentDraft(draft.method))
    setChallenge(null)
    timer.current = window.setTimeout(() => {
      dispatch({ type: 'payment/finish', attemptId, revision, outcome: 'approved' })
      inFlight.current = false
      timer.current = undefined
    }, 800)
  }

  return <section className="payment-panel" aria-labelledby="payment-heading">
    <h3 id="payment-heading" tabIndex={-1}>Elige cómo pagar</h3>
    <p className="control-help">Usa datos de prueba.</p>
    <p>Importe: <strong>{total === null ? 'Revisa tu pedido' : formatPrice(total)}</strong></p>
    <form onSubmit={submit} noValidate autoComplete="off" aria-busy={processing}>
      <fieldset className="payment-controls" disabled={processing}>
        <legend>Revisa tu método de pago</legend>
        <fieldset className="delivery-methods" id="payment-method" tabIndex={-1} aria-describedby={`payment-method-help${error('method') ? ' payment-method-error' : ''}`}>
          <legend>Método de pago (obligatorio)</legend>
          <p id="payment-method-help" className="control-help">Elige cómo pagar.</p>
          <div className="delivery-options">{methods.map((method) => <label key={method.id} className={`delivery-choice${draft.method === method.id ? ' delivery-choice--selected' : ''}`}>
            <input type="radio" name="paymentMethod" value={method.id} checked={draft.method === method.id} required aria-required="true"
              aria-invalid={Boolean(error('method'))} aria-describedby={`payment-method-help${error('method') ? ' payment-method-error' : ''}`}
              onChange={() => reset(method.id)} /><span>{method.label}{draft.method === method.id && ' · Seleccionado'}</span>
          </label>)}</div>
          {error('method') && <p id="payment-method-error" className="field-error">{error('method')}</p>}
        </fieldset>
        {!approved && <>
          {draft.method === 'cash' && <div className="payment-fields">
            <p><strong>Pagar al recibir</strong></p>
            <label className="delivery-choice"><input type="checkbox" checked={draft.needsChange}
              onChange={(event) => { update('needsChange', event.target.checked); if (!event.target.checked) update('tendered', '') }} /><span>¿Necesitas vuelto?</span></label>
            {draft.needsChange && <FormField id="payment-tendered" label="¿De cuánto pagarás?" help="Monto mayor al total, en soles. Usa coma o punto y hasta dos decimales, sin separadores de miles."
              value={draft.tendered} onChange={(value) => update('tendered', value)} error={error('tendered')} autoComplete="off" inputMode="decimal" maxLength={15} />}
          </div>}
          {draft.method === 'card' && <div className="payment-fields">
            <FormField id="payment-holder" label="Nombre del titular" help="Hasta 100 caracteres."
              value={draft.holder} onChange={(value) => update('holder', value)} error={error('holder')} autoComplete="off" maxLength={100} />
            <FormField id="payment-number" label="Número de tarjeta" help="Visa: 13, 16 o 19 dígitos. Mastercard: 16 dígitos. Se admiten espacios o guiones. Usa solo números de prueba."
              value={draft.number} onChange={(value) => update('number', value)} error={error('number')} autoComplete="off" inputMode="numeric" maxLength={25} />
            <p role="status" aria-atomic="true">{draft.number ? `Tipo de tarjeta detectado: ${brand ?? 'no reconocido'}. La detección no acredita un número válido.` : 'Ingresa un número de prueba para detectar Visa o Mastercard.'}</p>
            <div className="payment-card-row"><FormField id="payment-expiry" label="Vencimiento (MM/AA)" placeholder="MM/AA" inputMode="numeric"
              onBlur={() => { const formatted = formatExpiry(draft.expiry); if (formatted !== draft.expiry) update('expiry', formatted) }}
              value={draft.expiry} onChange={(value) => update('expiry', value)} error={error('expiry')} autoComplete="off" maxLength={5} />
            <FormField id="payment-cvv" label="CVV" help="3 dígitos."
              value={draft.cvv} onChange={(value) => update('cvv', value)} error={error('cvv')} autoComplete="off" type="password" inputMode="numeric" maxLength={3} /></div>
          </div>}
          {draft.method === 'yape' && <div className="payment-fields">
            <p>Genera un código de prueba y escríbelo para continuar.</p>
            <AccessibleButton className="button--secondary" onClick={() => {
              setChallenge({ operationId: `DEMO-${crypto.randomUUID()}`, code: String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0') })
              update('yapeCode', '')
            }}>Generar código de prueba</AccessibleButton>
            <p role="status" aria-atomic="true">{challenge ? `Código de prueba: ${challenge.code.split('').join(' ')}.` : ''}</p>
            {challenge && <YapeDemo challenge={challenge} />}
            <FormField id="payment-yapeCode" label="Código Yape" help="Genera el código de prueba y escribe sus 6 dígitos. Generar otro invalida el anterior."
              value={draft.yapeCode} onChange={(value) => update('yapeCode', value)} error={error('yapeCode')} autoComplete="off" inputMode="numeric" maxLength={6} />
          </div>}
        </>}
      </fieldset>
      <p id="payment-context" tabIndex={-1} className="field-error">{error('context')}</p>
      <p role="alert">{issues.length ? 'Revisa los campos de pago indicados.' : ''}</p>
      <AccessibleButton type="submit" aria-disabled={processing || approved}>{processing ? 'Procesando pago…' : approved ? 'Pago aprobado' : 'Validar pago'}</AccessibleButton>
      {(approved || state.payment.status === 'error') && <AccessibleButton className="button--secondary" onClick={() => {
        reset(); pendingFocus.current = 'method'; setAttempt((previous) => previous + 1)
      }}>Revisar pago</AccessibleButton>}
    </form>
    <p role="status" aria-atomic="true">{processing ? 'Procesando pago…' : state.payment.status === 'invalidated' ? 'El pago anterior ya no es válido. Revisa el pedido, la entrega y el pago.' : ''}</p>
    {state.payment.status === 'error' && <p className="field-error">Pago rechazado. Revisa los datos de prueba y vuelve a intentar.</p>}
    {approved && <p>Pago aprobado. Continúa a la revisión del pedido.</p>}
    {approved && onContinue && <AccessibleButton onClick={onContinue}>Revisar pedido</AccessibleButton>}

  </section>
}
