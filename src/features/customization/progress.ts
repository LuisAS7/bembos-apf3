import type { Product, ProductConfiguration } from '../../domain/models.ts'
import type { ConfigurationIssue, ConfigurationResult } from './configuration.ts'

export interface ConfigurationStage { id: string; label: string; fieldId: string; kind: 'variant' | 'group' | 'summary'; groupId?: string }
export interface ConfigurationProgress { current: number; reviewed: Record<string, string> }
export function configurationStages(product: Product): ConfigurationStage[] {
  return [
    ...(product.variants.length ? [{ id: 'variant', label: product.variantLabel ?? 'Variante', fieldId: `variant-${product.id}`, kind: 'variant' as const }] : []),
    ...product.optionGroups.map((group) => ({ id: `group-${group.id}`, label: group.label, fieldId: `group-${product.id}-${group.id}`, kind: 'group' as const, groupId: group.id })),
    { id: 'summary', label: 'Cantidad y resumen', fieldId: `quantity-${product.id}`, kind: 'summary' },
  ]
}
export function issuesForStage(stage: ConfigurationStage, result: ConfigurationResult): ConfigurationIssue[] {
  return result.issues.filter((issue) => issue.field === 'product' || (stage.kind === 'variant' && issue.field === 'variant') ||
    (stage.kind === 'group' && issue.groupId === stage.groupId) || (stage.kind === 'summary' && ['quantity', 'configuration'].includes(issue.field)))
}
function signature(stage: ConfigurationStage, configuration: ProductConfiguration, quantity: string, locationId: string): string {
  const value = stage.kind === 'variant' ? configuration.variantId : stage.kind === 'group' ? configuration.selections[stage.groupId!] : { configuration, quantity }
  return JSON.stringify({ locationId, value })
}
export function inspectProgress(stages: ConfigurationStage[], progress: ConfigurationProgress, configuration: ProductConfiguration, quantity: string, locationId: string, result: ConfigurationResult) {
  const completed = stages.map((stage) => progress.reviewed[stage.id] === signature(stage, configuration, quantity, locationId) && !issuesForStage(stage, result).length)
  const requested = Math.min(progress.current, stages.length - 1)
  const earlierPending = completed.findIndex((done, index) => index < requested && !done)
  const current = earlierPending >= 0 ? earlierPending : requested
  return { completed, current, canSubmit: current === stages.length - 1 && completed.slice(0, -1).every(Boolean) && !result.issues.length }
}
export function advanceProgress(stages: ConfigurationStage[], progress: ConfigurationProgress, configuration: ProductConfiguration, quantity: string, locationId: string, result: ConfigurationResult) {
  const inspected = inspectProgress(stages, progress, configuration, quantity, locationId, result)
  const stage = stages[inspected.current]
  const issues = issuesForStage(stage, result)
  if (issues.length) return { progress, issues, ready: false }
  const reviewed = { ...progress.reviewed, [stage.id]: signature(stage, configuration, quantity, locationId) }
  return { progress: { current: Math.min(inspected.current + 1, stages.length - 1), reviewed }, issues,
    ready: inspected.canSubmit }
}
