export interface ClauseAnalysis {
  number: number
  title: string
  text: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendations: string
}

export interface ContractAnalysis {
  riskScore: number
  executiveSummary: string
  clauses: ClauseAnalysis[]
  criticalFlags: string[]
}