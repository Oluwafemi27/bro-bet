import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LiveBets = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Live Bets</h2>

      <Card>
        <CardHeader>
          <CardTitle>Active Bets</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No live bets at this time.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveBets;
