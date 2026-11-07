import { useAppState } from '../../hooks/useAppState.ts'
import { LiveAnnouncement } from '../accessibility/LiveAnnouncement.tsx'
import { AccessibleButton } from './AccessibleButton.tsx'
import './Toaster.css'

export function Toaster() {
  const { state, dispatch } = useAppState()
  function dismiss(id: string) {
    const index = state.toasts.findIndex((toast) => toast.id === id)
    const next = state.toasts[index + 1] ?? state.toasts[index - 1]
    dispatch({ type: 'toast/dismiss', toastId: id })
    requestAnimationFrame(() => (document.getElementById(next ? `dismiss-${next.id}` : 'contenido-principal'))?.focus({ preventScroll: true }))
  }
  return <>
    <LiveAnnouncement message={state.cartAnnouncement} sequence={state.notificationSequence} />
    {state.toasts.length > 0 && <section className="toaster container" aria-label="Avisos del pedido">
      <ul>{state.toasts.map((toast) => <li key={toast.id} className="toast">
        <p>{toast.message}</p>
        <div className="toast-actions">
          {toast.removed && <AccessibleButton className="button--secondary" aria-label={`Deshacer: ${toast.message}`}
            onClick={() => {
              dispatch({ type: 'cart/undo', toastId: toast.id })
              // The activated Undo control disappears; keep focus within this notice.
              requestAnimationFrame(() => document.getElementById(`dismiss-${toast.id}`)?.focus({ preventScroll: true }))
            }}>Deshacer</AccessibleButton>}
          <AccessibleButton id={`dismiss-${toast.id}`} className="button--secondary" aria-label={`Cerrar aviso: ${toast.message}`}
            onClick={() => dismiss(toast.id)}>Cerrar aviso</AccessibleButton>
        </div>
      </li>)}</ul>
    </section>}
  </>
}
