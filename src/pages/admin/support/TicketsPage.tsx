import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TicketsPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Support Tickets</h2>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Queue</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No support tickets at this time.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsPage;
