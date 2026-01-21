'use client'

import { Button } from '@/components/ui/button'
import { Copy, Share2, Download } from 'lucide-react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import type { ContractAnalysis, AnalysisMeta, RiskAssessment } from '@/lib/ai/types'
import { isStructuralOnlyMode } from '@/lib/utils/risk'

interface ReportActionsProps {
  contractId: string
  fileName: string
  analysis: ContractAnalysis & {
    clauses: Array<{
      number: string | number
      title: string
      text: string
      plain?: string
      riskLevel?: string
    }>
  }
}

export function ReportActions({ contractId, fileName, analysis }: ReportActionsProps) {
  const structuralOnly = isStructuralOnlyMode(analysis)

  const handleCopyReport = async () => {
    let reportText: string

    if (structuralOnly) {
      // STRUCTURAL-ONLY MODE: Different report format
      const clauseCount = analysis.analysisMeta?.clauseCount ?? analysis.clauses?.length ?? 0
      reportText = `
CONTRACT STRUCTURAL REVIEW
==========================
File: ${fileName}
Analysis Type: Structural Review Only (Full legal analysis not possible)

STRUCTURAL ASSESSMENT
---------------------
Document Quality: ${analysis.analysisMeta?.structureQuality ?? 'Unknown'}
Clauses Identified: ${clauseCount} (expected: 20-50)
Analysis Reliability: ${analysis.analysisMeta?.analysisReliability ?? 'Low'}
${analysis.analysisMeta?.structuralIssues?.length ? `Issues: ${analysis.analysisMeta.structuralIssues.join(', ')}` : ''}

LEGAL RISK SCORE: Not Available
Reason: Document structure prevents reliable legal risk assessment

SUMMARY
-------
${analysis.executiveSummary}

RECOMMENDED ACTIONS
-------------------
- Upload a revised version with clear formatting
- Request a clean draft from the other party
- Have a legal professional manually review the document
      `.trim()
    } else {
      // FULL ANALYSIS MODE: Original report format
      const overallScore = analysis.risk?.overallScore ?? analysis.riskScore

      // Build structural assessment section if available
      let structuralSection = ''
      if (analysis.analysisMeta || analysis.risk) {
        structuralSection = `
STRUCTURAL ASSESSMENT
---------------------
Document Structure: ${analysis.analysisMeta?.structureQuality ?? 'N/A'}
Analysis Reliability: ${analysis.analysisMeta?.analysisReliability ?? 'N/A'}
Confidence: ${analysis.risk?.confidence ?? 'N/A'}
Primary Risk Driver: ${analysis.risk?.primaryDriver ?? 'N/A'}
${analysis.risk ? `Legal Score: ${analysis.risk.legalScore != null ? analysis.risk.legalScore + '%' : 'N/A'}
Structural Score: ${analysis.risk.structuralScore}%` : ''}
${analysis.analysisMeta?.structuralIssues?.length ? `Structural Issues: ${analysis.analysisMeta.structuralIssues.join(', ')}` : ''}
`
      }

      reportText = `
CONTRACT ANALYSIS REPORT
========================
File: ${fileName}
Risk Score: ${overallScore}%
${structuralSection}
EXECUTIVE SUMMARY
-----------------
${analysis.executiveSummary}

CRITICAL FLAGS
--------------
${analysis.criticalFlags.map((f, i) => `${i + 1}. ${f}`).join('\n')}

CLAUSE ANALYSIS
---------------
${analysis.clauses.map(c => `
[${c.number}] ${c.title}
Original: ${c.text}
Plain English: ${c.plain || 'N/A'}
Risk: ${c.riskLevel || 'N/A'}
`).join('\n')}
      `.trim()
    }

    try {
      await navigator.clipboard.writeText(reportText)
      toast.success('Report copied to clipboard')
    } catch {
      toast.error('Failed to copy report')
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/contracts/${contractId}`
    const overallScore = analysis.risk?.overallScore ?? analysis.riskScore
    const shareData = {
      title: `Contract Analysis: ${fileName}`,
      text: `Risk Score: ${overallScore}% - ${analysis.executiveSummary.slice(0, 100)}...`,
      url: shareUrl
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard')
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('Failed to share')
      }
    }
  }

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF()
      let y = 20

      if (structuralOnly) {
        // STRUCTURAL-ONLY MODE: Different PDF format
        const clauseCount = analysis.analysisMeta?.clauseCount ?? analysis.clauses?.length ?? 0

        // Title
        doc.setFontSize(18)
        doc.text('Contract Structural Review', 20, y)
        y += 10

        // File name and analysis type
        doc.setFontSize(12)
        doc.text(`File: ${fileName}`, 20, y += 10)
        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.text('Analysis Type: Structural Review Only (Full legal analysis not possible)', 20, y += 7)
        doc.setTextColor(0)

        // Structural Assessment
        doc.setFontSize(14)
        doc.text('Structural Assessment', 20, y += 15)
        doc.setFontSize(10)
        doc.text(`Document Quality: ${analysis.analysisMeta?.structureQuality ?? 'Unknown'}`, 25, y += 7)
        doc.text(`Clauses Identified: ${clauseCount} (expected: 20-50)`, 25, y += 7)
        doc.text(`Analysis Reliability: ${analysis.analysisMeta?.analysisReliability ?? 'Low'}`, 25, y += 7)
        if (analysis.analysisMeta?.structuralIssues?.length) {
          const issuesText = `Issues: ${analysis.analysisMeta.structuralIssues.join(', ')}`
          const issueLines = doc.splitTextToSize(issuesText, 165)
          doc.text(issueLines, 25, y += 7)
          y += (issueLines.length - 1) * 5
        }

        // Legal Risk Score
        doc.setFontSize(14)
        doc.text('Legal Risk Score', 20, y += 15)
        doc.setFontSize(12)
        doc.setTextColor(100)
        doc.text('Not Available', 25, y += 7)
        doc.setFontSize(9)
        doc.text('Reason: Document structure prevents reliable legal risk assessment', 25, y += 7)
        doc.setTextColor(0)

        // Summary
        doc.setFontSize(14)
        doc.text('Summary', 20, y += 15)
        doc.setFontSize(10)
        const summaryLines = doc.splitTextToSize(analysis.executiveSummary, 170)
        doc.text(summaryLines, 20, y += 7)
        y += summaryLines.length * 5

        // Recommended Actions
        doc.setFontSize(14)
        doc.text('Recommended Actions', 20, y += 15)
        doc.setFontSize(10)
        doc.text('1. Upload a revised version with clear formatting', 25, y += 7)
        doc.text('2. Request a clean draft from the other party', 25, y += 7)
        doc.text('3. Have a legal professional manually review the document', 25, y += 7)
      } else {
        // FULL ANALYSIS MODE: Original PDF format
        const overallScore = analysis.risk?.overallScore ?? analysis.riskScore

        // Title
        doc.setFontSize(18)
        doc.text('Contract Analysis Report', 20, y)
        y += 10

        // File name and risk score
        doc.setFontSize(12)
        doc.text(`File: ${fileName}`, 20, y += 10)
        doc.text(`Risk Score: ${overallScore}%`, 20, y += 7)

        // Structural Assessment (if available)
        if (analysis.analysisMeta || analysis.risk) {
          doc.setFontSize(14)
          doc.text('Structural Assessment', 20, y += 15)
          doc.setFontSize(10)
          if (analysis.analysisMeta?.structureQuality) {
            doc.text(`Document Structure: ${analysis.analysisMeta.structureQuality}`, 25, y += 7)
          }
          if (analysis.risk?.confidence) {
            doc.text(`Confidence: ${analysis.risk.confidence}`, 25, y += 7)
          }
          if (analysis.risk?.primaryDriver) {
            doc.text(`Primary Risk Driver: ${analysis.risk.primaryDriver}`, 25, y += 7)
          }
          if (analysis.risk) {
            doc.text(`Legal Score: ${analysis.risk.legalScore != null ? analysis.risk.legalScore + '%' : 'N/A'}`, 25, y += 7)
            doc.text(`Structural Score: ${analysis.risk.structuralScore}%`, 25, y += 7)
          }
          if (analysis.analysisMeta?.structuralIssues?.length) {
            const issuesText = `Issues: ${analysis.analysisMeta.structuralIssues.join(', ')}`
            const issueLines = doc.splitTextToSize(issuesText, 165)
            doc.text(issueLines, 25, y += 7)
            y += (issueLines.length - 1) * 5
          }
        }

        // Executive Summary
        doc.setFontSize(14)
        doc.text('Executive Summary', 20, y += 15)
        doc.setFontSize(10)
        const summaryLines = doc.splitTextToSize(analysis.executiveSummary, 170)
        doc.text(summaryLines, 20, y += 7)
        y += summaryLines.length * 5

        // Critical Flags
        if (analysis.criticalFlags.length > 0) {
          doc.setFontSize(14)
          doc.text('Critical Flags', 20, y += 10)
          doc.setFontSize(10)
          analysis.criticalFlags.forEach((flag, i) => {
            if (y > 270) { doc.addPage(); y = 20 }
            const flagLines = doc.splitTextToSize(`${i + 1}. ${flag}`, 165)
            doc.text(flagLines, 25, y += 7)
            y += (flagLines.length - 1) * 5
          })
        }

        // Clause Analysis
        doc.setFontSize(14)
        doc.text('Clause Analysis', 20, y += 15)
        analysis.clauses.forEach(clause => {
          if (y > 250) { doc.addPage(); y = 20 }

          doc.setFontSize(11)
          doc.text(`[${clause.number}] ${clause.title}`, 20, y += 10)

          doc.setFontSize(9)
          doc.setTextColor(100)
          const textLines = doc.splitTextToSize(`Original: ${clause.text}`, 165)
          doc.text(textLines, 25, y += 6)
          y += textLines.length * 4

          if (y > 270) { doc.addPage(); y = 20 }

          doc.setTextColor(0)
          const plainLines = doc.splitTextToSize(`Plain English: ${clause.plain || 'N/A'}`, 165)
          doc.text(plainLines, 25, y += 4)
          y += plainLines.length * 4

          if (clause.riskLevel) {
            doc.text(`Risk Level: ${clause.riskLevel}`, 25, y += 4)
          }
          y += 5
        })
      }

      const safeName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')
      doc.save(`${safeName}-analysis.pdf`)
      toast.success('PDF downloaded')
    } catch {
      toast.error('Failed to generate PDF')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="gap-2" onClick={handleCopyReport}>
        <Copy className="size-4" /> Copy Report
      </Button>
      <Button variant="outline" className="gap-2" onClick={handleShare}>
        <Share2 className="size-4" /> Share
      </Button>
      <Button className="gap-2" onClick={handleDownloadPdf}>
        <Download className="size-4" /> Download PDF
      </Button>
    </div>
  )
}
