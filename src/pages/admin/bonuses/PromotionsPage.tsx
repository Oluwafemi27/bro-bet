import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PromotionsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Promotions</h2>
        <Button>Create Promotion</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Promotions</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No promotions configured yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionsPage;
