import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { RefreshCw, ShieldOff } from "lucide-react";

const ExclusionsPage: React.FC = () => {
  const [exclusions, setExclusions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data, error } = await supabase.from("self_exclusions").select("*, profiles:user_id(full_name, email)").order("created_at", { ascending: false });
      if (error) throw error;
      setExclusions(data || []);
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleLift = async (id: string) => {
    await supabase.from("self_exclusions").update({ status: "lifted" }).eq("id", id);
    toast({ title: "Exclusion lifted" }); load();
  };

  return (
    <AdminPageShell title="Self Exclusions" description="Users who have requested self-exclusion." actions={<Button variant="outline" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>}>
      <Card className="border border-border/50 overflow-hidden"><CardContent className="p-0">
        {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-border/30 bg-secondary/30">
              {["User", "Reason", "Duration", "Until", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>{exclusions.map((e, i) => (
              <tr key={e.id} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-background/50" : "bg-background"}`}>
                <td className="px-4 py-3"><div className="font-medium">{e.profiles?.full_name || "—"}</div><div className="text-xs text-muted-foreground">{e.profiles?.email}</div></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{e.reason || "—"}</td>
                <td className="px-4 py-3 capitalize">{e.duration}</td>
                <td className="px-4 py-3 text-xs">{e.excluded_until ? new Date(e.excluded_until).toLocaleDateString() : "Permanent"}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${e.status === "active" ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}`}>{e.status?.toUpperCase()}</span></td>
                <td className="px-4 py-3">{e.status === "active" && <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleLift(e.id)}>Lift</Button>}</td>
              </tr>
            ))}</tbody>
          </table></div>
          )}
          {exclusions.length === 0 && <div className="text-center py-12 text-muted-foreground"><ShieldOff className="h-12 w-12 mx-auto opacity-20 mb-3" /><p>No exclusions</p></div>}
        </CardContent></Card>
    </AdminPageShell>
  );
};
export default ExclusionsPage;
