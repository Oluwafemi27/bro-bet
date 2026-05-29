import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FraudAlert {
  id: string;
  user_id: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  created_at: string;
}

const FraudDetection: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("fraud_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err: any) {
      toast({ title: "Error loading fraud alerts", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    const channel = supabase
      .channel("fraud-alerts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fraud_alerts" },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateAlertStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("fraud_alerts")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: `Alert marked as ${newStatus}` });
    } catch (err: any) {
      toast({ title: "Error updating alert", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Fraud Detection System</h1>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Detected Fraud Patterns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-6">
            {alerts.map((alert) => (
              <div key={alert.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                alert.severity === 'critical' || alert.severity === 'high' ? 'border-red-200 bg-red-50/30' : 'border-amber-200 bg-amber-50/30'
              }`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${alert.severity === 'critical' || alert.severity === 'high' ? 'text-red-600' : 'text-amber-600'}`} />
                  <div>
                    <p className="font-semibold text-foreground">{alert.type}</p>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">User: {alert.user_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${alert.severity === 'critical' || alert.severity === 'high' ? 'text-red-600' : 'text-amber-600'}`}>
                      {alert.severity.toUpperCase()}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-background/50 border font-bold">
                      {alert.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {alert.status === 'pending' && (
                      <Button size="sm" variant="outline" className="h-8 text-xs bg-green-50 text-green-700 border-green-200" onClick={() => updateAlertStatus(alert.id, 'resolved')}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Resolve
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-8 gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto opacity-20 mb-3 text-green-600" />
                <p>No fraud alerts found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudDetection;
