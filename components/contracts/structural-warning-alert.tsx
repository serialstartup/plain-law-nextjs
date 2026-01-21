import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Upload, MessageSquare } from 'lucide-react'
import type { ContractAnalysis } from '@/lib/ai/types'

interface StructuralWarningAlertProps {
  analysis: ContractAnalysis
}

export function StructuralWarningAlert({ analysis }: StructuralWarningAlertProps) {
  const meta = analysis.analysisMeta
  const risk = analysis.risk

  if (!meta || meta.structureQuality !== 'poor') {
    return null
  }

  const issues = meta.structuralIssues ?? []
  const clauseCount = meta.clauseCount ?? analysis.clauses.length

  return (
    <Alert variant="destructive" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <AlertCircle className="size-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        Contract Structure Alert
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <p className="mb-3">This contract has major structural issues that affect analysis reliability.</p>

        {(issues.length > 0 || clauseCount < 3) && (
          <div className="mb-3">
            <p className="font-medium mb-1">Issues Detected:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {clauseCount < 3 && (
                <li>Only {clauseCount} clause{clauseCount !== 1 ? 's' : ''} could be identified</li>
              )}
              {issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-3 p-3 rounded-md bg-amber-100 dark:bg-amber-900/30 text-sm">
          <p className="font-medium mb-1">Why this matters:</p>
          <p>
            Document structure issues make it difficult to accurately assess legal risk.
            The risk score may be inflated due to structural problems rather than actual legal concerns.
          </p>
        </div>

        {risk?.primaryDriver === 'structural' && (
          <p className="mb-3 text-sm font-medium">
            Note: Legal risk score may be inflated due to structural defects
          </p>
        )}

        <div>
          <p className="font-medium mb-2">Suggested Actions:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Upload className="size-4" />
              <span>Upload a revised version with clear formatting</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              <span>Request a clean draft from the other party</span>
            </li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}
