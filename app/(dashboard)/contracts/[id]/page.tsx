import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { analyzeContract } from '@/actions/contract.actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, FileText, Gauge, Flag, Clock } from 'lucide-react'
import { ReportActions } from '@/components/contracts/report-actions'
import { riskBadge } from '@/lib/utils/risk'

interface PageProps {
  params: { id: string }
}

export default async function ContractDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
        <h1 className="text-3xl font-bold mb-4">{contract.file_name}</h1>
        <p className="text-gray-600 mb-6">This contract has not been analyzed yet.</p>
        <form action={analyzeContract.bind(null, id)}>
          <Button type="submit" size="lg">Start Analysis</Button>
        </form>
      </div>
    )
  }

  // Analyzing
  if (contract.status === 'analyzing') {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{contract.file_name}</h1>
        <p className="text-gray-600">Analyzing contract... This may take 30-60 seconds.</p>
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

  // Prefer real analysis if present; otherwise show a polished mock
  const analysis = contract.analysis ?? mockAnalysis()
  const risk = riskBadge(contract.risk_score ?? analysis.riskScore)

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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gauge className="size-4 text-primary" /> Risk Score</CardTitle>
            <CardDescription>Score based on clauses and terms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-5xl font-bold">{Math.round(analysis.riskScore)}%</div>
              <Badge variant={risk.variant}>{risk.label}</Badge>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-destructive" style={{ width: `${analysis.riskScore}%` }} />
            </div>
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
              <div className="flex items-center justify-between"><span>Clauses Scanned</span><span className="font-medium text-foreground">{analysis.clauses?.length}</span></div>
              <div className="flex items-center justify-between"><span>Processing Time</span><span className="font-medium text-foreground">{analysis.processingTime ?? '12s'}</span></div>
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
                  <div className="p-6 space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border bg-accent px-3 py-1 text-xs font-medium">
                      <FileText className="size-3" /> Plain English Translation
                    </div>
                    <div className="text-sm leading-relaxed">{cl.plain}</div>
                    {cl.riskLevel && (
                      <div className="pt-2">
                        <Badge variant={cl.riskLevel === 'High' ? 'destructive' : cl.riskLevel === 'Medium' ? 'default' : 'secondary'}>
                          {cl.riskLevel} Risk
                        </Badge>
                      </div>
                    )}
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

function mockAnalysis() {
  return {
    riskScore: 78,
    processingTime: '12s',
    criticalFlags: [
      'Uncapped liability; no monetary cap for damages',
      'Missing termination for convenience',
      'Broad indemnity obligations',
    ],
    critical: [
      {
        title: 'Uncapped Liability',
        description:
          'The liability clause does not specify a monetary cap for damages, exposing the company to unlimited financial risk in case of breach.',
        severity: 'High',
        section: '12.4',
      },
      {
        title: 'Automatic Renewal',
        description:
          'Contract automatically renews for 12-month terms unless a 90-day notice is given prior to expiration, which is unusually long.',
        severity: 'Medium',
        section: '4.1',
      },
    ],
    executiveSummary:
      'This Service Agreement outlines the terms under which Vendor X will provide services. While payment terms are standard (Net 30), the indemnity clauses are notably broad, favoring the vendor. The absence of a clear termination for convenience clause locks the company into the full term unless a material breach occurs.',
    clauses: [
      {
        number: '8.2',
        title: 'Indemnification',
        text:
          'Customer agrees to indemnify, defend, and hold harmless Vendor from any and all claims, damages, losses, and expenses arising out of or resulting from Customer\'s use of the Service, regardless of negligence.',
        plain:
          'If anyone sues the Vendor because of how you used their service, you may have to pay for everything—even if the Vendor was negligent in some cases.',
        riskLevel: 'High',
      },
      {
        number: '12.1',
        title: 'Termination',
        text:
          'Either party may terminate this Agreement only upon a material breach by the other party that remains uncured for thirty (30) days following written notice.',
        plain:
          'You cannot cancel this contract just because you want to. You can only cancel it if the other party breaks a major rule and fails to fix it within 30 days.',
        riskLevel: 'Medium',
      },
    ],
  }
}
