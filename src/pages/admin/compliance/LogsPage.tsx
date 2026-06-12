import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { RefreshCw, FileText } from "lucide-react";

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data, error } = await supabase.from("compliance_logs").select("*, profiles:user_id(full_name, email)").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminPageShell title="Compliance Logs" description="Audit trail of all compliance-related actions." actions={<Button variant="outline" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>}>
      <Card className="border border-border/50 overflow-hidden"><CardContent className="p-0">
        {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-border/30 bg-secondary/30">
              {["User", "Action", "Details", "Date"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>{logs.map((l, i) => (
              <tr key={l.id} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-background/50" : "bg-background"}`}>
                <td className="px-4 py-3"><div className="font-medium">{l.profiles?.full_name || "System"}</div><div className="text-xs text-muted-foreground">{l.profiles?.email}</div></td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-secondary font-bold">{l.action}</span></td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{l.details || "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table></div>
          )}
          {logs.length === 0 && <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto opacity-20 mb-3" /><p>No compliance logs</p></div>}
        </CardContent></Card>
    </AdminPageShell>
  );
};
export default LogsPage;
