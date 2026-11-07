import { CircleCheck, Info, CircleAlert, TriangleAlert, X } from 'lucide-react'
import type { NotificationEntry } from './notificationPlan.ts'
import { AccessibleButton } from './AccessibleButton.tsx'

export function ToastNotice({ notice, onUndo, onDismiss }: { notice: NotificationEntry; onUndo: () => void; onDismiss: () => void }) {
  const Icon = notice.kind === 'error' ? CircleAlert : notice.kind === 'warning' ? TriangleAlert : notice.kind === 'info' ? Info : CircleCheck
  return <div className="brand-toast" data-kind={notice.kind ?? 'success'}>
    <Icon size={22} aria-hidden="true" /><div className="brand-toast-content"><p>{notice.message}</p>
      {notice.removed && <AccessibleButton className="button--text toast-undo" aria-label={`Deshacer: ${notice.message}`} onClick={onUndo}>Deshacer</AccessibleButton>}
    </div>
    <AccessibleButton id={`dismiss-${notice.id}`} data-toast-dismiss className="toast-close" aria-label={`Cerrar aviso: ${notice.message}`} onClick={onDismiss}><X size={20} aria-hidden="true" /></AccessibleButton>
  </div>
}
