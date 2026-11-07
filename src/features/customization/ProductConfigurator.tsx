import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, CircleAlert } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { ProductImage } from '../../components/ui/ProductImage.tsx'
import { optionAvailability, productAvailability, variantAvailability } from '../../data/availability.ts'
import type { CartItem, OptionGroup as GroupDefinition, Product } from '../../domain/models.ts'
import { useMobileActionBar } from '../../hooks/useMobileActionBar.ts'
import { useAppState } from '../../hooks/useAppState.ts'
import { formatPrice } from '../catalog/filterProducts.ts'
import { AvailabilityDialog } from './AvailabilityDialog.tsx'
import type { AvailabilityTarget } from './AvailabilityDialog.tsx'
import { defaultConfiguration, evaluateConfiguration } from './configuration.ts'
import { OptionGroup } from './OptionGroup.tsx'
import { QuantitySelector } from './QuantitySelector.tsx'
import { StepIndicator } from './StepIndicator.tsx'
import { cloneConfiguration } from '../cart/cart.ts'
import { advanceProgress, configurationStages, inspectProgress, issuesForStage } from './progress.ts'
import type { ConfigurationProgress } from './progress.ts'
import '../catalog/Catalog.css'
import './Customization.css'

export function ProductConfigurator({ product, item }: { product: Product; item?: CartItem }) {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const [configuration, setConfiguration] = useState(() => item ? cloneConfiguration(item.configuration) : defaultConfiguration(product))
  const [quantity, setQuantity] = useState(() => String(item?.quantity ?? 1))
  const [progress, setProgress] = useState<ConfigurationProgress>({ current: 0, reviewed: {} })
  const [attempt, setAttempt] = useState(0)
  const [review, setReview] = useState('')
  const [availabilityTarget, setAvailabilityTarget] = useState<AvailabilityTarget | null>(null)
  const pendingFocus = useRef<'heading' | 'field' | null>(null)
  const locationId = state.order.locationId
  const result = evaluateConfiguration(product, configuration, Number(quantity), locationId)
  const stock = productAvailability(product, locationId)
  const actionBar = useMobileActionBar(stock.available)
  const stages = configurationStages(product)
  const inspected = inspectProgress(stages, progress, configuration, quantity, locationId, result)
  const current = inspected.current
  const stage = stages[current]
  const pendingStages = inspected.completed.slice(0, -1).filter((done) => !done).length
  const actionHelp = !result.issues.length
    ? inspected.canSubmit ? 'Revisa el total antes de confirmar tu selección.' : pendingStages ? `${pendingStages} etapas por revisar. Usa Continuar para avanzar.` : 'Usa Continuar hasta Cantidad y resumen para completar la revisión.'
    : 'Hay opciones que requieren actualización. Revisa las restricciones indicadas.'
  const group = product.optionGroups.find((entry) => entry.id === stage.groupId)
  const stageIssues = issuesForStage(stage, result)
  const variantGroup: GroupDefinition = {
    id: 'variant', label: product.variantLabel ?? 'Variante', selection: 'single', min: 1, max: 1,
    options: product.variants.map((variant) => ({ ...variant, source: variant.source ?? { kind: 'academic-mock', reference: 'Variante de demostración.' } })), defaultOptionIds: [],
  }

  useEffect(() => {
    dispatch({ type: 'configuration/preview', value: { productId: product.id, configuration, quantity: Number(quantity) } })
  }, [dispatch, product.id, configuration, quantity])
  useEffect(() => () => dispatch({ type: 'configuration/preview', value: null }), [dispatch])
  useLayoutEffect(() => {
    if (!pendingFocus.current) return
    const field = document.getElementById(pendingFocus.current === 'heading' ? 'configuration-stage-heading' : stage.fieldId)
    const control = pendingFocus.current === 'field' ? field?.querySelector<HTMLElement>('input:not([disabled])') ?? field : field
    control?.focus()
    pendingFocus.current = null
  }, [stage.fieldId, attempt])

  function goBack(index: number) {
    if (index > current) return
    pendingFocus.current = 'heading'
    setProgress((previous) => ({ ...previous, current: index }))
    setReview(''); setAttempt((previous) => previous + 1)
  }
  function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = advanceProgress(stages, progress, configuration, quantity, locationId, result)
    setAttempt((previous) => previous + 1)
    if (next.issues.length) { setReview('Revisa las opciones indicadas antes de continuar. Conservamos tu selección.'); pendingFocus.current = 'field'; return }
    setProgress(next.progress); setReview(''); pendingFocus.current = 'heading'
    if (!next.ready) return
    if (item) dispatch({ type: 'cart/edit', itemId: item.itemId, configuration, quantity: Number(quantity) })
    else dispatch({ type: 'cart/add', item: { itemId: crypto.randomUUID(), productId: product.id, configuration, quantity: Number(quantity), unitPriceCents: result.unitPriceCents! } })
    navigate('/pedido')
  }

  return <>
    <Link className="text-link back-link" to={item ? '/pedido' : '/menu'}><ArrowLeft size={18} aria-hidden="true" />{item ? 'Cancelar edición y volver al pedido' : 'Volver al menú'}</Link>
    <div className="page-heading"><p className="eyebrow">{item ? 'Actualiza tu pedido' : 'A tu gusto'}</p><h1>{item ? `Editar ${product.name}` : product.name}</h1></div>
    <p className="sr-only" role="status" aria-atomic="true">{result.totalCents === null ? 'Total pendiente de actualización.' : `Total para ${quantity}: ${formatPrice(result.totalCents)}.`}</p>
    <div className="customization-layout">
      <aside className="configured-product" aria-labelledby="product-summary-heading">
        <ProductImage image={product.image} />
        <div className="configured-product-body"><h2 id="product-summary-heading">{product.name}</h2><p>{product.description}</p>
          <div className="configured-total">{result.totalCents !== null
            ? <><span>Por unidad: {formatPrice(result.unitPriceCents!)}</span><p>Total para {quantity}: <strong>{formatPrice(result.totalCents)}</strong></p></>
            : <p>Corrige las restricciones para obtener un total válido.</p>}</div>
          <details className="configured-choice-details"><summary>Ver selección</summary><dl className="configured-choices">{product.variants.length > 0 && <div><dt>{product.variantLabel}</dt><dd>{product.variants.find((variant) => variant.id === configuration.variantId)?.label ?? 'Por elegir'}</dd></div>}
            {product.optionGroups.map((entry) => <div key={entry.id}><dt>{entry.label}</dt><dd>{(configuration.selections[entry.id] ?? []).map((id) => entry.options.find((option) => option.id === id)?.label ?? 'Revisar opción').join(', ') || 'Sin selección'}</dd></div>)}</dl></details>
        </div>
      </aside>
      <div className="customization-options">
        <StepIndicator stages={stages} current={current} completed={inspected.completed} onBack={goBack} />
        {!stock.available ? <section className="config-unavailable" aria-labelledby="unavailable-heading"><h2 id="unavailable-heading">Producto agotado en este local</h2><p>{stock.reason}</p>
          <AccessibleButton className="button--secondary" onClick={() => setAvailabilityTarget({ kind: 'product', label: product.name })}>Ver otros locales</AccessibleButton></section>
          : <form className="configuration-form" onSubmit={advance} noValidate>
            <div className="stage-heading"><p className="eyebrow">Paso {current + 1} de {stages.length}</p><h2 id="configuration-stage-heading" tabIndex={-1}>{stage.label}</h2></div>
            {progress.current !== current && <p className="config-recheck">La disponibilidad cambió. Revisa nuevamente las etapas indicadas; tus opciones se conservan.</p>}
            {stage.kind === 'variant' && <OptionGroup group={variantGroup} fieldId={stage.fieldId} selectedIds={configuration.variantId ? [configuration.variantId] : []} errors={stageIssues.map((issue) => issue.message)}
              availability={(id) => variantAvailability(product, id, locationId)} onChange={(ids) => { setConfiguration((previous) => ({ ...previous, variantId: ids[0] ?? null })); setReview('') }}
              onViewLocations={(id, label) => setAvailabilityTarget({ kind: 'variant', id, label })} />}
            {stage.kind === 'group' && group && <OptionGroup group={group} fieldId={stage.fieldId} selectedIds={configuration.selections[group.id] ?? []} errors={stageIssues.map((issue) => issue.message)}
              availability={(id) => optionAvailability(product, group.id, id, locationId)}
              onChange={(ids) => { setConfiguration((previous) => ({ ...previous, selections: { ...previous.selections, [group.id]: ids } })); setReview('') }}
              onViewLocations={(id, label) => setAvailabilityTarget({ kind: 'option', groupId: group.id, id, label })} />}
            {stage.kind === 'summary' && <>
              <dl className="selection-review">{product.variants.length > 0 && <div><dt>{product.variantLabel ?? 'Variante'}</dt><dd>{product.variants.find((variant) => variant.id === configuration.variantId)?.label ?? 'Requiere actualización'}</dd></div>}
                {product.optionGroups.map((entry) => <div key={entry.id}><dt>{entry.label}</dt><dd>{(configuration.selections[entry.id] ?? []).map((id) => entry.options.find((option) => option.id === id)?.label ?? 'Opción anterior').join(', ') || 'Sin opciones seleccionadas'}</dd></div>)}</dl>
              {result.issues.length > 0 && <section id="configuration-errors" tabIndex={-1} className="configuration-errors"><h3><CircleAlert size={20} aria-hidden="true" /> Revisa tu selección</h3><ul>{result.issues.map((issue, index) => <li key={index}>{issue.message}</li>)}</ul></section>}
            </>}
            <p role="alert">{review}</p>
            <div className="step-actions">{current > 0 && <AccessibleButton className="button--secondary" onClick={() => goBack(current - 1)}><ArrowLeft size={18} aria-hidden="true" />Volver</AccessibleButton>}
              {stage.kind !== 'summary' && <AccessibleButton type="submit">Continuar<ArrowRight size={18} aria-hidden="true" /></AccessibleButton>}</div>
            <div className="configuration-action-bar mobile-action-bar" data-page-action-bar="" data-final={stage.kind === 'summary'} ref={actionBar}>
              <div className="action-quantity"><QuantitySelector productName={product.name} id={`quantity-${product.id}`} value={quantity} totalCents={result.totalCents} error={result.issues.find((issue) => issue.field === 'quantity')?.message} onChange={(value) => { setQuantity(value); setReview('') }} /></div>
              <p className="action-total">Total<strong>{result.totalCents === null ? 'Por actualizar' : formatPrice(result.totalCents)}</strong></p>
              <AccessibleButton type="submit" className="configuration-submit" disabled={!inspected.canSubmit} aria-describedby="configuration-action-help">{item ? 'Guardar cambios' : 'Agregar al pedido'}</AccessibleButton>
              <p id="configuration-action-help" className="action-help">{actionHelp}</p>
            </div>
          </form>}
      </div>
    </div>
    <AvailabilityDialog product={product} target={availabilityTarget} onClose={() => setAvailabilityTarget(null)} />
  </>
}
