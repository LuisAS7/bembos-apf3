import { Check } from 'lucide-react'
import type { ConfigurationStage } from './progress.ts'

export function StepIndicator({ stages, current, completed, onBack, label = 'Etapas de personalización' }: { stages: ConfigurationStage[]; current: number; completed: boolean[]; onBack: (index: number) => void; label?: string }) {
  return <nav aria-label={label}><ol className="config-steps">
    {stages.map((stage, index) => <li key={stage.id} aria-current={index === current ? 'step' : undefined} data-state={index === current ? 'current' : completed[index] ? 'completed' : 'pending'}>
      <button type="button" disabled={index > current} onClick={() => onBack(index)}>
        <span className="step-number" aria-hidden="true">{completed[index] && index !== current ? <Check size={16} /> : index + 1}</span>
        <span>{stage.kind === 'summary' && stage.id === 'summary' ? 'Cantidad' : stage.label}<small>{index === current ? 'Actual' : completed[index] ? 'Completado' : 'Pendiente'}</small></span>
      </button>
    </li>)}
  </ol></nav>
}
