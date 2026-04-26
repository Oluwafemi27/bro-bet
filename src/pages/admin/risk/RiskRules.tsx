import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface Rule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  created_at: string;
}

const RiskRules: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const mockRules: Rule[] = [
        { id: "1", name: "High Stake Alert", trigger: "Bet > ₦5M", action: "Flag for review", enabled: true, created_at: new Date().toISOString() },
        { id: "2", name: "Rapid Win Pattern", trigger: "3 wins in 10 mins", action: "Increase scrutiny", enabled: true, created_at: new Date().toISOString() },
        { id: "3", name: "Multi-Account Detector", trigger: "Same IP, 2+ accounts", action: "Auto-limit", enabled: true, created_at: new Date().toISOString() },
        { id: "4", name: "VPN Block", trigger: "VPN detected", action: "Deny access", enabled: false, created_at: new Date().toISOString() },
      ];
      setRules(mockRules);
    } catch (err: any) {
      toast({ title: "Error loading rules", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (id: string, enabled: boolean) => {
    try {
      toast({ title: `Rule ${enabled ? "enabled" : "disabled"}` });
      loadRules();
    } catch (err: any) {
      toast({ title: "Error updating rule", variant: "destructive" });
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Risk Rules Engine</h1>
        <Button className="gap-2">
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
                    <span>Trigger: {rule.trigger}</span>
                    <span>Action: {rule.action}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleRule(rule.id, !rule.enabled)}
                    className="h-10 w-10"
                  >
                    {rule.enabled ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-10 w-10">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-10 w-10 text-red-600 hover:text-red-700">
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
