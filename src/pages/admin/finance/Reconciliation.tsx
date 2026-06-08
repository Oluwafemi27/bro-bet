import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Reconciliation = () => {
  const { toast } = useToast();

  const handleExportReport = () => {
    toast({ title: "Export Report", description: "Reconciliation report exported successfully" });
  };

  const handleRunReconciliation = () => {
    toast({ title: "Running Reconciliation", description: "This process may take a few minutes..." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Bank Reconciliation</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportReport}
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button
            className="gap-2"
            onClick={handleRunReconciliation}
          >
            <RefreshCw className="h-4 w-4" />
            Run Reconciliation
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reconciliation History</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No reconciliation data available yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reconciliation;
