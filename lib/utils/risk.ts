export type RiskVariant = 'default' | 'secondary' | 'destructive'

export interface RiskLabelResult {
  label: string
  variant: RiskVariant
  tone?: string
}

/**
 * Returns risk label based on score (0-100)
 * - High Risk: 70+
 * - Medium Risk: 40-69
 * - Low Risk: 0-39
 * - Pending: null/undefined
 */
export function riskLabel(score: number | null | undefined): RiskLabelResult {
  if (score == null) {
    return { label: 'Pending', variant: 'secondary', tone: 'text-muted-foreground' }
  }
  if (score >= 70) {
    return { label: 'High Risk', variant: 'destructive', tone: 'text-red-600' }
  }
  if (score >= 40) {
    return { label: 'Medium Risk', variant: 'default', tone: 'text-amber-600' }
  }
  return { label: 'Low Risk', variant: 'secondary', tone: 'text-emerald-600' }
}

/**
 * Alias for riskLabel - returns same structure
 */
export const riskBadge = riskLabel
