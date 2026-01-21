import { getContractsList, getUserQuota } from '@/actions/contract.actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, FileText, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { riskLabel } from '@/lib/utils/risk'

export default async function ContractsPage(props: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string; dir?: string }>
}) {
  const searchParams = await props.searchParams
  const q = (searchParams?.q ?? '').toString().trim()
  const page = Math.max(1, parseInt((searchParams?.page ?? '1').toString(), 10) || 1)
  const sortParam = (searchParams?.sort ?? 'date').toString() as 'date' | 'risk'
  const dirParam = (searchParams?.dir ?? 'desc').toString() as 'asc' | 'desc'
  const pageSize = 5

  // Fetch data via server actions
  const [contractsResult, quotaResult] = await Promise.all([
    getContractsList({ search: q, sort: sortParam, dir: dirParam, page, pageSize }),
    getUserQuota()
  ])

  const { contracts, count } = contractsResult
  const { quota: profile } = quotaResult

  const quotaLimit = profile?.quota_limit ?? 0
  const quotaUsed = profile?.quota_used ?? 0
  const quotaPct = quotaLimit ? (quotaUsed / quotaLimit) * 100 : 0

  return (
    <div className="w-full max-w-none">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Right content */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analysis History</CardTitle>
                  <CardDescription>Manage and view your past contract assessments.</CardDescription>
                </div>
                <Link href="/homepage"><Button>Analyze New Contract</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-3 mb-4">
                <form className="relative max-w-sm w-full" action="/contracts" method="get">
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    placeholder="Search contracts..."
                    className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                  />
                  <input type="hidden" name="sort" value={sortParam} />
                  <input type="hidden" name="dir" value={dirParam} />
                </form>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Contract Name</TableHead>
                    <SortableHead label="Risk Assessment" sortKey="risk" currentKey={sortParam} dir={dirParam} q={q} />
                    <SortableHead label="Date Processed" sortKey="date" currentKey={sortParam} dir={dirParam} q={q} className="whitespace-nowrap" />
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts?.map((c) => {
                    const risk = riskLabel(c.risk_score as number | null)
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="text-muted-foreground"><FileText className="size-4" /></TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/contracts/${c.id}`} className="hover:underline">
                            {c.file_name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={risk.variant}>{risk.label}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.analyzed_at ? new Date(c.analyzed_at).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Actions"><MoreVertical className="size-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/contracts/${c.id}`}><DropdownMenuItem>View details</DropdownMenuItem></Link>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                {!contracts?.length && (
                  <TableCaption>No contracts yet. Upload your first contract to get started.</TableCaption>
                )}
              </Table>

              <PaginationFooter
                count={count ?? 0}
                pageSize={pageSize}
                page={page}
                q={q}
                sort={sortParam}
                dir={dirParam}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: string }) {
  if (!active) return <ArrowUpDown className="size-4 text-muted-foreground" />
  return dir === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />
}

function SortableHead({ label, sortKey, currentKey, dir, q, className }: { label: string; sortKey: string; currentKey: string; dir: string; q: string; className?: string }) {
  const active = currentKey === sortKey
  const nextDir = active && dir === 'asc' ? 'desc' : 'asc'
  return (
    <TableHead className={className}>
      <Link
        href={{ pathname: '/contracts', query: { q: q || undefined, sort: sortKey, dir: nextDir, page: '1' } }}
        className="inline-flex items-center gap-1 hover:underline"
      >
        {label}
        <SortIcon active={active} dir={dir} />
      </Link>
    </TableHead>
  )
}

function PaginationFooter({ count, pageSize, page, q, sort, dir }: { count: number; pageSize: number; page: number; q: string; sort: string; dir: string }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const start = count === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, count)
  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
      <span>
        {count === 0 ? 'No results' : `Showing ${start}-${end} of ${count} results`}
      </span>
      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <Button variant="outline" size="sm" disabled>Previous</Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={{ pathname: '/contracts', query: { q: q || undefined, sort, dir, page: String(page - 1) } }}>Previous</Link>
          </Button>
        )}
        {nextDisabled ? (
          <Button variant="outline" size="sm" disabled>Next</Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={{ pathname: '/contracts', query: { q: q || undefined, sort, dir, page: String(page + 1) } }}>Next</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
