import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle } from "lucide-react";

const ResponsibleGaming = () => {
  const [exclusions] = useState([
    {
      id: 1,
      user: "User #123",
      reason: "Self-exclusion",
      period: "30 days",
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60000),
    },
    {
      id: 2,
      user: "User #456",
      reason: "Admin-imposed",
      period: "1 year",
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60000),
    },
  ]);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Responsible Gaming</h2>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{exclusions.length}</p>
              <p className="text-sm text-muted-foreground">Active Exclusions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">12</p>
              <p className="text-sm text-muted-foreground">Pending KYC</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Exclusions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exclusions.map((exc) => (
              <div key={exc.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{exc.user}</p>
                    <p className="text-sm text-muted-foreground">{exc.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Period: {exc.period} (started {exc.startDate.toLocaleDateString()})
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Manage
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

export default ResponsibleGaming;
