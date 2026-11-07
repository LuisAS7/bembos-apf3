import { useState } from 'react'
import type { FormEvent } from 'react'
import { CircleAlert } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { ProductImage } from '../../components/ui/ProductImage.tsx'
import { optionAvailability, productAvailability, variantAvailability } from '../../data/availability.ts'
import type { CartItem, OptionGroup as GroupDefinition, Product } from '../../domain/models.ts'
import { useAppState } from '../../hooks/useAppState.ts'
import { formatPrice } from '../catalog/filterProducts.ts'
import { LocalSelector } from '../locations/LocalSelector.tsx'
import { AvailabilityDialog } from './AvailabilityDialog.tsx'
import type { AvailabilityTarget } from './AvailabilityDialog.tsx'
import { defaultConfiguration, evaluateConfiguration } from './configuration.ts'
import { OptionGroup } from './OptionGroup.tsx'
import { QuantitySelector } from './QuantitySelector.tsx'
import { StepIndicator } from './StepIndicator.tsx'
import { cloneConfiguration } from '../cart/cart.ts'
import '../catalog/Catalog.css'
import './Customization.css'

export function ProductConfigurator({ product, item }: { product: Product; item?: CartItem }) {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const [configuration, setConfiguration] = useState(() => item ? cloneConfiguration(item.configuration) : defaultConfiguration(product))
  const [quantity, setQuantity] = useState(() => String(item?.quantity ?? 1))
  const [review, setReview] = useState<{ message: string; locationId: string } | null>(null)
  const [availabilityTarget, setAvailabilityTarget] = useState<AvailabilityTarget | null>(null)
  const locationId = state.order.locationId
  const visibleReview = review?.locationId === locationId ? review : null
  const result = evaluateConfiguration(product, configuration, Number(quantity), locationId)
  const stock = productAvailability(product, locationId)
  const variantFieldId = `variant-${product.id}`
  const quantityId = `quantity-${product.id}`
  const groupFieldId = (id: string) => `group-${product.id}-${id}`
  const stages = [
    ...(product.variants.length ? [{ id: variantFieldId, label: product.variantLabel ?? 'Variante' }] : []),
    ...product.optionGroups.map((group) => ({ id: groupFieldId(group.id), label: group.label })),
  ]
  const variantGroup: GroupDefinition = {
    id: 'variant', label: product.variantLabel ?? 'Variante', selection: 'single', min: 1, max: 1,
    options: product.variants.map((variant) => ({ ...variant, source: variant.source ?? { kind: 'academic-mock', reference: 'Variante de demostración.' } })),
    defaultOptionIds: [],
  }

  function reviewConfiguration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (result.issues.length) {
      setReview({ locationId, message: 'Revisa las restricciones y corrige los campos indicados. La selección se conserva.' })
      const invalidIds = new Set(result.issues.map((issue) => issue.field === 'quantity' ? quantityId : issue.field === 'variant' ? variantFieldId
        : issue.groupId ? groupFieldId(issue.groupId) : 'configuration-errors'))
      const fieldId = [...stages.map((stage) => stage.id), quantityId].find((id) => invalidIds.has(id)) ?? 'configuration-errors'
      const field = document.getElementById(fieldId)
      const control = field?.querySelector<HTMLElement>('input:not([disabled])') ?? field
      control?.focus()
    } else {
      if (item) dispatch({ type: 'cart/edit', itemId: item.itemId, configuration, quantity: Number(quantity) })
      else dispatch({ type: 'cart/add', item: { itemId: crypto.randomUUID(), productId: product.id,
        configuration, quantity: Number(quantity), unitPriceCents: result.unitPriceCents! } })
      navigate('/pedido')
    }
  }

  return <>
    <div className="page-heading">
      <p className="eyebrow">{item ? 'Actualiza tu pedido' : 'Personaliza tu selección'}</p><h1>{item ? `Editar ${product.name}` : product.name}</h1>
      <p className="page-description">Revisa las opciones y su disponibilidad antes de continuar.</p>
    </div>
    <p className="catalog-notice"><strong>{product.source.kind === 'apf2' ? 'Producto y precio base del APF2.' : 'Producto mock académico.'}</strong> Las opciones identifican sus datos APF2 o mock. Disponibilidad simulada; no son ofertas comerciales vigentes.</p>
    <div className="config-location"><LocalSelector configurationContext={{ product, configuration, quantity: Number(quantity) }} /></div>
    <div className="customization-layout">
      <aside className="configured-product" aria-labelledby="product-summary-heading">
        <ProductImage image={product.image} />
        <div className="configured-product-body">
          <h2 id="product-summary-heading">Tu selección</h2><p>{product.description}</p>
          <p>Precio base: <strong>{formatPrice(product.basePriceCents)}</strong></p>
          {result.lines.length > 0 && <ul className="price-breakdown">{result.lines.map((line, index) => <li key={`${index}-${line.label}`}><span>{line.label}</span><span>{formatPrice(line.cents)}</span></li>)}</ul>}
          <div className="configured-total" role="status" aria-atomic="true">
            {result.totalCents !== null ? <><p>Por unidad: <strong>{formatPrice(result.unitPriceCents!)}</strong></p><p>Total para {quantity}: <strong>{formatPrice(result.totalCents)}</strong></p></>
              : <p>Corrige las restricciones para obtener un total válido.</p>}
          </div>
          <p className="control-help">La cantidad se aplica al precio completo de una unidad de producto o promoción. {item ? 'Los cambios se guardan al pulsar Guardar cambios.' : 'Tu selección se agrega al pulsar Agregar al pedido.'}</p>
        </div>
      </aside>
      <div className="customization-options">
        {!stock.available ? <section className="config-unavailable" aria-labelledby="unavailable-heading">
          <h2 id="unavailable-heading">Producto agotado en este local</h2><p>{stock.reason}</p>
          <AccessibleButton className="button--secondary" onClick={() => setAvailabilityTarget({ kind: 'product', label: product.name })}>Ver otros locales</AccessibleButton>
        </section> : <>
          <StepIndicator stages={stages} />
          <form className="configuration-form" onSubmit={reviewConfiguration} noValidate>
            <h2>Opciones del producto</h2>
            {product.variants.length > 0 && <OptionGroup group={variantGroup} fieldId={variantFieldId}
              selectedIds={configuration.variantId ? [configuration.variantId] : []}
              errors={result.issues.filter((issue) => issue.field === 'variant').map((issue) => issue.message)}
              availability={(id) => variantAvailability(product, id, locationId)}
              onChange={(ids) => { setConfiguration((previous) => ({ ...previous, variantId: ids[0] ?? null })); setReview(null) }}
              onViewLocations={(id, label) => setAvailabilityTarget({ kind: 'variant', id, label })} />}
            {product.optionGroups.map((group) => <OptionGroup key={group.id} group={group} fieldId={groupFieldId(group.id)}
              selectedIds={configuration.selections[group.id] ?? []}
              errors={result.issues.filter((issue) => issue.groupId === group.id).map((issue) => issue.message)}
              availability={(id) => optionAvailability(product, group.id, id, locationId)}
              onChange={(ids) => { setConfiguration((previous) => ({ ...previous, selections: { ...previous.selections, [group.id]: ids } })); setReview(null) }}
              onViewLocations={(id, label) => setAvailabilityTarget({ kind: 'option', groupId: group.id, id, label })} />)}
            <QuantitySelector id={quantityId} value={quantity} error={result.issues.find((issue) => issue.field === 'quantity')?.message}
              onChange={(value) => { setQuantity(value); setReview(null) }} />
            {result.issues.length > 0 && <section id="configuration-errors" tabIndex={-1} className="configuration-errors" aria-labelledby="configuration-errors-heading">
              <h2 id="configuration-errors-heading"><CircleAlert size={20} aria-hidden="true" /> Revisa tu selección</h2>
              <ul>{result.issues.map((issue, index) => <li key={`${index}-${issue.message}`}>{issue.message}</li>)}</ul>
            </section>}
            <div className="modal-actions">
              <AccessibleButton type="submit">{item ? 'Guardar cambios' : 'Agregar al pedido'}</AccessibleButton>
              <AccessibleButton className="button--secondary" onClick={() => { setConfiguration(defaultConfiguration(product)); setReview(null) }}>Restablecer opciones del producto</AccessibleButton>
            </div>
            <p role="alert">{visibleReview?.message ?? ''}</p>
          </form>
        </>}
      </div>
    </div>
    <Link className="text-link" to={item ? '/pedido' : '/menu'}>{item ? 'Cancelar edición y volver al pedido' : 'Volver al menú'}</Link>
    <AvailabilityDialog product={product} target={availabilityTarget} onClose={() => setAvailabilityTarget(null)} />
  </>
}
