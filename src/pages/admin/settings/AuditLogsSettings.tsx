import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { useToast } from "@/hooks/use-toast";
import { Search, RefreshCw, FileText } from "lucide-react";

const AuditLogsSettings: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data, error } = await supabase.from("admin_activity_logs").select("*, profiles:user_id(full_name, email)").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setFiltered(search ? logs.filter(l => l.action?.toLowerCase().includes(search.toLowerCase()) || l.profiles?.email?.toLowerCase().includes(search.toLowerCase())) : logs); }, [search, logs]);

  return (
    <AdminPageShell title="Audit Logs" description="Track all admin actions on the platform." actions={<Button variant="outline" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>}>
      <div className="space-y-4">
        <Card className="border border-border/50"><CardContent className="pt-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardContent></Card>
        <Card className="border border-border/50 overflow-hidden"><CardContent className="p-0">
          {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b border-border/30 bg-secondary/30">{["Admin", "Action", "Target", "Date"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
              <tbody>{filtered.map((l, i) => (
                <tr key={l.id} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-background/50" : "bg-background"}`}>
                  <td className="px-4 py-3"><div className="font-medium">{l.profiles?.full_name || "System"}</div><div className="text-xs text-muted-foreground">{l.profiles?.email}</div></td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-secondary font-bold">{l.action}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{l.target || l.details || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
            {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto opacity-20 mb-3" /><p>No audit logs</p></div>}
          </CardContent></Card>
      </div>
    </AdminPageShell>
  );
};
export default AuditLogsSettings;
