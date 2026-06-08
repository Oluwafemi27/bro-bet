import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LogsPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Compliance Logs</h2>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No compliance logs available.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsPage;
