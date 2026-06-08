import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LiabilityBets = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Liability Management</h2>

      <Card>
        <CardHeader>
          <CardTitle>Liability Tracking</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No liability data available.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiabilityBets;
