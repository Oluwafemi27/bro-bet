import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data, error } = await supabase.from("agent_players").select("*, agents(code), profiles:player_id(full_name, email, balance)").order("created_at", { ascending: false });
      if (error) throw error;
      setPlayers(data || []);
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminPageShell title="Agent Players" description="Players referred by agents." actions={<Button variant="outline" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>}>
      <Card className="border border-border/50 overflow-hidden"><CardContent className="p-0">
        {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-border/30 bg-secondary/30">
              {["Player", "Email", "Agent Code", "Balance", "Joined"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>{players.map((p, i) => (
              <tr key={p.id} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-background/50" : "bg-background"}`}>
                <td className="px-4 py-3 font-medium">{p.profiles?.full_name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{p.profiles?.email}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.agents?.code}</td>
                <td className="px-4 py-3 font-bold">₦{Number(p.profiles?.balance || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table></div>
          )}
          {players.length === 0 && <div className="text-center py-12 text-muted-foreground"><p>No referred players found</p></div>}
        </CardContent></Card>
    </AdminPageShell>
  );
};
export default PlayersPage;
