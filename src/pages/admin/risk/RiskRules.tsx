import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Rule {
  id: string;
  name: string;
  description: string;
  criteria: any;
  action: string;
  is_active: boolean;
  created_at: string;
}

const RiskRules: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("risk_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (err: any) {
      toast({ title: "Error loading rules", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();

    const channel = supabase
      .channel("risk-rules-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "risk_rules" },
        () => {
          loadRules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleRule = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("risk_rules")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: `Rule ${!currentStatus ? 'enabled' : 'disabled'} successfully` });
    } catch (err: any) {
      toast({ title: "Error updating rule", description: err.message, variant: "destructive" });
    }
  };

  const deleteRule = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    try {
      const { error } = await supabase.from("risk_rules").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Rule deleted successfully" });
    } catch (err: any) {
      toast({ title: "Error deleting rule", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Risk Rules Engine</h1>
        <Button
          className="gap-2"
          onClick={() => toast({ title: "New Rule dialog not yet implemented", description: "This feature is coming soon." })}
        >
          <Plus className="h-4 w-4" />
          New Rule
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Active Rules</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-6">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border border-border/30 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{rule.name}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>Criteria: {JSON.stringify(rule.criteria)}</span>
                    <span>Action: {rule.action}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleRule(rule.id, rule.is_active)}
                    className="h-10 w-10"
                  >
                    {rule.is_active ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10"
                    onClick={() => toast({ title: "Edit Rule dialog not yet implemented", description: "This feature is coming soon." })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-10 w-10 text-red-600 hover:text-red-700"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskRules;
