import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Search, Gamepad2, RefreshCw } from "lucide-react";

const GamesPage: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data, error } = await supabase.from("casino_games").select("*, casino_providers(name)").order("created_at", { ascending: false });
      if (error) throw error;
      setGames(data || []);
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setFiltered(search ? games.filter(g => g.name?.toLowerCase().includes(search.toLowerCase())) : games); }, [search, games]);

  const toggleStatus = async (id: string, status: string) => {
    const newStatus = status === "active" ? "inactive" : "active";
    await supabase.from("casino_games").update({ status: newStatus }).eq("id", id);
    load();
  };

  return (
    <AdminPageShell title="Casino Games" description={`${games.length} games`} actions={<Button variant="outline" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>}>
      <div className="space-y-4">
        <Card className="border border-border/50"><CardContent className="pt-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search games..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardContent></Card>
        <Card className="border border-border/50 overflow-hidden"><CardContent className="p-0">
          {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b border-border/30 bg-secondary/30">{["Game", "Provider", "Category", "RTP", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
              <tbody>{filtered.map((g, i) => (
                <tr key={g.id} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-background/50" : "bg-background"}`}>
                  <td className="px-4 py-3 font-medium">{g.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{g.casino_providers?.name || "—"}</td>
                  <td className="px-4 py-3 capitalize">{g.category}</td>
                  <td className="px-4 py-3">{g.rtp ? `${g.rtp}%` : "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${g.status === "active" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>{g.status?.toUpperCase()}</span></td>
                  <td className="px-4 py-3"><Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toggleStatus(g.id, g.status)}>{g.status === "active" ? "Disable" : "Enable"}</Button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
            {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><Gamepad2 className="h-12 w-12 mx-auto opacity-20 mb-3" /><p>No games found</p></div>}
          </CardContent></Card>
      </div>
    </AdminPageShell>
  );
};
export default GamesPage;
