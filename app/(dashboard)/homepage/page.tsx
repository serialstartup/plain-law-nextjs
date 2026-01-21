import { uploadContract, getRecentContracts } from "@/actions/contract.actions";
import { UploadForm } from "../upload.form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText } from "lucide-react";
import { riskLabel } from "@/lib/utils/risk";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch recent contracts via server action
  const { contracts: recentContracts } = await getRecentContracts(5);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Analyze Your Contract</h1>
        <p className="text-muted-foreground">
          Upload your legal documents for instant risk identification, summary, and clause analysis. We ensure your data is secure.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 md:p-10">
          <UploadForm action={uploadContract} />
        </CardContent>
      </Card>

      {recentContracts && recentContracts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Analysis</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {recentContracts.map((c) => {
              const risk = riskLabel(c.risk_score as number | null)
              return (
                <Link key={c.id} href={`/contracts/${c.id}`} className="border rounded-lg p-4 hover:bg-accent/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground"><FileText className="size-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium truncate">{c.file_name}</p>
                        <Badge variant={risk.variant}>{risk.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{c.analyzed_at ? new Date(c.analyzed_at).toLocaleString() : 'Uploaded'}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
