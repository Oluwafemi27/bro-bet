import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CampaignsPage = () => {
  const { toast } = useToast();

  const handleCreateCampaign = () => {
    toast({ title: "Create Campaign dialog not yet implemented", description: "This feature is coming soon." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Campaigns</h2>
        <Button onClick={handleCreateCampaign}>Create Campaign</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketing Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No campaigns created yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignsPage;
