import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";

const RiskAlerts = () => {
  const [alerts] = useState([
    {
      id: 1,
      type: "high_stake",
      message: "User placed ₦5M bet - verify legitimacy",
      severity: "high",
      user: "User #123",
      time: new Date(Date.now() - 15 * 60000),
    },
    {
      id: 2,
      type: "multi_account",
      message: "Detected 3 accounts from same IP",
      severity: "medium",
      user: "IP: 192.168.1.1",
      time: new Date(Date.now() - 30 * 60000),
    },
  ]);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Risk & Fraud Alerts</h2>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-5 w-5 ${alert.severity === "high" ? "text-red-600" : "text-amber-600"}`} />
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">{alert.user}</p>
                    <p className="text-xs text-muted-foreground">{alert.time.toLocaleTimeString()}</p>
                  </div>
                </div>
                <Button size="sm">Investigate</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RiskAlerts;
