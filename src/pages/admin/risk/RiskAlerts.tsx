import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RiskAlerts = () => {
  const { toast } = useToast();

  const handleFilterAlerts = () => {
    toast({ title: "Filter Alerts dialog not yet implemented", description: "This feature is coming soon." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Risk & Fraud Alerts</h2>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleFilterAlerts}
        >
          <Search className="h-4 w-4" /> Filter Alerts
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert Queue</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No risk alerts at this time.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAlerts;
