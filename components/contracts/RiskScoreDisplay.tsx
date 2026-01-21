import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface Props {
  score: number
}

export function RiskScoreDisplay({ score }: Props) {
  const variant = score >= 75 ? 'destructive' : score >= 50 ? 'default' : 'secondary'
  const label = score >= 75 ? 'High Risk' : score >= 50 ? 'Medium Risk' : 'Low Risk'

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Risk Assessment</h3>
        <Badge variant={variant} className="text-2xl px-4 py-2">
          {score}% {label}
        </Badge>
      </div>
      <Progress value={score} className="h-4" />
      <p className="text-sm text-gray-600 mt-2">
        Score based on liability caps, termination clauses, and indemnity terms.
      </p>
    </Card>
  )
}