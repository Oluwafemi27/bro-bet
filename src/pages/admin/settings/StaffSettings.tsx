import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Plus, Trash2, X, UserCog } from "lucide-react";

const ROLES = ["support", "finance", "risk", "admin"];

const StaffSettings: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "support", department: "" });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    try {
      const { data, error } = await supabase.from("staff").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setStaff(data || []);
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.email) return toast({ title: "Name and email required", variant: "destructive" });
    try {
      const { error } = await supabase.from("staff").insert({ ...form, status: "active" });
      if (error) throw error;
      toast({ title: "Staff member added" }); setShowForm(false); setForm({ name: "", email: "", role: "support", department: "" }); load();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const handleRemove = async (id: string) => {
    await supabase.from("staff").delete().eq("id", id);
    toast({ title: "Staff member removed" }); load();
  };

  return (
    <AdminPageShell title="Staff Management" description="Manage staff accounts and permissions."
      actions={<Button className="gap-2" onClick={() => setShowForm(!showForm)}>{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showForm ? "Cancel" : "Add Staff"}</Button>}>
      <div className="space-y-6">
        {showForm && (
          <Card className="border border-primary/30">
            <CardHeader><CardTitle>New Staff Member</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Full Name</Label><Input className="mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input className="mt-1" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Role</Label><select className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>{ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}</select></div>
                <div><Label>Department</Label><Input className="mt-1" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
              </div>
              <Button className="w-full" onClick={handleAdd}>Add Staff Member</Button>
            </CardContent>
          </Card>
        )}

        <Card className="border border-border/50 overflow-hidden"><CardContent className="p-0">
          {loading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b border-border/30 bg-secondary/30">{["Name", "Email", "Role", "Department", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
              <tbody>{staff.map((s, i) => (
                <tr key={s.id} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-background/50" : "bg-background"}`}>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3 capitalize"><span className="text-xs px-2 py-0.5 rounded bg-secondary font-bold">{s.role}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{s.department || "—"}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-bold border bg-green-100 text-green-700 border-green-200">{s.status?.toUpperCase()}</span></td>
                  <td className="px-4 py-3"><Button size="sm" variant="ghost" className="h-8 text-red-500" onClick={() => handleRemove(s.id)}><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
            {staff.length === 0 && <div className="text-center py-12 text-muted-foreground"><UserCog className="h-12 w-12 mx-auto opacity-20 mb-3" /><p>No staff members</p></div>}
          </CardContent></Card>
      </div>
    </AdminPageShell>
  );
};
export default StaffSettings;
