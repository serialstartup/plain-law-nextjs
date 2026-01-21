
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fn'

interface ContractCardProps {
  contract: {
    id: string
    file_name: string
    status: string
    risk_score: number | null
    created_at: string
  }
}

export function ContractCard({ contract }: ContractCardProps) {
  return (
    <Link href={`/contracts/${contract.id}`}>
      <Card className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{contract.file_name}</h3>
            <p className="text-sm text-gray-500">
              {/* {formatDistanceToNow(new Date(contract.created_at), { addSuffix: true })} */}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {contract.status === 'analyzed' && contract.risk_score !== null && (
              <Badge variant={getRiskVariant(contract.risk_score)} className="text-lg px-3 py-1">
                {contract.risk_score}% Risk
              </Badge>
            )}

            {contract.status === 'analyzing' && (
              <Badge variant="outline">Analyzing...</Badge>
            )}

            {contract.status === 'uploaded' && (
              <Badge variant="secondary">Ready to analyze</Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

function getRiskVariant(score: number) {
  if (score >= 75) return 'destructive'
  if (score >= 50) return 'default'
  return 'secondary'
}