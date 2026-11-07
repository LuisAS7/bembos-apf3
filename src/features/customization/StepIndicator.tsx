export function StepIndicator({ stages }: { stages: Array<{ id: string; label: string }> }) {
  return <nav aria-label="Etapas de personalización"><ol className="config-steps">
    {stages.map((stage, index) => <li key={stage.id}><a href={`#${stage.id}`}><span aria-hidden="true">{index + 1}</span>{stage.label}</a></li>)}
  </ol></nav>
}
