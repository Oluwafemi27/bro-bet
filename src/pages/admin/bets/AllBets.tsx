import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AllBets = () => {
  const { toast } = useToast();

  const handleViewDetails = () => {
    toast({ title: "View Details not yet implemented", description: "This feature is coming soon." });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">All Bets</h2>

      <Card>
        <CardHeader>
          <CardTitle>Bet History</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No bets to display.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllBets;
