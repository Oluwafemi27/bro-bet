import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PlayersPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Agent Players</h2>

      <Card>
        <CardHeader>
          <CardTitle>Players by Agent</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No player data available.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayersPage;
