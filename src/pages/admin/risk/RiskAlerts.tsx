import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Search, ShieldAlert, ArrowRight } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

const RiskAlerts = () => {
  const [alerts] = useState([
    {
      id: 1,
      type: "high_stake",
      message: "User placed ₦5M bet - verify legitimacy",
      severity: "high",
      user: "User #123 (John Doe)",
      time: new Date(Date.now() - 15 * 60000),
      status: "pending"
    },
    {
      id: 2,
      type: "multi_account",
      message: "Detected 3 accounts from same IP",
      severity: "medium",
      user: "IP: 192.168.1.1",
      time: new Date(Date.now() - 30 * 60000),
      status: "pending"
    }
  ]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-l-red-600 bg-red-50/50 text-red-700";
      case "medium":
        return "border-l-amber-600 bg-amber-50/50 text-amber-700";
      default:
        return "border-l-blue-600 bg-blue-50/50 text-blue-700";
    }
  };

  return (
    <AdminPageShell
      title="Risk & Fraud Alerts"
      description="Monitor and investigate suspicious activity and high-risk operations."
      actions={
        <Button variant="outline" className="gap-2">
          <Search className="h-4 w-4" /> Filter Alerts
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
                <p className="text-2xl font-bold text-amber-600">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Investigating</p>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
              <Search className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className={`border-l-4 shadow-sm hover:shadow-md transition-all ${getSeverityStyles(alert.severity)}`}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === "high" ? "bg-red-100" : "bg-amber-100"
                  }`}>
                    <AlertTriangle className={`h-6 w-6 ${
                      alert.severity === "high" ? "text-red-600" : "text-amber-600"
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-none mb-1">{alert.message}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{alert.user}</span>
                      <span>{alert.time.toLocaleString()}</span>
                      <span className="capitalize px-2 py-0.5 rounded bg-secondary text-[10px] font-bold">
                        {alert.type.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center w-full md:w-auto">
                  <Button variant="secondary" size="sm" className="flex-1 md:flex-none gap-2">
                    Investigate <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <CheckCircle className="h-5 w-5 text-muted-foreground hover:text-green-600 transition-colors" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminPageShell>
  );
};

export default RiskAlerts;
