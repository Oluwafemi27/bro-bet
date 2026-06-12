import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { RefreshCw, CheckCircle } from "lucide-react";

const CommissionsPage: React.FC = () => {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data, error } = await supabase.from("agent_commissions").select("*, agents(code, profiles:user_id(full_name, email))").order("created_at", { ascending: false });
      if (error) throw error;
      setCommissions(data || []);
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handlePay = async (id: string) => {
    await supabase.from("agent_commissions").update({ status: "paid" }).eq("id", id);
    toast({ title: "Commission marked as paid" }); load();
  };

  const pending = commissions.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.amount), 0);

  return (
    <AdminPageShell title="Agent Commissions" description={`Pending payout: ₦${pending.toLocaleString()}`}
      actions={<Button variant="outline" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>}>
      <Card className="border border-border/50 overflow-hidden"><CardContent className="p-0">
        {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-border/30 bg-secondary/30">
              {["Agent", "Code", "Amount", "Type", "Period", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>{commissions.map((c, i) => (
              <tr key={c.id} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-background/50" : "bg-background"} hover:bg-primary/5`}>
                <td className="px-4 py-3">{c.agents?.profiles?.full_name || c.agents?.profiles?.email || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.agents?.code}</td>
                <td className="px-4 py-3 font-bold text-green-600">₦{Number(c.amount).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{c.type}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{c.period || "—"}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${c.status === "paid" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>{c.status?.toUpperCase()}</span></td>
                <td className="px-4 py-3">{c.status === "pending" && <Button size="sm" className="h-8 text-xs gap-1" onClick={() => handlePay(c.id)}><CheckCircle className="h-3.5 w-3.5" />Pay</Button>}</td>
              </tr>
            ))}</tbody>
          </table></div>
          )}
          {commissions.length === 0 && <div className="text-center py-12 text-muted-foreground"><p>No commissions found</p></div>}
        </CardContent></Card>
    </AdminPageShell>
  );
};
export default CommissionsPage;
