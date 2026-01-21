import { openai } from './openai'
import { ANALYSIS_SYSTEM_PROMPT, createAnalysisPrompt } from './prompts'
import type { ContractAnalysis, AnalysisMeta, RiskAssessment } from './types'

function normalizeAnalysis(raw: Record<string, unknown>): ContractAnalysis {
  const analysis: ContractAnalysis = {
    riskScore: (raw.riskScore as number) ?? (raw.risk as RiskAssessment)?.overallScore ?? 0,
    executiveSummary: (raw.executiveSummary as string) ?? '',
    clauses: (raw.clauses as ContractAnalysis['clauses']) ?? [],
    criticalFlags: (raw.criticalFlags as string[]) ?? []
  }

  if (raw.analysisMeta) {
    const meta = raw.analysisMeta as Record<string, unknown>
    analysis.analysisMeta = {
      clauseCount: (meta.clauseCount as number) ?? analysis.clauses.length,
      structureQuality: (meta.structureQuality as AnalysisMeta['structureQuality']) ?? 'good',
      analysisReliability: (meta.analysisReliability as AnalysisMeta['analysisReliability']) ?? 'high',
      structuralIssues: (meta.structuralIssues as string[]) ?? []
    }
  }

  if (raw.risk) {
    const risk = raw.risk as Record<string, unknown>
    analysis.risk = {
      overallScore: (risk.overallScore as number) ?? analysis.riskScore,
      legalScore: risk.legalScore as number | null,
      structuralScore: (risk.structuralScore as number) ?? 0,
      confidence: (risk.confidence as RiskAssessment['confidence']) ?? 'high',
      primaryDriver: (risk.primaryDriver as RiskAssessment['primaryDriver']) ?? 'legal',
      analysisMode: (risk.analysisMode as RiskAssessment['analysisMode']) ?? 'full'
    }
  }

  return analysis
}

export async function analyzeTextChunks(fullText: string): Promise<ContractAnalysis> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
      { role: 'user', content: createAnalysisPrompt(fullText) }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('No analysis generated')

  const raw = JSON.parse(content) as Record<string, unknown>
  return normalizeAnalysis(raw)
}