import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../hooks/useAppState.ts'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'

export function ConfirmOrderButton({ attemptId }: { attemptId: string }) {
  const { confirmOrder } = useAppState()
  const navigate = useNavigate()
  const submitting = useRef(false)
  const [error, setError] = useState('')
  return <div className="confirm-order-action">
    <p>Revisa el resumen antes de confirmar.</p>
    <AccessibleButton onClick={() => {
      if (submitting.current) return
      submitting.current = true
      const result = confirmOrder(attemptId)
      if (result.ok) navigate(`/confirmacion/${encodeURIComponent(result.receipt.orderId)}`, { replace: true })
      else { setError(result.message); submitting.current = false }
    }}>Confirmar pedido</AccessibleButton>
    <p role="alert">{error}</p>
  </div>
}
