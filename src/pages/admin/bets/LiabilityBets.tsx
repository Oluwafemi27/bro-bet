import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

const LiabilityBets: React.FC = () => {
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from("bets").select("*, profiles:user_id(full_name, email)").eq("status", "pending").order("potential_win", { ascending: false }).limit(50);
        if (error) throw error;
        setBets(data || []);
      } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const totalLiability = bets.reduce((s, b) => s + Number(b.potential_win), 0);

  return (
    <AdminPageShell title="Liability Report" description={`Total exposure: ₦${totalLiability.toLocaleString()} on ${bets.length} pending bets`}>
      <Card className="border border-border/50 overflow-hidden"><CardContent className="p-0">
        {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-border/30 bg-secondary/30">{["User", "Stake", "Odds", "Max Liability", "Date"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>{bets.map((b, i) => (
              <tr key={b.id} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-background/50" : "bg-background"}`}>
                <td className="px-4 py-3"><div className="font-medium">{b.profiles?.full_name || b.profiles?.email || "—"}</div></td>
                <td className="px-4 py-3 font-bold">₦{Number(b.amount).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono">{Number(b.odds || 0).toFixed(2)}</td>
                <td className="px-4 py-3 font-bold text-red-600">₦{Number(b.potential_win).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table></div>
          )}
          {bets.length === 0 && <div className="text-center py-12 text-muted-foreground"><AlertTriangle className="h-12 w-12 mx-auto opacity-20 mb-3" /><p>No liability exposure</p></div>}
        </CardContent></Card>
    </AdminPageShell>
  );
};
export default LiabilityBets;
