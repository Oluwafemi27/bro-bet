import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ExclusionsPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Self-Exclusions</h2>

      <Card>
        <CardHeader>
          <CardTitle>Excluded Users</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No self-exclusions on file.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExclusionsPage;
