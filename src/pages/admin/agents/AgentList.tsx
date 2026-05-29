import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, DollarSign, Loader2, Ban, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

interface Agent {
  id: string;
  commission_rate: number;
  total_earnings: number;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AgentList: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("agents")
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (err: any) {
      toast({ title: "Error loading agents", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();

    const channel = supabase
      .channel("agents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agents" },
        () => {
          loadAgents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("agents")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: `Agent ${newStatus} successfully` });
    } catch (err: any) {
      toast({ title: "Error updating status", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminPageShell
      title="Agents & Affiliates"
      description="Manage platform agents and their commission structures."
      actions={
        <Button className="gap-2 bg-primary">
          <UserPlus className="h-4 w-4" /> Add Agent
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payouts</p>
                <p className="text-2xl font-bold">₦{agents.reduce((sum, a) => sum + Number(a.total_earnings), 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Agent List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 bg-secondary/30">
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Agent Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Rate</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Earnings</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, idx) => (
                    <tr
                      key={agent.id}
                      className={`border-b border-border/20 transition-colors duration-200 ${
                        idx % 2 === 0 ? "bg-background/50" : "bg-background"
                      } hover:bg-primary/5`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{agent.profiles?.full_name || "Unknown Agent"}</div>
                        <div className="text-xs text-muted-foreground">{agent.profiles?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono">{(Number(agent.commission_rate) * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4 font-semibold text-green-600">₦{Number(agent.total_earnings).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          agent.status === "active"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }`}>
                          {agent.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {agent.status === 'active' ? (
                            <Button size="sm" variant="outline" className="h-8 gap-1 text-red-600 border-red-200" onClick={() => handleStatusChange(agent.id, 'suspended')}>
                              <Ban className="h-3.5 w-3.5" /> Suspend
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-8 gap-1 text-green-600 border-green-200" onClick={() => handleStatusChange(agent.id, 'active')}>
                              <CheckCircle className="h-3.5 w-3.5" /> Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
};

export default AgentList;
