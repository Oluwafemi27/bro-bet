import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Eye } from "lucide-react";

interface FraudAlert {
  id: string;
  user_id: string;
  pattern: string;
  risk_score: number;
  status: string;
  detected_at: string;
}

const FraudDetection: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const mockAlerts: FraudAlert[] = [
        { id: "1", user_id: "user-1", pattern: "Matched Betting", risk_score: 92, status: "flagged", detected_at: new Date().toISOString() },
        { id: "2", user_id: "user-2", pattern: "Multi-Account Network", risk_score: 87, status: "flagged", detected_at: new Date().toISOString() },
        { id: "3", user_id: "user-3", pattern: "Bonus Abuse", risk_score: 75, status: "reviewed", detected_at: new Date().toISOString() },
      ];
      setAlerts(mockAlerts);
    } catch (err: any) {
      toast({ title: "Error loading fraud alerts", variant: "destructive" });
    } finally {
      setLoading(false);
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
              <div key={alert.id} className="flex items-center justify-between p-4 border border-red-200/30 rounded-lg bg-red-50/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-foreground">{alert.pattern}</p>
                    <p className="text-xs text-muted-foreground">{alert.user_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">Risk: {alert.risk_score}%</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100/30 text-red-700 border border-red-200/50 font-bold">
                      {alert.status.toUpperCase()}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Review
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

export default FraudDetection;
