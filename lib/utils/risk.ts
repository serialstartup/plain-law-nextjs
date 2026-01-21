import type { ContractAnalysis } from '@/lib/ai/types'

export type RiskVariant = 'default' | 'secondary' | 'destructive' | 'outline'

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

/**
 * Determines if a structural warning should be shown for this analysis
 */
export function shouldShowStructuralWarning(analysis: ContractAnalysis): boolean {
  return (
    analysis.analysisMeta?.structureQuality === 'poor' ||
    analysis.risk?.confidence === 'low' ||
    analysis.risk?.primaryDriver === 'structural'
  )
}

/**
 * Determines if the analysis is in structural-only mode
 * (no reliable legal risk assessment possible)
 */
export function isStructuralOnlyMode(analysis: ContractAnalysis): boolean {
  return (
    analysis.risk?.analysisMode === 'structural_only' ||
    analysis.risk?.legalScore === null ||
    (analysis.analysisMeta?.structureQuality === 'poor' &&
      analysis.risk?.primaryDriver === 'structural')
  )
}

export interface ConfidenceBadgeResult {
  label: string
  variant: RiskVariant
  icon: 'check' | 'minus' | 'alert'
}

/**
 * Returns confidence badge styling based on confidence level
 */
export function confidenceBadge(confidence: 'high' | 'medium' | 'low'): ConfidenceBadgeResult {
  switch (confidence) {
    case 'high':
      return { label: 'High Confidence', variant: 'secondary', icon: 'check' }
    case 'medium':
      return { label: 'Medium Confidence', variant: 'outline', icon: 'minus' }
    case 'low':
      return { label: 'Low Confidence', variant: 'destructive', icon: 'alert' }
  }
}

export interface StructureQualityResult {
  label: string
  variant: RiskVariant
}

/**
 * Returns styling for structure quality badge
 */
export function structureQualityBadge(quality: 'good' | 'fair' | 'poor'): StructureQualityResult {
  switch (quality) {
    case 'good':
      return { label: 'Good', variant: 'secondary' }
    case 'fair':
      return { label: 'Fair', variant: 'outline' }
    case 'poor':
      return { label: 'Poor', variant: 'destructive' }
  }
}

/**
 * Returns the primary driver label for risk display
 */
export function primaryDriverLabel(driver: 'legal' | 'structural' | 'both'): string {
  switch (driver) {
    case 'legal':
      return 'Legal Concerns'
    case 'structural':
      return 'Structural Defects'
    case 'both':
      return 'Legal + Structural'
  }
}
