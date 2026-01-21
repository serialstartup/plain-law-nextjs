export interface ClauseAnalysis {
  number: number | string
  title: string
  text: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical' | string
  description: string
  recommendations: string
  plain?: string
}

export interface AnalysisMeta {
  clauseCount: number
  structureQuality: 'good' | 'fair' | 'poor'
  analysisReliability: 'high' | 'medium' | 'low'
  structuralIssues?: string[]
}

export interface RiskAssessment {
  overallScore: number
  legalScore: number | null
  structuralScore: number
  confidence: 'high' | 'medium' | 'low'
  primaryDriver: 'legal' | 'structural' | 'both'
  analysisMode: 'full' | 'structural_only'
}

export interface ContractAnalysis {
  // Legacy fields (kept for backwards compatibility)
  riskScore: number
  executiveSummary: string
  clauses: ClauseAnalysis[]
  criticalFlags: string[]

  // New fields (optional for backwards compatibility)
  analysisMeta?: AnalysisMeta
  risk?: RiskAssessment
}