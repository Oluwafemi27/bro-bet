import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GamesPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Casino Games</h2>

      <Card>
        <CardHeader>
          <CardTitle>Available Games</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No games available yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamesPage;
