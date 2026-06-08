import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AuditLogsSettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Audit Logs</h2>

      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>Audit logs will appear here as admin actions are performed.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsSettings;
