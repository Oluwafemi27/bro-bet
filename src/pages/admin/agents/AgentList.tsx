import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Search, RefreshCw, UserCheck, TrendingUp, Users, DollarSign } from "lucide-react";

interface Agent { id: string; user_id: string; code: string; status: string; commission_rate: number; total_players: number; total_earnings: number; created_at: string; profiles?: { full_name: string; email: string }; }

const AgentList: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filtered, setFiltered] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data, error } = await supabase.from("agents").select("*, profiles:user_id(full_name, email)").order("created_at", { ascending: false });
      if (error) throw error;
      setAgents(data || []);
    } catch (err: any) { toast({ title: "Error loading agents", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const c = supabase.channel("agents-rt").on("postgres_changes", { event: "*", schema: "public", table: "agents" }, load).subscribe(); return () => { supabase.removeChannel(c); }; }, []);
  useEffect(() => { setFiltered(search ? agents.filter(a => a.profiles?.email?.toLowerCase().includes(search.toLowerCase()) || a.code?.toLowerCase().includes(search.toLowerCase())) : agents); }, [search, agents]);

  const toggleStatus = async (id: string, status: string) => {
    const newStatus = status === "active" ? "suspended" : "active";
    await supabase.from("agents").update({ status: newStatus }).eq("id", id);
    toast({ title: `Agent ${newStatus}` }); load();
  };

  const totalEarnings = agents.reduce((s, a) => s + Number(a.total_earnings), 0);
  const totalPlayers = agents.reduce((s, a) => s + Number(a.total_players), 0);

  return (
    <AdminPageShell title="Agents & Affiliates" description="Manage your agent network and affiliate program."
      actions={<Button variant="outline" className="gap-2" onClick={load}><RefreshCw className="h-4 w-4" />Refresh</Button>}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ label: "Total Agents", value: agents.length, icon: <UserCheck className="h-6 w-6 text-blue-500" /> },
            { label: "Active", value: agents.filter(a => a.status === "active").length, icon: <TrendingUp className="h-6 w-6 text-green-500" /> },
            { label: "Total Players", value: totalPlayers, icon: <Users className="h-6 w-6 text-purple-500" /> },
            { label: "Total Earnings", value: `₦${totalEarnings.toLocaleString()}`, icon: <DollarSign className="h-6 w-6 text-amber-500" /> }]
            .map(s => <Card key={s.label}><CardContent className="pt-6"><div className="flex justify-between items-center">{s.icon}<div className="text-right"><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div></div></CardContent></Card>)}
        </div>

        <Card className="border border-border/50"><CardContent className="pt-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by email or code..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardContent></Card>

        <Card className="border border-border/50 overflow-hidden"><CardContent className="p-0">
          {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b border-border/30 bg-secondary/30">
                {["Agent", "Code", "Commission", "Players", "Earnings", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody>{filtered.map((a, i) => (
                <tr key={a.id} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-background/50" : "bg-background"} hover:bg-primary/5`}>
                  <td className="px-4 py-3"><div className="font-medium">{a.profiles?.full_name || a.profiles?.email || "—"}</div><div className="text-xs text-muted-foreground">{a.profiles?.email}</div></td>
                  <td className="px-4 py-3 font-mono text-xs font-bold">{a.code}</td>
                  <td className="px-4 py-3">{a.commission_rate}%</td>
                  <td className="px-4 py-3">{a.total_players}</td>
                  <td className="px-4 py-3 font-mono">₦{Number(a.total_earnings).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${a.status === "active" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>{a.status?.toUpperCase()}</span></td>
                  <td className="px-4 py-3"><Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toggleStatus(a.id, a.status)}>{a.status === "active" ? "Suspend" : "Activate"}</Button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
            {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><UserCheck className="h-12 w-12 mx-auto opacity-20 mb-3" /><p>No agents found</p></div>}
          </CardContent></Card>
      </div>
    </AdminPageShell>
  );
};
export default AgentList;
