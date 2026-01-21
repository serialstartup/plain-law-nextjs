'use client'

import { Button } from '@/components/ui/button'
import { Copy, Share2, Download } from 'lucide-react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'

interface ReportActionsProps {
  contractId: string
  fileName: string
  analysis: {
    riskScore: number
    executiveSummary: string
    criticalFlags: string[]
    clauses: Array<{
      number: string
      title: string
      text: string
      plain: string
      riskLevel?: string
    }>
  }
}

export function ReportActions({ contractId, fileName, analysis }: ReportActionsProps) {
  const handleCopyReport = async () => {
    const reportText = `
CONTRACT ANALYSIS REPORT
========================
File: ${fileName}
Risk Score: ${analysis.riskScore}%

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
Plain English: ${c.plain}
Risk: ${c.riskLevel || 'N/A'}
`).join('\n')}
    `.trim()

    try {
      await navigator.clipboard.writeText(reportText)
      toast.success('Report copied to clipboard')
    } catch {
      toast.error('Failed to copy report')
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/contracts/${contractId}`
    const shareData = {
      title: `Contract Analysis: ${fileName}`,
      text: `Risk Score: ${analysis.riskScore}% - ${analysis.executiveSummary.slice(0, 100)}...`,
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

      // Title
      doc.setFontSize(18)
      doc.text('Contract Analysis Report', 20, y)
      y += 10

      // File name and risk score
      doc.setFontSize(12)
      doc.text(`File: ${fileName}`, 20, y += 10)
      doc.text(`Risk Score: ${analysis.riskScore}%`, 20, y += 7)

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
        const plainLines = doc.splitTextToSize(`Plain English: ${clause.plain}`, 165)
        doc.text(plainLines, 25, y += 4)
        y += plainLines.length * 4

        if (clause.riskLevel) {
          doc.text(`Risk Level: ${clause.riskLevel}`, 25, y += 4)
        }
        y += 5
      })

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
