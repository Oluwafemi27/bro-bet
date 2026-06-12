import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { useToast } from "@/hooks/use-toast";

const SettledBets: React.FC = () => {
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from("bets").select("*, profiles:user_id(full_name, email)").in("status", ["won", "lost"]).order("created_at", { ascending: false }).limit(100);
        if (error) throw error;
        setBets(data || []);
      } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <AdminPageShell title="Settled Bets" description="Bets that have been won or lost.">
      <Card className="border border-border/50 overflow-hidden"><CardContent className="p-0">
        {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-border/30 bg-secondary/30">{["User", "Stake", "Odds", "Payout", "Result", "Date"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>{bets.map((b, i) => (
              <tr key={b.id} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-background/50" : "bg-background"}`}>
                <td className="px-4 py-3"><div className="font-medium">{b.profiles?.full_name || b.profiles?.email || "—"}</div><div className="text-xs text-muted-foreground">{b.profiles?.email}</div></td>
                <td className="px-4 py-3 font-bold">₦{Number(b.amount).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono">{Number(b.odds).toFixed(2)}</td>
                <td className="px-4 py-3 font-bold">{b.status === "won" ? <span className="text-green-600">₦{Number(b.potential_win).toLocaleString()}</span> : <span className="text-red-500">—</span>}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${b.status === "won" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>{b.status?.toUpperCase()}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table></div>
          )}
          {bets.length === 0 && <div className="text-center py-12 text-muted-foreground"><p>No settled bets</p></div>}
        </CardContent></Card>
    </AdminPageShell>
  );
};
export default SettledBets;
