import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const FreebetsPage = () => {
  const { toast } = useToast();

  const handleIssueFreeBet = () => {
    toast({ title: "Issue Free Bet dialog not yet implemented", description: "This feature is coming soon." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Free Bets</h2>
        <Button onClick={handleIssueFreeBet}>Issue Free Bet</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Free Bets</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No free bets issued yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreebetsPage;
