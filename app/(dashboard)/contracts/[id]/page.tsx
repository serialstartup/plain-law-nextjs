import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { analyzeContract } from '@/actions/contract.actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, FileText, Gauge, Flag, Clock, AlertCircle } from 'lucide-react'
import { ReportActions } from '@/components/contracts/report-actions'
import { StructuralWarningAlert } from '@/components/contracts/structural-warning-alert'
import { StartAnalysisForm } from '@/components/contracts/start-analysis-form'
import {
  riskBadge,
  shouldShowStructuralWarning,
  isStructuralOnlyMode,
  structureQualityBadge,
  primaryDriverLabel
} from '@/lib/utils/risk'
import type { ContractAnalysis } from '@/lib/ai/types'
//import { riskLabel } from '@/lib/utils/risk'

// Extended analysis type that includes mock/UI-specific fields
interface ExtendedAnalysis extends ContractAnalysis {
  processingTime?: string
  critical?: Array<{
    title: string
    description: string
    severity: string
    section?: string
  }>
}

interface PageProps {
  params: { id: string }
}

export default async function ContractDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // const risk = riskLabel(c.risk_score as number | null)
  const { data: contract } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!contract) notFound()

  // Not analyzed yet
  if (contract.status === 'uploaded') {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{contract.file_name}</h1>
        <p className="text-muted-foreground mb-6">This contract has not been analyzed yet.</p>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-4">Start analysis to generate a plain-language summary, highlight risks, and get recommendations.</p>
          <StartAnalysisForm action={analyzeContract.bind(null, id)} />
          <p className="mt-3 text-xs text-muted-foreground">Estimated time: 15–60 seconds depending on file size.</p>
        </div>
      </div>
    )
  }

  // Analyzing
  if (contract.status === 'analyzing') {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{contract.file_name}</h1>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <div>
              <p className="font-medium">Analyzing your document…</p>
              <p className="text-sm text-muted-foreground">Extracting text, identifying clauses, and assessing risk. Estimated 15–60s.</p>
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    )
  }

  // Failed state
  if (contract.status === 'failed') {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{contract.file_name}</h1>
        <p className="text-red-600 mb-6">Analysis failed. Please try again.</p>
        <form action={analyzeContract.bind(null, id)}>
          <Button type="submit" size="lg">Retry Analysis</Button>
        </form>
      </div>
    )
  }

  // Use only real analysis; avoid mock data
  const analysis = contract.analysis as ExtendedAnalysis | null

  // If analysis is missing despite not being in an upload/analyzing/failed state
  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{contract.file_name}</h1>
        <p className="text-gray-600 mb-6">No analysis found for this contract.</p>
        <form action={analyzeContract.bind(null, id)}>
          <Button type="submit" size="lg">Run Analysis</Button>
        </form>
      </div>
    )
  }
  const structuralOnly = isStructuralOnlyMode(analysis)
  const riskInfo = riskBadge(contract.risk_score ?? analysis.risk?.overallScore ?? analysis.riskScore)
  const showStructuralWarning = shouldShowStructuralWarning(analysis)
  const hasLowConfidence = analysis.risk?.confidence === 'low'
  const clauseCount = analysis.analysisMeta?.clauseCount ?? analysis.clauses?.length ?? 0

  // STRUCTURAL-ONLY MODE: Completely different UI
  if (structuralOnly) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{contract.file_name || 'Service Agreement - Vendor X'}</h1>
            <p className="text-sm text-muted-foreground">Analyzed {contract.analyzed_at ? new Date(contract.analyzed_at).toLocaleString() : 'Just now'}</p>
          </div>
          <ReportActions
            contractId={id}
            fileName={contract.file_name || 'Contract'}
            analysis={analysis}
          />
        </div>

        {/* Primary Alert - Full Width */}
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertCircle className="size-5" />
              Contract Not Ready for Legal Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700 dark:text-amber-300">
            <p className="mb-4">
              We could not reliably assess legal risk due to major structural defects in the document.
            </p>
            {analysis.analysisMeta?.structuralIssues && analysis.analysisMeta.structuralIssues.length > 0 && (
              <div className="mb-4">
                <p className="font-medium mb-2">Issues Detected:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {clauseCount < 3 && (
                    <li>Only {clauseCount} clause{clauseCount !== 1 ? 's' : ''} could be identified (expected: 20-50)</li>
                  )}
                  {analysis.analysisMeta.structuralIssues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Structural Assessment + Legal Risk (Not Available) */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Structural Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Document Quality</span>
                  
                  <Badge variant="destructive">
                    {analysis.analysisMeta?.structureQuality === 'poor' ? 'Poor' : 'Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Clauses Identified</span>
                  <span className="font-medium">{clauseCount} <span className="text-muted-foreground text-xs">(expected: 20-50)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reliability</span>
                  <span className="font-medium text-amber-600">Low</span>
                </div>
                {analysis.risk?.structuralScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Structural Score</span>
                    <span className="font-medium">{analysis.risk.structuralScore}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="size-4 text-muted-foreground" />
                Legal Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                Not Available
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Insufficient clause-level data for reliable legal risk assessment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Executive Summary</h2>
          <Card>
            <CardContent className="p-6">
              <p className="leading-relaxed text-foreground/90">{analysis.executiveSummary}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">1</span>
                </div>
                <span>Upload a revised version with clear formatting and well-defined clause boundaries</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">2</span>
                </div>
                <span>Request a clean draft from the other party in a standard document format</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">3</span>
                </div>
                <span>Have a legal professional manually review the document</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* NO Critical Flags section */}
        {/* NO Clause Analysis section */}
      </div>
    )
  }

  // FULL ANALYSIS MODE: Normal UI
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Structural Warning - shown prominently at top when needed */}
      {showStructuralWarning && <StructuralWarningAlert analysis={analysis} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">{contract.file_name || 'Service Agreement - Vendor X'}</h1>
          <p className="text-sm text-muted-foreground">Analyzed {contract.analyzed_at ? new Date(contract.analyzed_at).toLocaleString() : 'Just now'}</p>
        </div>
        <ReportActions
          contractId={id}
          fileName={contract.file_name || 'Contract'}
          analysis={analysis}
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={hasLowConfidence ? 'border-amber-500/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="size-4 text-primary" />
              Risk Score
              {hasLowConfidence && <AlertCircle className="size-4 text-amber-500" />}
            </CardTitle>
            <CardDescription>Score based on clauses and terms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-5xl font-bold">
                {Math.round(analysis.risk?.overallScore ?? analysis.riskScore)}%
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={riskInfo.variant}>{riskInfo.label}</Badge>
                {analysis.risk?.confidence && (
                  
                  <Badge
                    variant={analysis.risk.confidence === 'low' ? 'outline' : 'secondary'}
                    className={`text-xs ${analysis.risk.confidence === 'low' ? 'border-amber-500 text-amber-600' : ''}`}
                  >
                    {analysis.risk.confidence} confidence
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${hasLowConfidence ? 'bg-amber-500' : 'bg-destructive'}`}
                style={{ width: `${analysis.risk?.overallScore ?? analysis.riskScore}%` }}
              />
            </div>
            {/* Separated scores when available */}
            {analysis.risk && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Legal:</span>
                  <span className="font-medium text-foreground">
                    {analysis.risk.legalScore != null ? `${analysis.risk.legalScore}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Structural:</span>
                  <span className="font-medium text-foreground">{analysis.risk.structuralScore}%</span>
                </div>
              </div>
            )}
            {/* Primary driver indicator */}
            {analysis.risk?.primaryDriver && analysis.risk.primaryDriver !== 'legal' && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Primary: {primaryDriverLabel(analysis.risk.primaryDriver)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flag className="size-4 text-primary" /> Critical Flags</CardTitle>
            <CardDescription>{analysis.criticalFlags?.length} Issues Found</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {analysis.criticalFlags.slice(0, 3).map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-foreground/80">
                  <AlertTriangle className="mt-0.5 size-4 text-destructive" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="size-4 text-primary" /> Analysis Status</CardTitle>
            <CardDescription>Complete</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2 text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Clauses Scanned</span>
                <span className="font-medium text-foreground">
                  {analysis.analysisMeta?.clauseCount ?? analysis.clauses?.length}
                </span>
              </div>
              {analysis.analysisMeta?.structureQuality && (
                <div className="flex items-center justify-between">
                  <span>Document Structure</span>
                  <Badge
                    variant={structureQualityBadge(analysis.analysisMeta.structureQuality).variant}
                    className="text-xs"
                  >
                    {structureQualityBadge(analysis.analysisMeta.structureQuality).label}
                  </Badge>
                </div>
              )}
              {analysis.analysisMeta?.analysisReliability && (
                <div className="flex items-center justify-between">
                  <span>Reliability</span>
                  <span className="font-medium text-foreground capitalize">
                    {analysis.analysisMeta.analysisReliability}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Red Flags Section */}
      {analysis.critical?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-primary font-semibold">1</span>
            <h2 className="text-xl font-semibold">Critical Red Flags</h2>
          </div>
          <div className="space-y-3">
            {analysis.critical.map((item: any, idx: number) => (
              <div key={idx} className="rounded-xl border bg-destructive/5 border-destructive/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="size-4" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{item.description}</p>
                  </div>
                  <div className="shrink-0">
                    <Badge variant={item.severity === 'High' ? 'destructive' : 'default'}>{item.severity} Severity</Badge>
                  </div>
                </div>
                {item.section && (
                  <div className="mt-2 text-xs text-muted-foreground">Section {item.section}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Executive Summary */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Executive Summary</h2>
        <Card>
          <CardContent className="p-6">
            <p className="leading-relaxed text-foreground/90">{analysis.executiveSummary}</p>
          </CardContent>
        </Card>
      </div>

      {/* Clause Analysis */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Clause Analysis</h2>
        <div className="grid gap-4">
          {analysis.clauses.map((cl: any, i: number) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-6 border-r">
                    <div className="text-xs text-muted-foreground mb-2">Section {cl.number} — {cl.title}</div>
                    <div className="rounded-md bg-muted/40 p-4 text-sm text-foreground/80 whitespace-pre-wrap">{cl.text}</div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full border bg-accent px-3 py-1 text-xs font-medium">
                        <FileText className="size-3" /> Plain Language
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-medium text-foreground/80">Why it matters</div>
                      <div className="text-sm leading-relaxed text-foreground/90">
                        {cl.riskDescription ?? cl.description ?? 'No risk description provided.'}
                      </div>
                    </div>

                    {cl.recommendations && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-foreground/80">What to do</div>
                        {Array.isArray(cl.recommendations) ? (
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {cl.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm leading-relaxed">{cl.recommendations}</div>
                        )}
                      </div>
                    )}

                    {(() => {
                      // Robust, case-insensitive mapping + numeric fallback
                      let score: number | null = null
                      const level = typeof cl.riskLevel === 'string' ? cl.riskLevel.toLowerCase() : ''
                      if (level === 'critical') score = 95
                      else if (level === 'high') score = 85
                      else if (level === 'medium') score = 55
                      else if (level === 'low') score = 20
                      else if (typeof (cl as any).riskScore === 'number') score = (cl as any).riskScore as number

                      const badge = riskBadge(score)
                      return (
                        <div className="pt-2">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
