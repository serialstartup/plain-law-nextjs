import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ClauseAnalysis as Clause } from '@/lib/ai/types'

interface Props {
  clauses: Clause[]
}

export function ClauseAnalysis({ clauses }: Props) {
  return (
    <div className="space-y-4">
      {clauses.map((clause) => (
        <Card key={clause.number} className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-lg font-semibold">
              {clause.number}. {clause.title}
            </h4>
            <Badge variant={getRiskBadgeVariant(clause.riskLevel)}>
              {clause.riskLevel.toUpperCase()}
            </Badge>
          </div>

          <div className="bg-gray-50 p-4 rounded mb-4 italic text-sm">
            "{clause.text}"
          </div>

          <div className="space-y-3">
            <div>
              <span className="font-semibold text-sm">Risk Analysis:</span>
              <p className="text-gray-700 mt-1">{clause.description}</p>
            </div>
            <div>
              <span className="font-semibold text-sm">Recommendation:</span>
              <p className="text-gray-700 mt-1">{clause.recommendations}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function getRiskBadgeVariant(level: string) {
  switch (level) {
    case 'critical': return 'destructive'
    case 'high': return 'destructive'
    case 'medium': return 'default'
    default: return 'secondary'
  }
}