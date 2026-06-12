import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CheckCircle, XCircle, RefreshCw, Shield } from "lucide-react";

const KYCPage: React.FC = () => {
  const [kycs, setKycs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data, error } = await supabase.from("kyc_verifications").select("*, profiles:user_id(full_name, email)").order("created_at", { ascending: false });
      if (error) throw error;
      setKycs(data || []);
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const c = supabase.channel("kyc-rt").on("postgres_changes", { event: "*", schema: "public", table: "kyc_verifications" }, load).subscribe(); return () => { supabase.removeChannel(c); }; }, []);

  const handleUpdate = async (id: string, status: string) => {
    await supabase.from("kyc_verifications").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    toast({ title: `KYC ${status}` }); load();
  };

  const pending = kycs.filter(k => k.status === "pending").length;

  return (
    <AdminPageShell title="KYC Management" description={`${pending} pending verifications`} actions={<Button variant="outline" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>}>
      <Card className="border border-border/50 overflow-hidden"><CardContent className="p-0">
        {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-border/30 bg-secondary/30">
              {["User", "Document Type", "Status", "Submitted", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>{kycs.map((k, i) => (
              <tr key={k.id} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-background/50" : "bg-background"}`}>
                <td className="px-4 py-3"><div className="font-medium">{k.profiles?.full_name || "—"}</div><div className="text-xs text-muted-foreground">{k.profiles?.email}</div></td>
                <td className="px-4 py-3 capitalize">{k.document_type || "NIN / ID"}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${k.status === "approved" ? "bg-green-100 text-green-700 border-green-200" : k.status === "rejected" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>{k.status?.toUpperCase()}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(k.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">{k.status === "pending" && <div className="flex gap-2">
                  <Button size="sm" className="h-8 gap-1 bg-green-600 hover:bg-green-700 text-xs" onClick={() => handleUpdate(k.id, "approved")}><CheckCircle className="h-3.5 w-3.5" />Approve</Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1 border-red-200 text-red-600 text-xs" onClick={() => handleUpdate(k.id, "rejected")}><XCircle className="h-3.5 w-3.5" />Reject</Button>
                </div>}</td>
              </tr>
            ))}</tbody>
          </table></div>
          )}
          {kycs.length === 0 && <div className="text-center py-12 text-muted-foreground"><Shield className="h-12 w-12 mx-auto opacity-20 mb-3" /><p>No KYC submissions</p></div>}
        </CardContent></Card>
    </AdminPageShell>
  );
};
export default KYCPage;
